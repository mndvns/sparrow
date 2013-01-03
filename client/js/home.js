
Template.sidebar.getUserType = function (type) {
  var user = Meteor.user()
  if (!user){
    return false
  } else if (user.type == type) {
    return true
  }
}

Template.sidebar.events({
  'click a': function () {
    Session.set("status_alert", null)
  }
})

Template.home.events({
  'click .votes': function(event, template) {
    Meteor.call("upvote", "id", Meteor.userId(), this)
  }
});

Template.home.getOffers = function () {
  return Offers.find({}, {sort: {votes: 1}})
}

Template.home.styleDate = function (date) {
  return moment(date).fromNow()
}
