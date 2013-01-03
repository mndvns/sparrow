Template.manageTags.events({
  'click .save': function () {
    var name = $("#tags #name").val()
      , tagset = $("button.active").text()

    Tags.insert({
      name: name,
      tagset: tagset 
    })
  },
  'click i': function (event) {
    event.stopPropagation()
    Tags.remove({_id: this._id})
  }
})

Template.manageTagsets.events({
  'click .save': function () {
    var name = $("#tagsets #name").val()

    Tagsets.insert({
      name: name
    })
  },
  'click i': function (event) {
    event.stopPropagation()
    Tagsets.remove({_id: this._id})
  }
})

Template.users.events({
  'click th': function (event, tmpl) {
    var key = event.target.getAttribute("data-sort-value")
    Session.set("sort", {key:key, order:"asc"})
  },
  'click button.remove': function (event, tmpl) {
    Meteor.users.remove({_id: this._id})
  },
  'click td': function (event, tmpl) {
    event.target

  }
})

Template.users.helpers({
  getUsers: function () {
    var sort = Session.get("sort") || {}
    if(!sort.key){
      sort = {
        key: "username",
        order: "desc"
      }
    }
    var users = Meteor.users.find({}, {sort: [sort.key, sort.order]})
    return users
  }
})

Template.users.rendered = function () {
  $("button[data-button-type='basic']").addClass("btn-primary")
  $("button[data-button-type='admin']").addClass("btn-danger")
}
