
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
      $near: [ storeLoc.lat, storeLoc.long ]
#   Offers.find {}

Meteor.publish "tagsets", ->
  Tagsets.find {}

Meteor.publish "tags", (userLoc) ->
  Tags.find {}

Meteor.publish "sorts", ->
  Sorts.find {},
    sort:
      list_order: 1

Meteor.publish "userData", ->
  Meteor.users.find {},
    type: 1


Meteor.publish "messages", ->
  Messages.find involve:
    $in: [@userId]

Meteor.publish "images", ->
  Images.find
    owner: @userId
    status:
      $nin: ["deactivated"]

Meteor.publish "alerts", ->
  Alerts.find owner: @userId
