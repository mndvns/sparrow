
# secrets
dwollaClientId = "SU4FlmQ2/mSfvexkPIE/6I+LV5dIoeFoNXexYGTUKLwAXgC/ki"
dwollaClientSecret = "+j15d9+/pUvpInw4lR+5rfyH+ECZURvg8y/7msgs1Qv2VvuIg2"
dwollaUrl = "https://www.dwolla.com/oauth/v2/token"

require  = __meteor_bootstrap__.require
MongoDB  = require "mongodb"
Future   = require "fibers/future"

# Colors = require "colors"
# fs       = require "fs"
# console.log(Meteor.settings)

# publish
do ->
  mp = Meteor.publish

  # mp "relations", (loc)->
  #   miles  = 2000
  #   radius = (miles / 69)
  #   switch loc
  #   | (.lat)? => filt = geo: $near: [loc.lat, loc.long ], $maxDistance: radius
  #   | _       => filt = {}

  #   Meteor.publishWithRelations {}=
  #     handle: this
  #     collection: Locations
  #     filter: filt
  #     mappings: [
  #       key: 'offerId'
  #       collection: Offers
  #       mappings: [
  #         reverse: true
  #         key: 'offerId'
  #         collection: Tags
  #       ]
  #     ]

  #   @ready()

  mp "my_offer",      -> Offers.findOne ownerId : @userId

  mp "my_tags",       -> Tags.find ownerId : @userId
  mp "my_pictures",   -> Pictures.find ownerId: @userId , status: $nin: ["deactivated"]
  mp "my_messages",   -> Messages.find involve: $in: [@userId]
  mp "my_alerts",     -> Alerts.find owner: @userId
  mp "my_prompts",    -> Prompts.find!

  mp "tagsets",       -> Tagsets.find!
  mp "sorts",         -> Sorts.find {}, sort: list_order: 1
  mp "points",        -> Points.find!

  mp "all_offers",    -> Offers.find!
  mp "all_tags",      -> Tags.find!
  mp "all_locations", -> Locations.find!
  mp "all_markets",   -> Markets.find!

  # mp "charges",       -> Charges.find $or: [ offer-id: My.offer-id!, customer-id: My.user!.customer-id ]

  mp "purchases",     -> Purchases.find!
  mp "customers",     -> Customers.find!

  mp "user_data",     -> Meteor.users.find!




class Alert
  ->
    Alerts.insert {}=
      owner: Meteor.userId!
      text: it.text
      wait: it.wait or false

# accounts
Accounts.on-create-user (options, user) ->
  user.type = "basic"
  user.karma = 50
  user.logins = 0
  if options.profile
    user.profile = options.profile
  user.meta =
    firstPages:
      home: true
      account: true
  user

Meteor.users.allow {}=
  insert: (userId, docs) ->
    out = void
    out = _.all(docs)  if Meteor.users.findOne(_id: userId).type is "admin"
    true

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

allow-user = ( collections ) ->
  for c in collections
    c.allow {}=
      insert: (userId, doc) ->
        userId is doc.ownerId
      update: (userId, doc) ->
        userId is doc.ownerId
      remove: (userId, doc) ->
        userId is doc.ownerId
      fetch: ['ownerId']


allow-user([
  Offers
  Points
  Tags
  Locations
  Pictures

  Markets
  Purchases
  Customers
])

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

Meteor.methods {}=

  message: (text, selector, opt) ->
    message = {}
    involve = [Meteor.userId()]
    admin = false
    existing = void
    ID = void
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
      Messages.update  {}=
        _id: ID
      ,
        $push:
          content: content
      , (err, res) ->
        console.log "Error", err  if err
        console.log "Successfully sent message, motherfucker", res


  editOffer: (type, opts) ->
    console.log("GOT INSIDE")
    return

    opts ?= {}
    out = {}

    if opts.name.length < 5
      throw new Meteor.Error(400, "Offer name is too short")  

    for key of Offer._schema
      out[key] = opts[key]

    out.owner       = Meteor.userId()
    out.createdAt  ?= Time.now()
    out.updatedAt   = Time.now()
    out.price       = parseInt(out.price)

    if type is "insert"
      out.votes_meta.push {}=
        user: @userId
        exp: Date.now() * 10
      out.votes_count = 1
      out.rand = _.random(100, 999)
      App.Collection.Offers.insert out
    else
      App.Collection.Offers.update {}=
        owner: @userId
      ,
        $set: out

  updateUser: (email, username) ->
    users = Meteor.users.find().fetch()
    existing = _.reject(users, (d) ->
      d._id is Meteor.userId()
    )

    if email
      existingEmails = _.pluck(_.flatten(_.compact(_.pluck(existing, "emails"))), "address")
      throw new Meteor.Error(400, "Email unavailable")  if _.contains(existingEmails, email)

    existingUsernames = _.pluck(existing, "username")
    throw new Meteor.Error(400, "Username unavailable")  if _.contains(existingUsernames, username)

    set = $set:
      username: username
      emails: [
        address: email
        verified: false
      ]

    Meteor.users.update {}=
      _id: Meteor.userId()
    , set, {}, (err) ->
      if err
        new Alert {}=
          text: "Uh oh..."
      else
        new Alert {}=
          text: "Profile saved successfully"


  activateAdmin: (code) ->

    if code isnt "secret"
      throw new Meteor.Error(400, "Activation failed")
      return

    else
      Meteor.users.update _id: @userId,
        $set:
          type: "admin"
        , (err) ->
          if err
            new Alert {}=
              text: err
          else
            new Alert {}=
              text: "Profile saved successfully"



