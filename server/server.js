
//                                               //
//        _____                                  //                          
//       / ___/___  ______   _____  _____        //
//       \__ \/ _ \/ ___/ | / / _ \/ ___/        //
//      ___/ /  __/ /   | |/ /  __/ /            //
//     /____/\___/_/    |___/\___/_/             //
//                                               //
//                                               //
                                  

/* var color              = __meteor_bootstrap__.require("colors") */

var dwollaClientId     = "SU4FlmQ2/mSfvexkPIE/6I+LV5dIoeFoNXexYGTUKLwAXgC/ki"
  , dwollaClientSecret = "+j15d9+/pUvpInw4lR+5rfyH+ECZURvg8y/7msgs1Qv2VvuIg2"
  , dwollaUrl          = "https://www.dwolla.com/oauth/v2/token"
  , stripeClientId     = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"
  , stripeClientSecret = "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"
  , stripeUrl          = "https://connect.stripe.com/oauth/token"

//                                                    //
//         _____ __             __                    //
//        / ___// /_____ ______/ /___  ______         //
//        \__ \/ __/ __ `/ ___/ __/ / / / __ \        //
//       ___/ / /_/ /_/ / /  / /_/ /_/ / /_/ /        //
//      /____/\__/\__,_/_/   \__/\__,_/ .___/         //
//                                   /_/              //
//                                                    //

Meteor.startup(function () {
  Offers._ensureIndex({loc: "2d"})

  var j = [
    " ", " ", "   ____", "  / __/___  ___ _ ____ ____ ___  _    __", 
    " _\\ \\ / _ \\/ _ `// __// __// _ \\| |/|/ /",
    "/___// .__/\\_,_//_/  /_/   \\___/|__,__/ ", "    /_/"," ", " "]
  for(var i=0;i<j.length;i++){console.log("         ", j[i] )}

});

//                                                        //
//         ___                               __           //
//        /   | ______________  __  ______  / /______     //
//       / /| |/ ___/ ___/ __ \/ / / / __ \/ __/ ___/     //
//      / ___ / /__/ /__/ /_/ / /_/ / / / / /_(__  )      //
//     /_/  |_\___/\___/\____/\__,_/_/ /_/\__/____/       //
//                                                        //
//                                                        //
                                              

Accounts.onCreateUser(function(options, user) {
  user.type = 'admin'
  user.votes = []
  user.votes.push(user._id)
  user.points = 10
  user.logins = 0
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
        return doc
      } else {
        return doc._id === userId
      }
    })
  },
  remove: function(userId, docs) {
    if (Meteor.users.findOne({_id: userId}).type === "admin") {
      return _.all(docs)
    } else {
      return false
    }
  }
})

//                                                    //
//           ____        __    ___      __            //
//          / __ \__  __/ /_  / (_)____/ /_           //
//         / /_/ / / / / __ \/ / / ___/ __ \          //
//        / ____/ /_/ / /_/ / / (__  ) / / /          //
//       /_/    \__,_/_.___/_/_/____/_/ /_/           //
//                                                    //
//                                                    //

Meteor.publish("offers", function(myLoc) {
  console.log(myLoc)
  if (myLoc) {
    return Offers.find({ loc: {$near : [myLoc.lat, myLoc.long], $maxDistance: 5 }})
  } else {
    return Offers.find()
  }
})

Meteor.publish("tagsets", function() {
  return Tagsets.find({})
})

Meteor.publish("tags", function() {
  return Tags.find({})
})

Meteor.publish("sorts", function() {
  return Sorts.find({})
})

Meteor.publish("userData", function () {
  return Meteor.users.find({}, {type: 1})
})

//                                                         //
//           __  ___     __  __              __            //
//          /  |/  /__  / /_/ /_  ____  ____/ /____        //
//         / /|_/ / _ \/ __/ __ \/ __ \/ __  / ___/        //
//        / /  / /  __/ /_/ / / / /_/ / /_/ (__  )         //
//       /_/  /_/\___/\__/_/ /_/\____/\__,_/____/          //
//                                                         //
//                                                         //


