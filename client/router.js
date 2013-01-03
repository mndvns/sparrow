Meteor.Router.add({
  '/': function () {
    Session.set("header", false)
    return 'home'
  },
  '/account': function () {
    Session.set("header", "Account")
    return 'account'
  },
  '/account/profile': function () {
    Session.set("header", "Profile")
    return 'account_profile'
  },
  '/account/offer': function () {
    Session.set("header", "Offer")
    return 'account_offer'
  },
  '/account/metrics': function () {
    Session.set("header", "Metrics")
    return 'account_metrics'
  },
  '/admin/users': function () {
    Session.set("header", "Users")
    return 'users'
  },
  '/admin/tags': function () {
    Session.set("header", "Tags")
    return 'manageTags'
  },
  '/offer/:id': function (id) {
    Session.set("showThisOffer", Offers.findOne({ name: id }))
    Session.set("header", null)
    return 'thisOffer'
  }
})

Meteor.Router.filters({
  'checkLoggedIn': function (page) {
    if (Meteor.user()) {
      return page
    } else {
      return 'home'
    }
  },
  'checkAdmin': function (page) {
    var user = Meteor.user()
    if (user.type === "basic") {
      return page
    } else {
      return 'home'
    }
  }
})

Meteor.Router.add({
})

Meteor.Router.filter('checkLoggedIn')
Meteor.Router.filter('checkAdmin', {only: ['/admin/users']})
