

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
  'click section.actions li.map': function (event, tmpl) {

    var targetEl = tmpl.find("section.extension[data-extension='map'] .inner.map")

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
  'click section.actions li.message': function (event, tmpl) {
    handleActions(event, tmpl, function() {
      console.log("clicked messages")
    })
  },
  'click section.actions li.reserve': function (event, tmpl) {
    handleActions(event, tmpl, function() {
      console.log("clicked buy")
    })
  },
  'click .send': function (event, tmpl) {
    var target = $(event.target)
    if (target.hasClass("busy")) return false
    target.addClass("busy")

    var textarea = $(tmpl.find("textarea"))
    var container = textarea.siblings()
    Meteor.call("message", textarea.val(), "offer", tmpl.data.owner, function (err, res) {
      if (err) { console.log("Error. You done goofed.", err) }
      else {
        console.log("Successfully sent message", res)
        container.text("Message successfully sent!")
        textarea.fadeOut( 600 )
        container.fadeIn( 600 )
        Meteor.setTimeout( function () {
          textarea.val("").fadeIn( 600 )
          container.fadeOut( 600 )
          target.removeClass("busy")
        }, 3000)
      }
    })
  }
})


Template.offer.rendered = function () {
  if (Meteor.Router.page() === "account_offer") return false

  var range = statRange()
  var keys = [
    { name: "updatedAt",
      invert: false
    },
    { name: "distance",
      invert: true
    },
    { name: "votes",
      invert: false
    },
    { name: "price",
      invert: true
    }
  ]

  var self = this

  var renderRatio = function (callback) {
    var ratio = {}
    _.each(keys, function (k) {
      var d = k.name
      var upperRange = self.data[d] - range.min[d][d] + 0.01
      var lowerRange = range.max[d][d] - range.min[d][d]
      var out = Math.ceil(( 100 * (upperRange) / (lowerRange))*5)/10
      ratio[d] = k.invert === false ? out : Math.abs(out - 50)

    })
    callback(ratio)
  }

  renderRatio( function (ratio) {
    for (key in ratio) {
      if (ratio.hasOwnProperty(key) && ratio[key]) {
        var data = d3.select(self.find("section.data ." + key))

        var metric = data.select(".metric")
        metric
          .style({
            height: function () { return ratio[key] + "%" }
          })
        }
      }
  })

}

Template.thisOffer.events({
  'click button': function (event, tmpl) {
    var userId = tmpl.find("input.text").value
    Meteor.call("upvoteEvent", "username", userId, this)
  }
})
