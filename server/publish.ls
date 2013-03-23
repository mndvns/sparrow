

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


Meteor.publish "relations", (loc)->
  miles  = 2000
  radius = (miles / 69)
  switch loc
  | (.lat)? => filt = geo: $near: [loc.lat, loc.long ], $maxDistance: radius
  | _       => filt = {}

  Meteor.publishWithRelations {}=
    handle: this
    collection: Locations
    filter: filt
    mappings: [
      key: 'offerId'
      collection: Offers
      filter: {}
      mappings: [
        reverse: true
        key: 'offerId'
        collection: Tags
        filter: {}
      ]
    ]

  @ready()


# TEMP
# Meteor.publish "tags", (userLoc) ->
#   App.Collection.Tags.find {}

# Meteor.publish "locations", ->
#   App.Collection.Locations.find {}

Meteor.publish "my_offer",    -> Offers.find ownerId : @userId
Meteor.publish "my_tags",     -> Tags.find ownerId : @userId
Meteor.publish "my_pictures", -> Pictures.find ownerId: @userId , status: $nin: ["deactivated"]


Meteor.publish "all_offers", ->
  App.Collection.Offers.find()


Meteor.publish "userData", ->
  Meteor.users.find {},
    type: 1


Meteor.publish "tagsets", ->
  App.Collection.Tagsets.find {}

Meteor.publish "sorts", ->
  App.Collection.Sorts.find {},
    sort:
      list_order: 1

Meteor.publish "messages", ->
  App.Collection.Messages.find involve:
    $in: [@userId]

Meteor.publish "alerts", ->
  App.Collection.Alerts.find owner: @userId



Meteor.publish "tests", ->
  App.Collection.Tests.find()
