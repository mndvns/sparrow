Offers  = new Meteor.Collection("offers")
Tags    = new Meteor.Collection("tags")
Tagsets = new Meteor.Collection("tagsets")
Users   = new Meteor.Collection("userData")

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
        business: options.business,
        symbol: options.symbol,
        color: options.color,
        loc: options.loc,
        tags: options.tags,
        createdAt: (moment().unix() * 1000),
        updatedAt: (moment().unix() * 1000),
        votes: [],
        street: options.street,
        city_state: options.city_state,
        zip: options.zip
      })
    }
    else if (type === 'update') {
      return Offers.update({
        owner: this.userId },
        {$set: {
          name: options.name,
          price: options.price,
          description: options.description,
          business: options.business,
          loc: options.loc,
          tags: options.tags,
          symbol: options.symbol,
          color: options.color,
          updatedAt: (moment().unix() * 1000),
          street: options.street,
          city_state: options.city_state,
          zip: options.zip
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
  },
  upvote: function (type, user, offer) {

    var id = type === "id" ? user : Meteor.users.findOne({username: user })


    // if (parent.hasClass("voted") || _.contains(user.votes, selection)) {
    //   return false
    // } else {
    var vote = Meteor.uuid()
      , now = moment().unix()
      , exp = moment().add("minutes", 15).unix()
    Meteor.users.update({ _id: user }, { $push: {votes: {
      vid: vote,
      exp: exp
    }}})
    Offers.update( offer._id, {$push: {votes: {
      vid: vote,
      exp: exp
    }}})
    Meteor.users.update({ _id: offer.owner }, {$push: {karma: {
      vid: vote,
      exp: exp
    }}})
    /* } */

  }

})

if (Meteor.isServer) {

  Meteor.setInterval(function() {

    var now = moment().unix()
      , offers = Offers.find({ votes: {$gt: {exp: now }}}).fetch()
      , voters = Meteor.users.find({ votes: {$gt: {exp: now }}}).fetch()

    for (var i=0; i < offers.length; i++) {
      var filter =_.filter(offers[i].votes, function(data) {
        return data.exp > now
      })
      Offers.update({ _id: offers[i]._id}, {$set: {votes: filter}})
    }
    for (var i=0; i < voters.length; i++) {
      var filter =_.filter( voters[i].votes, function(data) {
        return data.exp > now
      })
      Meteor.users.update({ _id: voters[i]._id}, {$set: {votes: filter}})
    }
  }, 3000)

}


