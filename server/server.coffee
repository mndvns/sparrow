
require = __meteor_bootstrap__.require
MongoDB = require "mongodb"
Future = require "fibers/future"

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

  Tags.aggregate = (pipline) ->
    self = this
    future = new Future()
    self.find()._mongo.db.createCollection self._name, (err, collection) ->

      if err
        future.throw err
        return

      collection.aggregate pipline, (err, result) ->
        if err
          future.throw err
          return
        future.ret [true, result]

    result = future.wait()
    throw result[1]  unless result[0]
    result[1]

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
  user.karma = 50
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

Meteor.publish "offers", (storeLoc) ->
  if storeLoc
    Offers.find loc:
      $near: [ storeLoc.long, storeLoc.lat ]

Meteor.publish "tagsets", ->
  Tagsets.find {}

Meteor.publish "tags", (storeLoc) ->
  Tags.find {}

Meteor.publish "sorts", ->
  Sorts.find {}

Meteor.publish "userData", ->
  Meteor.users.find {},
    type: 1

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
  aggregateOffers: ->
    tags = Offers.aggregate
      $project:
        tags: 1

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
    self = @
    opts = options or {}

    throw new Meteor.Error(400, "Offer name is too short")  if opts.name.length < 5

    out = {}
    for key of Offer
      out[key] = opts[key]

    out.owner = out.owner or Meteor.userId()
    out.createdAt = out.createdAt or (moment().unix() * 1000)
    out.updatedAt = (moment().unix() * 1000)

    if type is "insert"
      out.votes.push
        user: @userId
        exp: Date.now() * 10
      Offers.insert out
    else
      Offers.update
        owner: @userId
      ,
        $set: out

    tagName = _.pluck(out.tags, "name")
    existObj = []
    existTags = Tags.find().forEach (m) ->
      _.filter m.involves, (f)->
        unless _.find(existObj, (ex)->
          ex._id is m._id)
          existObj.push m

    # console.log("EXISTING OBJ", existObj)

    for exist in existObj
      # console.log("EXIST", exist)

      Tags.update
          _id: exist._id
          "involves.user": Meteor.userId()
        ,
          $unset: "involves.$": 1
      Tags.update
          _id: exist._id
        ,
          $pull: "involves": null

    Tags.update
        name: $in: tagName
      ,
        $push:
          involves:
            user: out.owner
            loc:
              lat: out.loc.lat
              long: out.loc.long
      ,
        multi: true

  updateUserColor: (color) ->
    prime = Color(color).setLightness(.4)
    comp = prime.setSaturation(.5).tetradicScheme()[1]
    desat = prime.setSaturation(.2)
    darken = (a) ->
      a.setLightness(.2).setSaturation(.6).toString()
    lighten = (a) ->
      a.setLightness(.8).setSaturation(.4).toString()

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

#                                            //
#         ______                             //
#        / ____/________  ____               //
#       / /   / ___/ __ \/ __ \              //
#      / /___/ /  / /_/ / / / /              //
#      \____/_/   \____/_/ /_/               //
#                                            //
#                                            //

cronSeconds = 360
Meteor.setInterval (->
  Meteor.users.find( "stint.tags": $exists: true ).forEach (user)->
    decreaseKarma = 0
    adjustedKarma = 0
    adjustedTags = []
    offerQuery = {}
    offerSet = {$set: {}}
    tagQuery = {"involves": user._id}
    tagSet = {}
    userOffer = Offers.findOne owner: user._id
    userTags = Tags.find("involves.user": user._id).fetch()

    if user.karma < 0
      adjustedKarma = 0

    else
      for tag in user.stint.tags
        if tag.active
          decreaseKarma += tag.ratio
          console.log(user.username.toUpperCase(), "-" + decreaseKarma, "KARMA", user.karma)

          if decreaseKarma > user.karma
            tag.disabled = true

          else
            tag.disabled = false

          delete tag.involves
          delete tag.collection
          delete tag._id
          adjustedTags.push(tag)

          offerQuery["owner"] = user._id
          offerSet["$set"]["tags"] = adjustedTags

      adjustedKarma = (Math.ceil((user.karma - (decreaseKarma / (60 / cronSeconds)))*100)/100)
      # adjustedKarma = 2

    Meteor.users.update user._id,
      $set:
        karma: adjustedKarma

    unless _.isEmpty(offerQuery)
      Offers.update offerQuery,
        offerSet
      Tags.update tagQuery,
        tagSet

    # trueTags = []
    # _.each Tags.find("involves.user": user._id).fetch(), (t)->
    #   trueTags.push t.name
    # console.log(trueTags)
    # console.log "TRUE DATA", Offers.findOne(owner: user._id)?.tags
    # console.log(" ")


), cronSeconds * 1000
