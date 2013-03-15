
class Links
  rally: =>
    context = new Meteor.deps.Context()
    context.onInvalidate(@rally)
    context.run =>
      @area = Session.get("shift_area")
      console.log("AREA", @area)

  init: =>
    @name = "links"
    @family = "linker"

  set: (args) =>
    Session.set("shift_area", args.area)
    Session.set("shift_direction", args.direction)


# Template.linker.event
#   'click .shift'
