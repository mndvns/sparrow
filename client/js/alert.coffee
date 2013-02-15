
class Dimmer
  constructor: (args) ->
    @el = $("#dimmer")
    @el.css("background", args?.color or "white")
    @opacity = args?.opacity or 0.5
    @speed = args?.speed or 300

  dimIn: =>
    @el.css("display", "block")
    @el
      .stop(true, true)
      .animate
        opacity: @opacity
        , @speed

  dimOut: =>
    @el
      .stop(true,true)
      .animate
        opacity: 0
        , @speed
        , =>
          @el.css("display", "none")

class TerraceAlert
  constructor: (args) ->
    terrace = window.App.currentTerrace
    terrace?.neutralize()
    terrace = @

    @body = $("body")
    @terrace = $(".terrace")
    @togglerGroups = $(".toggler-group")
    @terraceAlert = $("#terrace-alert")
    @terraceAlert.append("<p>#{args.text}</p>")
    @terraceText = @terraceAlert.children("p")
    @dimmer = args.dimmer or new Dimmer(@)
    @temp = args.temp or false

    @speed = args.speed or 200
    @autoFade = args.autoFade or true
    @setTimeout() if @autoFade
    @show()

  setTimeout: =>
    @timeoutId = Meteor.setTimeout =>
      @hide()
    , unless typeof @autoFade is "number" then 5000
    @terraceAlert.on "mouseenter", =>
      Meteor.clearTimeout @timeoutId
    @terraceAlert.on "mouseleave", =>
      @setTimeout()

  neutralize: =>
    Meteor.clearTimeout @timeoutId
    @body.off 'click', #dimmer

  kill: (cb)=>
    @terraceText.slideUp @speed
    Meteor.setTimeout ->
      cb()
    , @speed / 2

  show: =>
    @dimmer.dimIn() if @dimmer
    unless @temp
      @togglerGroups
        .stop(true, true)
        .fadeOut(@speed)
    @terrace
      .stop(true, true)
      .slipShow
        speed: 1
        haste: 1
    @terraceAlert.slipShow
      speed: @speed
      haste: 1
      , =>
    @body.on "click", "#dimmer", =>
      @hide()

  hide: =>
    @neutralize()
    @dimmer.dimOut() if @dimmer
    @terraceAlert
      .stop(true,true)
      .slipHide
        speed: @speed
        haste: 1
    @togglerGroups
      .stop(true, true)
      .fadeIn(@speed)
    @terrace
      .stop(true, true)
      .slipHide
        speed: @speed
        haste: 1
      , =>
        @terraceText
          .remove()
        window.App.currentTerrace = null
