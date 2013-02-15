
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

