
class Listener
  rally: =>
    context = new Meteor.deps.Context()
    context.onInvalidate(@rally)
    context.run =>
      newPane = Session.get(@rallyPoint)
      if not newPane then return
      @_ready newPane
      @ready?()

  constructor: ->
    @_init()


  _init: =>
    @init?()

    @rallyPoint = "#{@family}-#{@name}"
    @$rally     = $("##{@rallyPoint}")
    @$king      = $("#{@king}")

  trigger: =>
    @toggle?.el.removeClass("off")
      .addClass("on")
      .on("click", =>
        @cleanUp())

    @_active = Time.now()
    @$king.attr "data-rally", @name
    Session.set @rallyPoint, Meteor.uuid()

  _ready: (newPane) =>
    @$rally.find(".rally-out").remove()
    @_aim newPane
    @aim?()

  _aim: (newPane) =>
    @_fire newPane
    @fire?()

  _fire: (newPane) =>
    if @currentPane is newPane then return
    @currentPane = @newPane
    @exitCurrentPane(@currentPane)

    @newPane = newPane

    unless @_text then return
    @enterNewPane()

  enterNewPane: () =>
    @$rally.append """
    <div data-pane-id=#{@newPane} class='terrace-#{@name}-pane rally-in'>
      #{@paneContent}
    </div>
    """

  exitCurrentPane: (currentPane) =>
    @$rally.find("[data-pane-id=#{currentPane}]")
      .addClass("rally-out").removeClass("rally-in")

  killToggle: =>
    @toggle?.el.removeClass("on")
      .addClass("off")
      .off()

  finish: =>
    if @toggle?.el.is ".on"
      @killToggle()

    @_active = 0
    @$rally.attr "style", ""
    @$rally.css
      display: "none"
    @$king.attr "data-rally", ""
    Session.set @rallyPoint, null

