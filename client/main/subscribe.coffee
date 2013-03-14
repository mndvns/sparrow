
# Meteor.subscribe "offers", Store.get("user_loc")
# Meteor.subscribe "stickers"

Meteor.subscribe "derps", Store.get("user_loc"), ->
  console.log "SUBSCRIBE READY"
  Session.set "subscribe_ready", true

Meteor.subscribe "tagsets"
# Meteor.subscribe "tags", Store.get("user_loc")

Meteor.subscribe "sorts"
Meteor.subscribe "images"
Meteor.subscribe "userData"
Meteor.subscribe "messages"
Meteor.subscribe "alerts"



Meteor.subscribe "user_offer"
Meteor.subscribe "all_offers"


Meteor.subscribe "tests"

