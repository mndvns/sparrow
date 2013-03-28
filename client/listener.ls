
class Listener
  rally: ~>
    Deps.autorun ~>
      newPane = Session.get(@rally-ooint)
      if not newPane then return
      @_ready newPane

      @rally-point  = '#terrace-alert'
      @$rally       = $('#terrace-alert')
      @$king        = $('.ceiling')

      @ready?!

  trigger: ~>
    @toggle.remove-class "off"
      ..add-class("on")
      ..on "click", ~> @cleanUp!

    @_active = Time.now!
    @$king?.attr "data-rally", @name
    Session.set @rally-point, Random.id!

  _ready: (newPane) ~>
    @$rally?.find(".rally-out").remove!
    @_aim newPane
    @aim!

  _aim: (newPane) ~>
    @_fire newPane
    @fire!

  _fire: (newPane) ~>
    if @currentPane is newPane then return
    @currentPane = @newPane
    @exitCurrentPane(@currentPane)

    @newPane = newPane

    unless @_text then return
    @enterNewPane!

  enterNewPane: ~>
    @$rally?.append """
    <div data-pane-id=#{@newPane} class='terrace-#{@name}-pane rally-in'>
      #{@paneContent}
    </div>
    """

  exitCurrentPane: (currentPane) ~>
    @$rally?.find("[data-pane-id=#{currentPane}]")
      .addClass("rally-out").removeClass("rally-in")

  kill-toggle: ~>
    @toggle.remove-class("on")
      ..addClass("off")
      ..off!

  finish: ~>
    if @toggle.is(".on") => @kill-toggle!

    @_active = 0
    @$rally.attr "style", ""
    @$rally.css display: "none"
    @$king.attr "data-rally", ""
    Session.set @rally-point, null

  @new = -> new @


class Alert extends Listener

  set: (args)->
    @name   = "alert"
    @_text       = args.text or "Lorem ipsum"
    @_el         = args.el or "p"
    @_time       = args.time or 5000
    @_wait       = args.wait or false
    @_speed      = 400
    @paneContent = "<#{@_el}>#{@_text}</#{@_el}>"
    @toggle      = $('#dimmer')

    if args.owner => Alerts.remove owner: args.owner

    if @_active
      wait = (Time.now! - @_active)
      console.log("STILL ACTIVE", wait)
      if wait < 1000
        Meteor.setTimeout ~>
          @prep!
        , 1000
      else
        @prep!
    else
      @prep!
    return undefined

  prep: ->
    if @timout-id?      => @clearTimeout!
    if @_wait is false  => @setTimeout!

    @trigger!

  set-timeout: ~>
    @timeoutId = Meteor.set-timeout ~>
      @cleanUp!
    , @_time
    @$rally?.on "mouseenter", ~> @clear-timeout!
    @$rally?.on "mouseleave", ~> @set-timeout!

  clearTimeout: ~>
    Meteor.clearTimeout @timeoutId

  ready : ~>
    @$rally?.slideDown!.fadeIn!
  aim   : ~>
  fire  : ~>

  cleanUp: ~>
    @kill-toggle!

    @$rally?.animate opacity: 0, (@speed * 10)

    @$rally.animate {}=
      height: 0
      marginTop: -15
    , @speed, ~>

      @clearTimeout!
      @finish!


Meteor.startup ->

  unless Meteor.Alert
    Meteor.Alert = new Alert!
    Meteor.Alert.rally!

    alert = My.alert!

    if alert?
      Alerts.remove alert

    Meteor.autorun ->
      new-server-pane = Alerts.find-one!
      if new-server-pane
        Alert?.set? new-server-pane
        Session.set Alert.rally-point, new-server-pane._id


