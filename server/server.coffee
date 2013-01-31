
#                                               //
#        _____                                  //
#       / ___/___  ______   _____  _____        //
#       \__ \/ _ \/ ___/ | / / _ \/ ___/        //
#      ___/ /  __/ /   | |/ /  __/ /            //
#     /____/\___/_/    |___/\___/_/             //
#                                               //
#                                               //

dwollaClientId = "SU4FlmQ2/mSfvexkPIE/6I+LV5dIoeFoNXexYGTUKLwAXgC/ki"
dwollaClientSecret = "+j15d9+/pUvpInw4lR+5rfyH+ECZURvg8y/7msgs1Qv2VvuIg2"
dwollaUrl = "https://www.dwolla.com/oauth/v2/token"
stripeClientId = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"
stripeClientSecret = "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"
stripeUrl = "https://connect.stripe.com/oauth/token"

#                                                    //
#         _____ __             __                    //
#        / ___// /_____ ______/ /___  ______         //
#        \__ \/ __/ __ `/ ___/ __/ / / / __ \        //
#       ___/ / /_/ /_/ / /  / /_/ /_/ / /_/ /        //
#      /____/\__/\__,_/_/   \__/\__,_/ .___/         //
#                                   /_/              //
#                                                    //
Meteor.startup ->
  i = 0
  j = [
    " ", " ", "   ____", "  / __/___  ___ _ ____ ____ ___  _    __",
    " _\\ \\ / _ \\/ _ `// __// __// _ \\| |/|/ /",
    "/___// .__/\\_,_//_/  /_/   \\___/|__,__/ ", "    /_/", " ", " "]
  while i < j.length
    console.log "         ", j[i]
    i += 1
  Offers._ensureIndex loc: "2d"

  k = Color("#fff")
#                                                        //
#         ___                               __           //
#        /   | ______________  __  ______  / /______     //
#       / /| |/ ___/ ___/ __ \/ / / / __ \/ __/ ___/     //
#      / ___ / /__/ /__/ /_/ / /_/ / / / / /_(__  )      //
#     /_/  |_\___/\___/\____/\__,_/_/ /_/\__/____/       //
#                                                        //
#                                                        //

Accounts.onCreateUser (options, user) ->
  user.type = "admin"
  user.votes = []
  user.votes.push user._id
  user.points = 10
  user.logins = 0
  user.profile = options.profile  if options.profile
  user

Meteor.users.allow
  insert: (userId, docs) ->
    out = undefined
    out = _.all(docs)  if Meteor.users.findOne(_id: userId).type is "admin"
    out

  update: (userId, docs, fields, modifier) ->
    _.all docs, (doc) ->
      if Meteor.users.findOne(_id: userId).type is "admin"
        doc
      else
        doc._id is userId


  remove: (userId, docs) ->
    if Meteor.users.findOne(_id: userId).type is "admin"
      _.all docs
    else
      false


#                                                    //
#           ____        __    ___      __            //
#          / __ \__  __/ /_  / (_)____/ /_           //
#         / /_/ / / / / __ \/ / / ___/ __ \          //
#        / ____/ /_/ / /_/ / / (__  ) / / /          //
#       /_/    \__,_/_.___/_/_/____/_/ /_/           //
#                                                    //
#                                                    //

Meteor.publish "offers", (myLoc) ->

  # Offers.find {}

  if myLoc
    Offers.find loc:
      $near : [myLoc.lat, myLoc.long]

  else
    Offers.find {}

Meteor.publish "tagsets", ->
  Tagsets.find {}

Meteor.publish "tags", ->
  Tags.find {}

Meteor.publish "sorts", ->
  Sorts.find {}

Meteor.publish "userData", ->
  self = this
  Meteor.users.find {},
    type: 1
  # Meteor.users.find
  #   _id: self.userId,
  #     type: 1
  # Meteor.users.find {},
  #   colors: 1


Meteor.publish "messages", ->
  Messages.find involve:
    $in: [@userId]



