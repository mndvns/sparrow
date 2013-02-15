

#                                                //
#           ______            _____              //
#          / ____/___  ____  / __(_)___ _        //
#         / /   / __ \/ __ \/ /_/ / __ `/        //
#        / /___/ /_/ / / / / __/ / /_/ /         //
#        \____/\____/_/ /_/_/ /_/\__, /          //
#                               /____/           //
#                                                //


window.App = {}
# window.__dirname = "http://localhost:3000/"

Stripe.setPublishableKey("pk_test_xB8tcSbkx4mwjHjxZtSMuZDf") 

Color = net.brehaut.Color
Store = Meteor.BrowserStore

getLocation = ->
  foundLocation = (location) ->
    Store.set "user_loc",
      lat: location.coords.latitude
      long: location.coords.longitude

    Session.set "user_loc", Store.get "user_loc"

  noLocation = ->
    alert "no location"

  navigator.geolocation.getCurrentPosition foundLocation, noLocation

validateEmail = (email) ->
  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  re.test email

Meteor.startup ->

  window.initialize = initialize = ->
    console.log "GM INITIALIZED"

  $.getScript "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize"
  $.getScript "http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/qrcode.js"
  ( loadTypekit = ->
    config =
      kitId: "lnp0fti"
      scriptTimeout: 3000

    h = document.getElementsByTagName("html")[0]
    h.className += " wf-loading"
    t = setTimeout(->
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ")
      h.className += " wf-inactive"
    , config.scriptTimeout)
    tk = document.createElement("script")
    d = false
    tk.src = "//use.typekit.net/" + config.kitId + ".js"
    tk.type = "text/javascript"
    tk.async = "true"
    tk.onload = tk.onreadystatechange = ->
      a = @readyState
      return  if d or a and a isnt "complete" and a isnt "loaded"
      d = true
      clearTimeout t
      try
        Typekit.load config

    s = document.getElementsByTagName("script")[0]
    s.parentNode.insertBefore tk, s
  )()


Accounts.ui.config passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"

Meteor.subscribe "offers", Store.get("user_loc")
Meteor.subscribe "tagsets"
Meteor.subscribe "tags", Store.get("user_loc")

Meteor.subscribe "sorts"
Meteor.subscribe "userData"
Meteor.subscribe "messages"

Handlebars.registerHelper "styleDate", (date) ->
  if date
    moment(date).fromNow()
  else
    moment().fromNow()

Handlebars.registerHelper "getStore", (a) ->
  if Meteor.BrowserStore.get a
    return Store.get a

# {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
Handlebars.registerHelper "key_value", (obj, fn) ->
  buffer = ""
  key = undefined
  for key of obj
    if obj.hasOwnProperty(key)
      buffer += fn(
        key: key
        value: obj[key]
      )
  buffer


# {{#each_with_key container key="myKey"}}...{{/each_with_key}}
Handlebars.registerHelper "each_with_key", (obj, fn) ->
  context = undefined
  buffer = ""
  key = undefined
  keyName = fn.hash.key
  for key of obj
    if obj.hasOwnProperty(key)
      context = obj[key]
      context[keyName] = key  if keyName
      buffer += fn(context)
  buffer
Handlebars.registerHelper "equal", (a,b) ->
  return true if a is b
  return false
