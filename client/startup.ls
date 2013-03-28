


getLocation = ->
  Meteor.Alert.set {}=
    text: "One moment while we charge the lasers..."
    wait: true

  foundLocation = (location) ->
    Store.set "user_loc",
      lat: location.coords.latitude
      long: location.coords.longitude

    Meteor.Alert.set {}=
      text: "Booya! Lasers charged!"

  noLocation = ->
    Meteor.Alert.set {}=
      text: "Uh oh... something went wrong"

  navigator.geolocation.getCurrentPosition foundLocation, noLocation

validateEmail = (email) ->
  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  re.test email

Meteor.startup ->

  window.google ?= null
  window.initialize = initialize = ->
    console.log "GM INITIALIZED"

  if App.Area.has("tests")
    Session.set "testing", true

    # unless Session.get "testing"
  $.getScript "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize"


  unless Session.get "testing"
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

  new Stopwatch "watchOffer"



  unless Store.get("gray")
    Store.set "gray", "hero"


