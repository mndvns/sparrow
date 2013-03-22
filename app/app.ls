
type = (obj) ->
  unless obj?
    return String obj
  classToType = new Object
  for name in "Boolean Number String Function Array Date RegExp".split(" ")
    classToType["[object " + name + "]"] = name.toLowerCase()
  myClass = Object.prototype.toString.call obj
  if myClass of classToType
    return classToType[myClass]
  return "object"

My =

  env: ->
    if Meteor.isServer
      return global
    if Meteor.isClient
      return window

  user:  ->
    Meteor.user() or @user()

  userId:  ->
    if Meteor.isServer
      return Meteor.userId()
    if Meteor.isClient
      return Meteor.userId()

  userLoc: ->
    if Meteor.isClient
      return Store.get("user_loc")

  offer: ->
    Offers?.findOne(
      ownerId: Meteor.userId() or @userId
    )

  offerId: ->
    if Meteor.isServer
      return Offers?.findOne(
        ownerId: @userId
      )?._id

    if Meteor.isClient
      return Offers?.findOne(
        ownerId: Meteor.userId()
      )?._id


  tags: ->
    Tags?.find ownerId: @userId! .fetch!

  locations: ->
    Locations?.find ownerId: @userId! .fetch!

  alert: ->
    App.Collection.Alerts.findOne(
      ownerId: @userId()
    )?._id


