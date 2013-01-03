Meteor.Router.add({
  '/': 'home',
  '/account': 'account',
  '/account/profile': 'profile',
  '/account/offer': 'myOffer',
  '/account/metrics': 'metrics',
  '/admin/users': 'users',
  '/admin/tags': 'manageTags'
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

Meteor.Router.filter('checkLoggedIn')
Meteor.Router.filter('checkAdmin', {only: ['/admin/users']})
