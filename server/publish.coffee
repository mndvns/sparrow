
#           ____        __    ___      __            //
#                                                    //
#          / __ \__  __/ /_  / (_)____/ /_           //
#         / /_/ / / / / __ \/ / / ___/ __ \          //
#        / ____/ /_/ / /_/ / / (__  ) / / /          //
#       /_/    \__,_/_.___/_/_/____/_/ /_/           //
#                                                    //
#                                                    //

# Meteor.publish "offers", (storeLoc) ->
# 
#   miles = 1000
#   radius = (miles / 69)
# 
# 
#   return App.Collection.Offers.find()
# 
#   # if storeLoc
#   #   App.Collection.Offers.find( loc:
#   #     $near: [ storeLoc.lat, storeLoc.long ],
#   #     $maxDistance: radius
#   #   )


# Meteor.publish "stickers", ->
#   return Stickers.find()

# Meteor.publish "stickers", ->
#   Sticker.all()

Meteor.publish "derps", (user_loc)->
  miles = 2000
  radius = (miles / 69)

  Meteor.publishWithRelations(
    handle: this
    collection: App.Collection.Locations
    filter:
      geo:
        $near: [ user_loc.lat, user_loc.long ],
        $maxDistance: radius
    mappings: [
      key: 'offerId'
      collection: App.Collection.Offers
      filter: {}
      mappings: [
        reverse: true
        key: 'offerId'
        collection: App.Collection.Tags
        filter: {}
      ]
    ]
  )
  @ready()


# TEMP
Meteor.publish "tags", (userLoc) ->
  App.Collection.Tags.find {}

Meteor.publish "locations", ->
  App.Collection.Locations.find {}

# Meteor.publish "user_offer", ->
#   App.Collection.Offers.find(
#     $or:[
#       owner   : @userId
#     ,
#       ownerId : @userId
#     ]
#   )

# Meteor.publish "all_offers", ->
#   App.Collection.Offers.find()


Meteor.publish "userData", ->
  Meteor.users.find {},
    type: 1


# Meteor.publish "tagsets", ->
#   App.Collection.Tagsets.find {}
# 
# Meteor.publish "sorts", ->
#   App.Collection.Sorts.find {},
#     sort:
#       list_order: 1
# 
# Meteor.publish "messages", ->
#   App.Collection.Messages.find involve:
#     $in: [@userId]
# 
# Meteor.publish "images", ->
#   App.Collection.Images.find
#     owner: @userId
#     status:
#       $nin: ["deactivated"]

Meteor.publish "alerts", ->
  App.Collection.Alerts.find owner: @userId



Meteor.publish "tests", ->
  App.Collection.Tests.find()