Meteor.methods({
  editOffer: function (type, options) {
    this.unblock()
    var opts = options || {}
    if (opts.name.length < 5)
      throw new Meteor.Error(400, "Offer name is too short")

    console.log(type)
    if (type === 'insert') {
      return Offers.insert({
        owner: this.userId,
        name: opts.name,
        price: opts.price,
        description: opts.description,
        business: opts.business,
        symbol: opts.symbol,
        color: opts.color,
        loc: opts.loc,
        tags: opts.tags,
        tagset: opts.tagset,
        createdAt: (moment().unix() * 1000),
        updatedAt: (moment().unix() * 1000),
        votes: 1,
        street: opts.street,
        city: opts.city,
        state: opts.state,
        metrics: {
          created: 1
        }
      })
    }
    else if (type === 'update') {
      return Offers.update({
        owner: this.userId },
        {$set: {
          name: opts.name,
          price: opts.price,
          description: opts.description,
          business: opts.business,
          loc: opts.loc,
          tags: opts.tags,
          tagset: opts.tagset,
          symbol: opts.symbol,
          color: opts.color,
          updatedAt: (moment().unix() * 1000),
          street: opts.street,
          city: opts.city,
          state: opts.state,
          zip: opts.zip
        }
      })
    }
  },
  isAdmin: function (id) {
    var type = Meteor.users.findOne({_id: id}).type
    if(type != "admin") {
      return false
    } else {
      return true
    } 
  },
  upvoteEvent: function (type, user, offer) {
    var id = type === "id" ? user : Meteor.users.findOne({username: user })
      , vote = Meteor.uuid()
      , now = moment().unix()
      , exp = moment().add("minutes", 15).unix()

    Meteor.users.update({ _id: user }, { $push: {votes: {
      vid: vote,
      exp: exp
    }}})
    Offers.update( offer._id, {$inc: {votes: 1}})
    Meteor.users.update({ _id: offer.owner }, {$push: {karma: {
      vid: vote,
      exp: exp
    }}})
  },
  registerLogin: function () {
    this.unblock()
    Meteor.users.update({ _id: Meteor.userId() }, {$inc: {logins: 1}})
    console.log(Meteor.user())

    /* return */
  },
  getLogin: function (res) {
    this.unblock()
    var j = Meteor.user()
    console.log(j.logins)
    return j.logins
  },
  thingy: function () {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {"lastActivity": moment().unix() }})
  },
  eventCreateOffer: function (offerId) {
    // console.log("UPDATED STUFF")
    // 
    // return Offers.update({_id: offerId}, {$inc: {metrics[created]: 1}})
  }
  // getStripeApi: function (input) {
  //   this.unblock()

  //   var user = Meteor.user()
  //   var stripe = StripeAPI(user.stripe.accessToken)

  //   return stripe
  //   console.log("Got stripeAPI: ", stripe)
  //   if (stripe) {
  //     return stripe
  //   }
  // },
  // submitPaymentForm: function (input) {
  //   this.unblock()
  //   console.log("Got inside server method with: ", input)
  //   /* return {err: "ASDAS", res: "ASDASDASDDD"} */

  //   var user = Meteor.user()
  //   var stripe = StripeAPI(user.stripe.accessToken)

  //   /* Meteor.http.call("POST", "https://api.stripe.com/v1/charges", { */

  //   var k = {}
  //   stripe.charges.create({
  //     "amount"          : 9900,
  //     "currency"        : "usd",
  //     "card"            : input.id,
  //     "description"     : "Just a test",
  //     "application_fee" : 700
  //   }, function(err, res) {
  //      console.log(err, res)
  //      k = {err:err, res: res}
  //   })

  //   if (k.err)
  //     return k
  //   return k

  // },
  // oauth: function (code) {
  //   this.unblock()
  //   Meteor.http.call("POST", stripeUrl, {
  //     params: {
  //       client_id: stripeClientId,
  //       code: code,
  //       grant_type: "authorization_code"
  //       },
  //      headers: {
  //       Authorization: "Bearer " + stripeClientSecret
  //     }
  //   }, function(err, res) {
  //     Session.set("callingServer", false)
  //     if(res.statusCode === 200) {
  //       console.log("SUCCESS".blue, "Got user's Stripe data", res)

  //       var userData = {
  //         id             : res.data.stripe_user_id,
  //         publishableKey : res.data.stripe_publishable_key,
  //         refreshToken   : res.data.refresh_token,
  //         accessToken    : res.data.access_token
  //       }

  //       Meteor.users.update({ _id: Meteor.userId() }, {$set: {stripe: userData}})
  //       return "ASD"
  //     } else if (res.statusCode > 200) {
  //       console.log(res)
  //       return "ASD"
  //     }
  //   })
  // }
})

//                                            //
//         ______                             //
//        / ____/________  ____               //
//       / /   / ___/ __ \/ __ \              //
//      / /___/ /  / /_/ / / / /              //
//      \____/_/   \____/_/ /_/               //
//                                            //
//                                            //

  Meteor.setInterval(function() {
    var expiration = moment().subtract("minutes", 1).unix()

    /* var j = Meteor.users.find({ "lastActivity": { $lt: expiration }}).count() */
    Meteor.users.update({ "lastActivity": {$lt: expiration}}, {$set: {"online": false }})

    // var now = moment().unix()
    //   , offers = Offers.find({ votes: {$gt: {exp: now }}}).fetch()
    //   , voters = Meteor.users.find({ votes: {$gt: {exp: now }}}).fetch()

    // for (var i=0; i < offers.length; i++) {
    //   var filter =_.filter(offers[i].votes, function(data) {
    //     return data.exp > now
    //   })
    //   Offers.update({ _id: offers[i]._id}, {$set: {votes: filter}})
    // }
    // for (var i=0; i < voters.length; i++) {
    //   var filter =_.filter( voters[i].votes, function(data) {
    //     return data.exp > now
    //   })
    //   Meteor.users.update({ _id: voters[i]._id}, {$set: {votes: filter}})
    // }

  }, 3000)

