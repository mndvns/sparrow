class Terrace
  constructor: ->
    @ceiling = $(".ceiling")
    @terrace = $(".terrace")
    @terraceAlert = $("#terrace-alert")
    @terraceHelp = $("#terrace-help")

  trigger: =>
    @toggle?.el.removeClass("off")
      .addClass("on")
      .on("click", =>
        @cleanUp())

    @_active = Time.now()
    @ceiling.attr "data-rally", @name
    Session.set @rallyPoint, Meteor.uuid()

  rally: (@rallyPoint, @name)=>
    context = new Meteor.deps.Context()
    context.onInvalidate(@rally)
    context.run =>
      newPane = Session.get(@rallyPoint)
      if not newPane then return
      @_ready newPane
      @ready?()

  _ready: (newPane) =>
    @Name = @name.toProperCase()
    @["terrace#{@Name}"].find(".rally-out").remove()
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
    @["terrace#{@Name}"].append """
    <div data-pane-id=#{@newPane} class='terrace-#{@name}-pane rally-in'>
      #{@paneContent}
    </div>
    """

  exitCurrentPane: (currentPane) =>
    @["terrace#{@Name}"].find("[data-pane-id=#{currentPane}]")
      .addClass("rally-out").removeClass("rally-in")

  finish: =>
    @toggle?.el.removeClass("on")
      .addClass("off")
      .off()

    @_active = 0
    @ceiling.attr "data-rally", ""
    Session.set @rallyPoint, null

