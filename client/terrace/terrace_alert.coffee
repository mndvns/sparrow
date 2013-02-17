
class Alert extends Terrace
  rally: =>
    super "terrace_alert", "alert"

  set: (args)=>
    @_text = args.text or "Lorem ipsum"
    @_el = args.el or "p"
    @_time = args.time or 5000
    @_wait = args.wait or false
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
    @terraceAlert.on "mouseenter", =>
      @clearTimeout()
    @terraceAlert.on "mouseleave", =>
      @setTimeout()

  clearTimeout: =>
    Meteor.clearTimeout @timeoutId

  ready : =>
  aim   : =>
  fire  : =>

  cleanUp: =>
    @clearTimeout()
    @finish()