#                                                         //
#           __  ___     __  __              __            //
#          /  |/  /__  / /_/ /_  ____  ____/ /____        //
#         / /|_/ / _ \/ __/ __ \/ __ \/ __  / ___/        //
#        / /  / /  __/ /_/ / / / /_/ / /_/ (__  )         //
#       /_/  /_/\___/\__/_/ /_/\____/\__,_/____/          //
#                                                         //
#                                                         //
mapper = (a) ->
  map = (if _.isArray(a) then a else [a])
  _.map map, (d) ->
    out = {}
    out.username = d.username
    out.id = d._id
    out


Meteor.methods
  message: (text, selector, opt) ->
    message = {}
    involve = [Meteor.userId()]
    admin = false
    existing = undefined
    ID = undefined
    if selector is "toAdmins"
      admins = Meteor.users.find(type: "admin").fetch()
      involve.push _.pluck(admins, "_id")
      involve = _.flatten(involve)
      admin = true
    else if selector is "offer"
      user = Meteor.users.findOne(_id: opt)
      involve.push user._id
    from = mapper(Meteor.user())
    content =
      from: from
      message: text
      sent: Time.now()

    if selector is "reply"
      ID = opt
    else
      existing = Messages.findOne(
        involve:
          $all: involve

        admin: false
      )
      unless existing
        message =
          involve: involve
          admin: admin
          content: [content]
          lastSent: Time.now()
      else
        ID = existing._id
    console.log "New message", message
    if selector isnt "reply" and not existing
      Messages.insert message, (err, res) ->
        console.log "Error", err  if err
        console.log "Successfully sent message, motherfucker", res

    else
      Messages.update
        _id: ID
      ,
        $push:
          content: content
      , (err, res) ->
        console.log "Error", err  if err
        console.log "Successfully sent message, motherfucker", res


  editOffer: (type, options) ->
    @unblock()
    opts = options or {}
    throw new Meteor.Error(400, "Offer name is too short")  if opts.name.length < 5
    out = {}
    for key of Offer
      out[key] = opts[key]
    out.owner = out.owner or Meteor.userId()
    out.createdAt = out.createdAt or (moment().unix() * 1000)
    out.updatedAt = (moment().unix() * 1000)
    if type is "insert"
      Offers.insert out
    else
      Offers.update
        owner: @userId
      ,
        $set: out


  updateUserColor: (color) ->
    prime = Color(color).setLightness(.4)
    comp = prime.setSaturation(.5).tetradicScheme()[1]
    desat = prime.setSaturation(.2)
    darken = (a) ->
      a.setLightness(.2).setSaturation(.9).toString()
    lighten = (a) ->
      a.setLightness(.8).setSaturation(.3).toString()

    Meteor.users.update
      _id: Meteor.userId()
      ,
        $set:
          colors:
            prime:
              light: lighten prime
              medium: prime.toString()
              dark: darken prime
            comp:
              light: lighten comp
              medium: comp.toString()
              dark: darken comp
            desat:
              light: desat.setLightness( .8 ).toString()
              medium: desat.setLightness( .5 ).toString()
              dark: desat.setLightness( .2 ).toString()

  updateUser: (email, username) ->
    users = Meteor.users.find().fetch()
    existing = _.reject(users, (d) ->
      d._id is Meteor.userId()
    )
    existingEmails = _.pluck(_.flatten(_.compact(_.pluck(existing, "emails"))), "address")
    existingUsernames = _.pluck(existing, "username")
    throw new Meteor.Error(400, "Email unavailable")  if _.contains(existingEmails, email)
    throw new Meteor.Error(400, "Username unavailable")  if _.contains(existingUsernames, username)
    set = $set:
      username: username
      emails: [
        address: email
        verified: false
      ]

    Meteor.users.update
      _id: Meteor.userId()
    , set, {}, (err) ->
      err  if err


  isAdmin: (id) ->
    type = Meteor.users.findOne(_id: id).type
    unless type is "admin"
      false
    else
      true

  registerLogin: ->
    @unblock()
    Meteor.users.update
      _id: Meteor.userId()
    ,
      $inc:
        logins: 1

    console.log Meteor.user()

  
  # return 
  getLogin: (res) ->
    @unblock()
    Meteor.users.update
      _id: Meteor.userId()
    ,
      $inc:
        logins: 1

    j = Meteor.user()
    console.log j.logins
    j.logins

  thingy: ->
    Meteor.users.update
      _id: Meteor.userId()
    ,
      $set:
        lastActivity: moment().unix()


  eventCreateOffer: (offerId) ->


