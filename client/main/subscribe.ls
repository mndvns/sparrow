

# Meteor.subscribe "offers", Store.get("user_loc")
# Meteor.subscribe "stickers"


do ->
  ms = Meteor.subscribe

  ms "relations", My?.userLoc! , ->
    console.log "SUBSCRIBE READY"
    Session.set "subscribe_ready", true

  ms "my_offer"
  ms "my_tags"
  ms "my_pictures"


  ms "tagsets"
  ms "tags"

  ms "sorts"
  ms "userData"
  ms "messages"
  ms "alerts"

  # TEMP
  ms "locations"

  ms "all_offers"




  ms "tests"

