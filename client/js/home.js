

//////////////////////////////////////////////
//  $$  globals and locals

Sparrow = {}
Sparrow.shift = function () {
  return Session.get("shift_area")
}

statCurrent = function () {

  var out = {
    query  : {
      tagset : Session.get("current_tagsets"),
      tag    : Session.get("current_tags"),
      sort   : {
        selector  : Session.get("current_sorts_selector"),
        order     : Session.get("current_sorts_order"),
      }
    },
    verbose: {
      tagset : Session.get("current_tagsets"),
      tag    : Session.get("current_tags"),
      sort   : Session.get("current_sorts"),
      noun   : Session.get("current_nouns")
    }
  }

  out.verbose.tagset = out.verbose.tagset && out.verbose.tagset.length ? out.verbose.tagset : ["find"]
  out.verbose.noun = out.verbose.noun && out.verbose.noun.length ? out.verbose.noun : ["offer"]
  out.verbose.article = out.verbose.sort && out.verbose.sort.length ? ["the"] : ["some"]

  if (out.verbose.tagset.toString() === "shop") {
    var article = out.verbose.article.toString()
    out.verbose.article = ["for " + article]
  }

  return out
}

statRange = function () {
  var out = {
    max: {
      distance : Session.get("max_distance"),
      votes    : Session.get("max_votes"),
      price    : Session.get("max_price")
    },
    min: {
      distance : Session.get("min_distance"),
      votes    : Session.get("min_votes"),
      price    : Session.get("min_price")
    }
  }
  return out
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}


//////////////////////////////////////////////
//  $$ helpers

Handlebars.registerHelper('page_next', function (area) {
  if (area !== Session.get("shift_area")) { return false }

  Meteor.Transitioner.setOptions({
    "after": function () {
      Meteor.Router.to( area === "home" ? "/" : "/" + area)
      Session.set("shift_current", area)
    }
  })
  return area
})

//////////////////////////////////////////////
//  $$ body

Template.body.events({
  "click .shift i": function (event, tmpl) {

    var dir = event.target.parentElement.getAttribute("data-shift-direction")
    var area = event.target.parentElement.getAttribute("data-shift-area")
    var page = Meteor.Router.page()
    var current = _.first(page.split("_"))

    Session.set("shift_direction", dir)
    Session.set("shift_area", area)
    Session.set("shift_current", current)

  }
})

//////////////////////////////////////////////
//  $$ home

Template.home.events({
  'click section.actions .votes i': function(event, tmpl) {
    Meteor.call("upvoteEvent", "id", Meteor.userId(), this)
  }
});

Template.home.getOffers = function () {

  var query = {}
  var sort = {}

  var current = statCurrent().query

  for (key in current) {
    if (current.hasOwnProperty(key)) {
      if (key === "sort") {
        sort[current[key].selector] = current[key].order
      }
      if (current[key] && current[key].length) {
        if (key === "tag") {
          query.tags = { $in: current[key]}
        }
        if (key === "tagset") {
          query[key] = { $in: current[key] }
        }
      }
    }
  }

  var result = Offers.find(query, {sort: sort}).fetch()
  var myLoc = Session.get("loc")

  if (result && myLoc) {

    var survey = _.each(result, function (d) {
      d.distance = Math.round(distance(myLoc.lat, myLoc.long, d.loc.lat, d.loc.long, "M")*10)/10
    })

    var range = {
      max: {
        distance : _.max(result, function (o) { return o.distance }),
        votes    : _.max(result, function (o) { return o.votes }),
        price    : _.max(result, function (o) { return o.price })
      },
      min: {
        distance : _.min(result, function (o) { return o.distance }),
        votes    : _.min(result, function (o) { return o.votes }),
        price    : _.min(result, function (o) { return o.price })
      }
    }

    Session.set("max_distance", range.max.distance)
    Session.set("max_votes", range.max.votes)
    Session.set("max_price", range.max.price)
    Session.set("min_distance", range.min.distance)
    Session.set("min_votes", range.min.votes)
    Session.set("min_price", range.min.price)

    return result
  }

}

Template.home.styleDate = function (date) {
  return moment(date).fromNow()
}

