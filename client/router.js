

Meteor.Router.add({
  '/': function () {
    Session.set("shift_current", "home")
    return 'home'
  },
  '/home': function () {
    Session.set("shift_current", "home")
    return 'home'
  },
  '/about': function (area) {
    Session.set("shift_current", "about")
    return 'about'
  },
  '/account': function (area) {
    Session.set("shift_current", "account")
    return 'account'
  },
  '/:area/:id': function (area, id) {
    Session.set("shift_current", area)
    return area + '_' + id
  },
  '/account/profile': function () {
    Session.set("shift_current", "account")
    return 'account_profile'
  },
  '/offer/:id': function (id) {
    Session.set("showThisOffer", Offers.findOne({ business: id }))
    Session.set("header", null)
    return 'thisOffer'
  },
  '/access/*': function () {
    var urlParams = {};
    (function () {
        var match,
            pl     = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        while (match = search.exec(query))
           urlParams[decode(match[1])] = decode(match[2]);
    })();
    if (urlParams.code && Session.get("callingServer") != true) {
      Session.set("callingServer", true)
      Meteor.call('oauth', urlParams.code, function () {
        console.log("Got to Router")
        return Meteor.Router.to("/user/account/profile")
      });
    }
    else if (urlParams.error) {
      console.log(urlParams)
    }
  },
  '/*': function () {
    Session.set("shift_current", "home")
    return '404'
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

Meteor.Router.filter('checkLoggedIn', {except: ['about']})
Meteor.Router.filter('checkAdmin', {only: ['/admin/users']})
