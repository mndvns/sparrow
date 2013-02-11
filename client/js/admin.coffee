#////////////////////////////////////////////
#  $$ helpers

Handlebars.registerHelper "grab", (a, z) ->
  m = undefined
  if a is "Users"
    m = Meteor.users.find().fetch()
  else if a is "User"
    m = [Meteor.user()]
  else
    m = window[a].find().fetch()
  out =
    name: a
    collection: m
    keys: ->
      self = this
      if self.collection and self.collection[0] then Object.keys(self.collection[0])

  z.fn out

Handlebars.registerHelper "first", (a, options) ->
  that = _.first(a)
  options.fn that


#////////////////////////////////////////////
#  $$ editor
Template.editor.events
  "click tbody tr": (event, tmpl) ->
    selector = event.currentTarget.id
    chosen = _.find(tmpl.data.collection, (d) ->
      d._id is selector
    )
    for key of chosen
      $(tmpl.find("input#" + key)).val chosen[key]

  "click .save": (event, tmpl) ->
    selector = tmpl.find("input#_id").value
    collection = tmpl.find(".editor").id
    inputs = tmpl.findAll("input")
    
    # user_.rest so we igore the #_id input
    keys = _.rest(_.pluck(inputs, "id"))
    values = _.rest(_.pluck(inputs, "value"))
    updated = _.object(keys, values)
    console.log keys, values
    if event.target.id is "update"
      window[collection].update
        _id: selector
      , updated
    else window[collection].insert updated  if event.target.id is "add"

  "click .remove": (event, tmpl) ->
    selector = tmpl.find("input#_id").value
    collection = tmpl.find(".editor").id
    window[collection].remove _id: selector
    console.log "REMOVE"

Template.editor.rendered = ->
  
  #  temporary... hide id elements. they're annoying
  $(@findAll(".control-group#_id")).hide()
  $(@findAll("th#_id, tr td#_id")).hide()
