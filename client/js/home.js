
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
  'click section.symbol': function(event, tmpl) {
    Meteor.call("upvote", "id", Meteor.userId(), this)
  },
  'mouseenter section.symbol': function(event, tmpl) {
  //   console.log(event)
  //   $(event.target).find('.mask').animate({
  //     height: 50,
  //     width: 50,
  //     padding: 25,
  //     top: 0,
  //     left: 0,
  //     borderRadius: 100
  //   }, 500)
  // },
  // 'mouseleave section.symbol': function(event, tmpl) {
  //   $(event.target).find('.mask').stop().animate({
  //     height: 0,
  //     width: 0,
  //     padding: 0,
  //     top: 50,
  //     left: 50,
  //     borderRadius: 0
  //   }, 'slow')
  }
});

Template.home.getOffers = function () {
  return Offers.find({}, {sort: {votes: 1}})
}

Template.home.styleDate = function (date) {
  return moment(date).fromNow()
}
