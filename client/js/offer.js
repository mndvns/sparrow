

Template.offer.helpers({
  getDistance: function (loc) {
    var myLoc = Session.get("loc")
    if (myLoc && loc) {
      var dist = distance(myLoc.lat, myLoc.long, loc.lat, loc.long, "M")
      return Math.round(dist * 10)/10
    } else {
      return false
    }
  },
  checkVote: function (selection) {
    var user = Meteor.user()
    , users = Meteor.users
    if (!user) { return false }
    if (_.contains(user.votes, selection)) { return true }
  }
})

function handleActions(event, tmpl, cb) {
  var eventEl = event.target
    , extension = eventEl.getAttribute("data-selector")
    , targetEl = $(tmpl.find("section.extension[data-extension='" + extension + "']"))

  if (eventEl.getAttribute("data-status") === "inactive") {
    eventEl.setAttribute("data-status", "active")
    targetEl.slideDown('fast', function() {
      if (! eventEl.getAttribute("data-initialized")) {
        eventEl.setAttribute("data-initialized", true)
        cb()
      }
    })
  }

  else {
    eventEl.setAttribute("data-status", "inactive")
    targetEl.slideUp('fast')
    return false
  }

}

Template.offer.events({
  'click section.actions .map i': function (event, tmpl) {

    var targetEl = tmpl.find("section.extension[data-extension='map']")

    handleActions(event, tmpl, function () {

      var map = {}
        , directionsDisplay = {}
        , directionsService = new google.maps.DirectionsService()

      var origin = Session.get("loc")
        , gorigin = new google.maps.LatLng( origin.lat, origin.long )
        , dest = tmpl.data.loc
        , gdest = new google.maps.LatLng( dest.lat, dest.long )

      directionsService.route({
        origin: gorigin,
        destination: gdest,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function (response , status) {

        directionsDisplay = new google.maps.DirectionsRenderer();
        var mapOptions = {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          scaleControl: false,
          streetViewControl: false,
          mapTypeControl: false
        }
        console.log(response, status)

        map = new google.maps.Map( targetEl, mapOptions );
        directionsDisplay.setMap( map );
        directionsDisplay.setDirections( response )
      })
    })
  },
  'click section.actions .message i': function (event, tmpl) {
    handleActions(event, tmpl, function() {
      console.log("clicked messages")
    })
  },
  'click section.actions .buy i': function (event, tmpl) {
    handleActions(event, tmpl, function() {
      console.log("clicked buy")
    })
  }
})

Template.offer.rendered = function () {
  if (Meteor.Router.page() === "account") return false

  var range = statRange()
  var keys = ["distance", "votes", "price"]
  var self = this

  var thingy = function (callback) {
    var ratio = {}
    _.each(keys, function (d) {
      var upperRange = self.data[d] - range.min[d][d] + 0.5
      var lowerRange = range.max[d][d] - range.min[d][d]
      ratio[d] = Math.round(( 100 * (upperRange) / (lowerRange))*3)/10
    })
    callback(ratio)
  }

  thingy(function (ratio) {
    for (key in ratio) {
      if (ratio.hasOwnProperty(key) && ratio[key]) {
        var action = d3.select(self.find("section.actions ." + key))

        // var bg = action.select(".bg")
        // bg
        //   .style({
        //     background: function () { return d3.hsl(self.data.color).darker(3) }
        //     })

        var metric = action.select(".metric")
        metric
          .style({
            height: function () { return ratio[key] + "%" }
          })
      }
    }
  })

//   console.log(ratio)

  // if (ratio) {

  //   d3.select(this.find(".map .metric"))
  //   .data(ratio)
  //   .transition()
  //   .style({
  //     height: function(d) { return Math.abs(ratio.distance - 100) + "%"},
  //     background: function () { return color }
  //   })
  //   d3.select(this.find(".buy .metric"))
  //   .transition()
  //   .style({
  //     height: function() { return Math.abs(ratio.price - 100) + "%"},
  //     background: function () { return color }
  //   })
  //   d3.select(this.find(".votes .metric"))
  //   .transition()
  //   .style({
  //     height: function() { return ratio.votes + "%"},
  //     background: function () { return color }
  //   })
  // }
}

Template.thisOffer.events({
  'click button': function (event, tmpl) {
    var userId = tmpl.find("input.text").value
    Meteor.call("upvoteEvent", "username", userId, this)
  }
})
