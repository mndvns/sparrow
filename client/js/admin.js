
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


