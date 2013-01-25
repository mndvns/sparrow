//////////////////////////////////////////////
//  $$ helpers

Handlebars.registerHelper("key_value", function (a, fn) {
  var out = "", key
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      if ( _.isObject(a[key]) && ! a[key].length ) {
      }
      if ( _.isArray(a[key])) {
        out += fn({ key: key, value:a[key].length })
      }
      else {
        out += fn({ key: key, value:a[key] })
      }
    }
  }
  return out
})

Handlebars.registerHelper("grab", function (a, z) {
  var m
  if (a === "Users"){
    m = Meteor.users.find().fetch() }
  else if (a === "User"){
    m = [Meteor.user()] }
  else {
    m = window[a].find().fetch() }

  var out = {
    name: a,
    collection: m,
    keys: function () {
      var self = this
      return Object.keys(self.collection[0])
    },
  }
  return z.fn(out)
})

Handlebars.registerHelper("first", function (a, options) {
  var that = _.first(a)
  return options.fn(that)
})

//////////////////////////////////////////////
//  $$ editor

Template.editor.events({
  'click tbody tr': function (event, tmpl) {
    var selector = event.currentTarget.id
    var chosen = _.find(tmpl.data.collection, function (d) {
      return d._id === selector })

    for (var key in chosen) {
      $(tmpl.find("input#" + key)).val(chosen[key])}
  },
  'click .save': function (event, tmpl) {
    var selector   = tmpl.find("input#_id").value
    var collection = tmpl.find(".editor").id
    var inputs     = tmpl.findAll("input")

    // user_.rest so we igore the #_id input
    var keys       = _.rest(_.pluck(inputs, "id"))
    var values     = _.rest(_.pluck(inputs, "value"))

    var updated    = _.object(keys, values)

    console.log(keys, values)

    if (event.target.id === "update") {
      window[collection].update({_id: selector }, updated )
    }
    else if (event.target.id === "add") {
      window[collection].insert( updated )
    }
  },
  'click .remove': function (event, tmpl) {
    var selector   = tmpl.find("input#_id").value
    var collection = tmpl.find(".editor").id
    window[collection].remove({_id: selector })
    console.log("REMOVE")
  }
})

Template.editor.rendered = function () {
  //  temporary... hide id elements. they're annoying
  $(this.findAll(".control-group#_id")).hide()
  $(this.findAll("th#_id, tr td#_id")).hide()
}


