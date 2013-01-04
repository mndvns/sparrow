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

Template.offer.getDistance = function (loc) {
  var myLoc = Session.get("loc")
  if (myLoc && loc) {
    var dist = distance(myLoc.lat, myLoc.long, loc.lat, loc.long, "M")
    return Math.round(dist * 10)/10
  } else {
    return false
  }
}

Template.offer.checkVote = function (selection) {
  var user = Meteor.user()
  , users = Meteor.users

  if (!user) {
    return false
  }

  if (_.contains(user.votes, selection)) {
    return true
  }
}

Template.offer.rendered = function () {
  var tagsEl = this.find("section.tags ul") 
  j = tagsEl.querySelectorAll("li").length - 1
  $(tagsEl).css({marginTop: (-(20 * j)/2) + "px" })
}

Template.thisOffer.events({
  'click button': function (event, tmpl) {
    var userId = tmpl.find("input.text").value
    Meteor.call("upvote", "username", userId, this)
  }
})
