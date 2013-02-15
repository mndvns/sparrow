
class Terrace
  constructor: ->
    @terrace = $(".terrace")
    @terraceAlert = $("#terrace-alert")

  set: (args)=>
    @newPaneText = args.text
    @textEl = args.el
    Session.set "terrace_new_pane", Meteor.uuid()

  rally: =>
    context = new Meteor.deps.Context()
    context.onInvalidate(@rally)
    context.run =>
      newPane = Session.get("terrace_new_pane")
      if not newPane then return
      @fire newPane

  fire: (newPane) =>
    @terraceAlert.addClass "rallying"
    @updatePanes newPane

  farewell: (newPane) =>
    @currentPane.slideUp()
    @updatePanes(newPane)


  updatePanes: (newPane) =>
    if @currentPane is newPane then return

    @currentPane = @newPane
    @exitCurrentPane(@currentPane)

    @newPane = newPane
    @enterNewPane(newPane)

  enterNewPane: (newPane) =>
    unless @newPaneText then return
    @terraceAlert.append """
    <div data-pane-id=#{newPane} class='terrace-pane rally-in'>
      <#{@textEl}>#{@newPaneText}</#{@textEl}>
    </div>
    """

  exitCurrentPane: (currentPane) =>
    @terraceAlert.find("[data-pane-id=#{currentPane}]").addClass("rally-out").removeClass("rally-in")



Template.ceiling.rendered = ->
  unless Meteor.Terrace
    Meteor.Terrace = new Terrace()
    Meteor.Terrace.rally()