# console.log("UPDATED STUFF")
# 
# return Offers.update({_id: offerId}, {$inc: {metrics[created]: 1}})

# getStripeApi: function (input) {
#   this.unblock()

#   var user = Meteor.user()
#   var stripe = StripeAPI(user.stripe.accessToken)

#   return stripe
#   console.log("Got stripeAPI: ", stripe)
#   if (stripe) {
#     return stripe
#   }
# },
# submitPaymentForm: function (input) {
#   this.unblock()
#   console.log("Got inside server method with: ", input)
#   /* return {err: "ASDAS", res: "ASDASDASDDD"} */

#   var user = Meteor.user()
#   var stripe = StripeAPI(user.stripe.accessToken)

#   /* Meteor.http.call("POST", "https://api.stripe.com/v1/charges", { */

#   var k = {}
#   stripe.charges.create({
#     "amount"          : 9900,
#     "currency"        : "usd",
#     "card"            : input.id,
#     "description"     : "Just a test",
#     "application_fee" : 700
#   }, function(err, res) {
#      console.log(err, res)
#      k = {err:err, res: res}
#   })

#   if (k.err)
#     return k
#   return k

# },
# oauth: function (code) {
#   this.unblock()
#   Meteor.http.call("POST", stripeUrl, {
#     params: {
#       client_id: stripeClientId,
#       code: code,
#       grant_type: "authorization_code"
#       },
#      headers: {
#       Authorization: "Bearer " + stripeClientSecret
#     }
#   }, function(err, res) {
#     Session.set("callingServer", false)
#     if(res.statusCode === 200) {
#       console.log("SUCCESS".blue, "Got user's Stripe data", res)

#       var userData = {
#         id             : res.data.stripe_user_id,
#         publishableKey : res.data.stripe_publishable_key,
#         refreshToken   : res.data.refresh_token,
#         accessToken    : res.data.access_token
#       }

#       Meteor.users.update({ _id: Meteor.userId() }, {$set: {stripe: userData}})
#       return "ASD"
#     } else if (res.statusCode > 200) {
#       console.log(res)
#       return "ASD"
#     }
#   })
# }

#                                            //
#         ______                             //
#        / ____/________  ____               //
#       / /   / ___/ __ \/ __ \              //
#      / /___/ /  / /_/ / / / /              //
#      \____/_/   \____/_/ /_/               //
#                                            //
#                                            //
Meteor.setInterval (->
  expiration = moment().subtract("minutes", 1).unix()

# var j = Meteor.users.find({ "lastActivity": { $lt: expiration }}).count() 

# Meteor.users.update({ "lastActivity": {$lt: expiration}}, {$set: {"online": false }}) 

# var now = moment().unix()
#   , offers = Offers.find({ votes: {$gt: {exp: now }}}).fetch()
#   , voters = Meteor.users.find({ votes: {$gt: {exp: now }}}).fetch()

# for (var i=0; i < offers.length; i++) {
#   var filter =_.filter(offers[i].votes, function(data) {
#     return data.exp > now
#   })
#   Offers.update({ _id: offers[i]._id}, {$set: {votes: filter}})
# }
# for (var i=0; i < voters.length; i++) {
#   var filter =_.filter( voters[i].votes, function(data) {
#     return data.exp > now
#   })
#   Meteor.users.update({ _id: voters[i]._id}, {$set: {votes: filter}})
# }
), 3000
