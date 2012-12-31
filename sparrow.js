Offers = new Meteor.Collection("offers")
Tags = new Meteor.Collection("tags")
Tagsets = new Meteor.Collection("tagsets")

Offer = Backbone.Model.extend({
  defaults: {
    name: "some name",
    price: "some price",
    description: "some description",
    symbol: "",
    votes: 0,
    created: "some time",
    update: "some time"
  }
})

newOffer = new Offer()

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
        description: options.description,
        symbol: options.symbol,
        loc: [],
        tags: [],
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
          description: options.description,
          symbol: options.symbol,
          updatedAt: (moment().unix() * 1000)
        }
      })
    }
  },
  isAdmin: function (id) {
    var type = Meteor.users.findOne({_id: id}).type
    console.log(type)
    if(type != "admin") {
      console.log("false!")
      return false
    } else {
      console.log("true!")
      return true
    } 
  }
})

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  })

  Meteor.subscribe("offers")
  Meteor.subscribe("tags")
  Meteor.subscribe("allUserData")

  Handlebars.registerHelper("styleDate", function (date) {
    return moment(date).fromNow()
  })

  Handlebars.registerHelper("getTagsets", function (date) {
    return Tagsets.find()
  })

  Handlebars.registerHelper('getTags', function() {
    return Tags.find({tagset: this.name})
  })

  Handlebars.registerHelper('getLocation', function() {
    var output;
    navigator.geolocation.getCurrentPosition(foundLocation, noLocation);
    outpout = Session.get('loc');
    return Session.get('loc');
  })

  function foundLocation(location) {
    console.log(location);
    Session.set('loc','lat: '+location.coords.latitude+', lan: '+ location.coords.longitude);
  }
  function noLocation() {
    alert('no location');
  }

  Template.sidebar.getUserType = function (type) {
    var user = Meteor.user()
    if (!user){
      return false
    } else if (user.type == type) {
      return true
    }
  }

  Template.home.events({
    'click .votes': function(event, template) {
      if (! Meteor.user()) {
        return false
      }
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

  Template.home.getOffers = function () {
    return Offers.find({}, {sort: {votes: 1}})
  }

  Template.home.styleDate = function (date) {
    return moment(date).fromNow()
  }

  Template.offer.checkVote = function (selection) {
    var user = Meteor.user()
      , users = Meteor.users

    if (!user) {
      return false
    }

    if (_.contains(user.votes, selection)) {
      return true
    }
  }

}

Users = new Meteor.Collection("userData")

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Accounts.onCreateUser(function(options, user) {
    user.type = 'basic'
    user.votes = []
    user.votes.push(user._id)
    user.points = 10
    if (options.profile)
      user.profile = options.profile;
    return user;
  });

  Meteor.users.allow({
    insert: function(userId, docs) {
      if (Meteor.users.findOne({_id: userId}).type === "admin") {
        return _.all(docs)
      } else {
        return false
      }
    },
    update: function(userId, docs, fields, modifier) {
      return _.all(docs, function (doc) {
        if (Meteor.users.findOne({_id: userId}).type === "admin") {
          console.log("You're an admin!")
          return doc
        } else {
          return doc._id === userId
        }
      })
    },
    remove: function(userId, docs) {
      if (Meteor.users.findOne({_id: userId}).type === "admin") {
        console.log("You're an admin!")
        return _.all(docs)
      } else {
        return false
      }
    }
  })
  

  Meteor.publish("offers", function() {
    return Offers.find({})
  })

  Meteor.publish("tags", function() {
    return Tags.find({})
  })

  Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {type: 1})
  })
}

