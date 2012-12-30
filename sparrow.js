Offers = new Meteor.Collection("offers")

Meteor.methods({
  editOffer: function (type, options) {
    options = options || {}
    if (options.name.length < 5)
      throw new Meteor.Error(400, "Offer name is too short")

    if (type === 'insert') {
      return Offers.insert({
        owner: this.userId,
        name: options.name,
        price: options.price,
        loc: [],
        createdAt: (moment().unix() * 1000),
        updatedAt: (moment().unix() * 1000),
        votes: 0
      })
    }
    else if (type === 'update') {
      return Offers.update({
        owner: this.userId },
        {$set: {
          name: options.name,
          price: options.price,
          updatedAt: (moment().unix() * 1000)
        }
      })
    }
  }
})

if (Meteor.isClient) {

  Meteor.Router.add({
    '/': 'index',
    '/account': 'account'
  })

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  })

  Meteor.subscribe("offers")
  Meteor.subscribe("allUserData")

  Template.index.getOffers = function () {
    return Offers.find({}, {sort: {votes: -1}})
  }

  Template.index.events({
    'click .upvote': function(event, template) {
      var parent = $(event.currentTarget).parent()
        , selection = parent.attr('id')
        , user = Meteor.user()
        , users = Meteor.users

      if (parent.hasClass("voted") || _.contains(user.votes, selection)) {
        return false
      } else {
        users.update({_id: user._id}, {$push: {votes:selection}})
        Offers.update(selection, {$inc: {votes: 1}})
      }
    }
  });

  Template.index.styleDate = function (date) {
    return moment(date).fromNow()
  }

  // Template.offer.checkVote = function (selection) {
  //   var user = Meteor.user()
  //     , users = Meteor.users

  //   if (_.contains(user.votes, selection)) {
  //     return true
  //   }
  // }

  // Template.myOffer.events({
  //   'click .save' : function (event, tmpl) {
  //     var name = $("span.name").text()
  //       , price = $("span.price").text()
  //       , type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'

  //     Meteor.call('editOffer', type, {
  //       name: name,
  //       price: price
  //     }, function (error) {
  //       if (error)
  //         Session.set('showStatus', error.reason)
  //       else
  //         Session.set('showStatus', "Success!")
  //     })
  //   },
  //   'click .offer span': function (event, tmpl) {
  //     var target = $(event.target)
  //       , attr = target.attr('class')
  //       , val = this[attr]

  //     $(tmpl.find("label")).text(attr)
  //     $(tmpl.find("input.text")).attr('id', attr).val(val)

  //   },
  //   'keyup input.text': function (event, tmpl) {
  //     var target = $(event.currentTarget)
  //       , attr = target.attr('id')
  //       , val = target.val()

  //     $("span."+attr).text(val)
  //   }
  // })

  // Template.myOffer.message = function () {
  //   return Session.get('showStatus')
  // }

  // Template.myOffer.showStatus = function () {
  //   return Session.get('showStatus')
  // }
  // Template.myOffer.offer = function () {
  //   return Offers.findOne({owner: userId})
  // }

}

Users = new Meteor.Collection("userData")

if (Meteor.isServer) {
  Meteor.startup(function () {
    // var require = __meteor_bootstrap__.require
    //   , moment = require("moment")
  });

  Accounts.onCreateUser(function(options, user) {
    user.type = 'basic'
    user.votes = []
    if (options.profile)
      user.profile = options.profile;
    return user;
  });

  Meteor.users.allow({
    update: function(userId, docs, fields, modifier) {
      return _.all(docs, function (doc) {
        return doc._id === userId
      })
    }
  })

  Meteor.publish("offers", function() {
    return Offers.find({})
  })

  Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {type: 1})
  })
}

