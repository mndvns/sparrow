


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

  env       : ->
    | Meteor.isServer => return global
    | Meteor.isClient => return window

  user      : ->
    | Meteor.isServer => return Meteor.user!
    | Meteor.isClient => return Meteor.user!

  userId    : ->
    | Meteor.isServer => return Meteor.userId?()
    | Meteor.isClient => return Meteor.userId!

  userLoc   : -> Store?.get "user_loc"

  offer     : -> Offers?.findOne ownerId: @userId!
  offerId   : -> @offer()?._id

  tags      : -> Tags?.find ownerId: @userId! .fetch!
  tagset    : -> @offer! ?.tagset

  locations : -> Locations?.find ownerId: @userId! .fetch!
  pictures  : -> Pictures?.find ownerId: @userId! .fetch!

  alert     : -> Alerts?.findOne ownerId: @userId! ?._id

  map       : (field, list) --> map (-> it[field]), @[list]?!

