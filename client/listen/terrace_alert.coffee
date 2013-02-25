
class Alert extends Listener
  init: =>
    @name   = "alert"
    @family = "terrace"
    @king   = ".ceiling"

  set: (args)=>
    @_text = args.text or "Lorem ipsum"
    @_el = args.el or "p"
    @_time = args.time or 5000
    @_wait = args.wait or false
    @_speed = 400
    @paneContent = "<#{@_el}>#{@_text}</#{@_el}>"
    @toggle =
      el: args.dimmer or $("#dimmer")

    if args.owner
      Alerts.remove owner: args.owner

    if @_active
      wait = (Time.now() - @_active)
      console.log("STILL ACTIVE", wait)
      if wait < 1000
        Meteor.setTimeout =>
          @prep()
        , 1000
      else
        @prep()
    else
      @prep()
    return undefined

  prep: ->
    @clearTimeout()
    @setTimeout() if @_wait is false
    @trigger()

  setTimeout: =>
    @timeoutId = Meteor.setTimeout =>
      @cleanUp()
    , @_time
    @$rally.on "mouseenter", =>
      @clearTimeout()
    @$rally.on "mouseleave", =>
      @setTimeout()

  clearTimeout: =>
    Meteor.clearTimeout @timeoutId

  ready : =>
    @$rally.slideDown().fadeIn()
  aim   : =>
  fire  : =>

  cleanUp: =>
    @killToggle()

    @$rally.animate
      opacity: 0
    , (@speed * 10)

    @$rally.animate
      height: 0
      marginTop: -15
    , @speed, =>

      @clearTimeout()
      @finish()

