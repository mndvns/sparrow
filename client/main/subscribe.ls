
do ->
  ms = Meteor.subscribe

  ms "relations", My?.userLoc! , ->
    console.log "SUBSCRIBE READY"
    Session.set "subscribe_ready", true

  ms "my_offer"
  ms "my_tags"
  ms "my_pictures"
  ms "my_messages"
  ms "my_alerts"

  ms "tagsets"
  ms "sorts"
  ms "votes"

  ms "all_offers"

  ms "user_data"
