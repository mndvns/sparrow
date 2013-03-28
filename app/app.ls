type = ->
  unless it?
    return String it
  class-to-type = new Object
  for name in <[ Boolean Number String Function Array Date RegExp ]>
    class-to-type["[object #{name}]"] = name.to-lower-case!
  my-class = Object.prototype.to-string.call it
  if my-class of class-to-type
    return class-to-type[my-class]
  return "object"

My =

  env       : ->
    | Meteor.isServer => return global
    | Meteor.isClient => return window

  user      : ->
    | Meteor.isServer => return Meteor.user!
    | Meteor.isClient => return Meteor.user!

  userId    : ->
    | Meteor.isServer => return Meteor.userId!
    | Meteor.isClient => return Meteor.userId!

  userLoc   : -> Store?.get "user_loc"

  customer  : -> Customers.findOne ownerId: @userId!
  customerId: -> @customer! ?.id

  offer     : -> Offers?.findOne ownerId: @userId!
  offer-id  : -> @offer! ?._id

  market    : -> Markets.findOne ownerId: @userId!

  tags      : -> Tags?.find ownerId: @userId! .fetch!
  tagset    : -> @offer! ?.tagset

  locations : -> Locations?.find ownerId: @userId! .fetch!
  pictures  : -> Pictures?.find ownerId: @userId! .fetch!

  alert     : -> Alerts?.find-one owner-id: @user-id! ?._id
  prompts   : -> Prompts?.find!.fetch!



  init      : (klass, obj = {}) -> @[klass]! or @env![klass.to-proper-case!].new obj

  map       : (field, list) --> map (-> it[field]), @[list]?!

Meteor.methods {}=
  upvoteEvent: (offer) ->
    @unblock?!

    Offers.update offer._id,
      $push:
        votes_meta:
          user: @userId
          exp: Time.now!
      $inc:
        votes_count: 1

    Meteor.users.update offer.owner,
      $inc:
        karma: 1

  instance_destroy_mine: ->
    My.env![it].remove ownerId: My.userId!
