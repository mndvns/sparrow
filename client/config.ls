
do ->
  ms = Meteor.subscribe

  # ms "relations", My?.userLoc! , ->
  #   console.log "SUBSCRIBE READY"
  #   Session.set "subscribe_ready", true

  ms "my_offer"
  ms "my_tags"
  ms "my_pictures"
  ms "my_messages"
  ms "my_alerts"
  ms "my_prompts"

  ms "tagsets"
  ms "sorts"
  ms "points"

  ms "all_offers"
  ms "all_tags"
  ms "all_locations"
  ms "all_markets"

  ms "purchases"
  ms "customers"

  ms "user_data"

# window.__dirname = "http://localhost:3000/"











Stripe.set-publishable-key("pk_test_xB8tcSbkx4mwjHjxZtSMuZDf") 
Stripe.client_id = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"

Color = net.brehaut.Color
Store = Meteor.Browser-store
Store.clear = ->
  keys = Object.keys(Store.keys)
  keeps = [
    "user_loc",
    "notes",
    "gray",
    "current_nouns",
    "current_sorts",
    "current_sorts_order",
    "current_sorts_selector",
    "current_tags",
    "current_tagsets"
  ]

  diffs = _.difference(keys, keeps)

  for diff in diffs
    console.log(diff)
    Store.set(diff, null)

Store.clear-all = ->
  keys = _.keys(Store.keys)
  for key in keys
    console.log(key)
    Store.set(key, null)

do ->
  eh = Event-horizon

  eh.on "select_offer", ->
    console.log 'selected offer'




# Accounts.ui.config passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"

