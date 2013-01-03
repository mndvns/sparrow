Meteor.startup( function () {

  window.distance = function (lat1, lon1, lat2, lon2, unit) {
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

  window.initialize = function initialize () {

    console.log("Google Maps initialized")

    // map = {}
    // directionsDisplay = {}
    // j = new google.maps.DirectionsService()

    // origin = Session.get("loc")
    // gorigin = new google.maps.LatLng( origin.lat, origin.long )
    // dest = as("loc")
    // gdest = new google.maps.LatLng( dest.lat, dest.long )

    // j.route({
    //   origin: gorigin,
    //   destination: gdest,
    //   travelMode: google.maps.DirectionsTravelMode.DRIVING
    // }, function (response , status) {
    //   console.log(response, status)

    //   directionsDisplay = new google.maps.DirectionsRenderer();
    //   var mapOptions = {
    //     mapTypeId: google.maps.MapTypeId.ROADMAP
    //   }
    //   map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    //   directionsDisplay.setMap(map);
    //   directionsDisplay.setDirections(response)
    // })

  }

  $.getScript( "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize" )

  $.getScript( "http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/qrcode.js" )

  navigator.geolocation.getCurrentPosition(foundLocation, noLocation);

  function foundLocation(location) {
    console.log("Got user location")
    Session.set('loc', {lat: location.coords.latitude, long: location.coords.longitude});
  }
  function noLocation() {
    alert('no location');
  }

  myOffer = function () {
    return Offers.findOne({ owner: Meteor.userId() }) || "User hasn't made an offer."
  }
})

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
})

Meteor.subscribe("offers", Session.get("loc"))
Meteor.subscribe("tags")
Meteor.subscribe("allUserData")

Handlebars.registerHelper("styleDate", function (date) {
  return moment(date).fromNow()
})

Handlebars.registerHelper("getTagsets", function (data) {
  if (data) {
    j = Tagsets.find({ name: data })
  } else {
    j = Tagsets.find()
  }
  return Tagsets.find()
})

Handlebars.registerHelper('getTags', function() {
  return Tags.find({tagset: this.name})
})

Handlebars.registerHelper('getThisOffer', function () {
  return Session.get("showThisOffer")
})

Handlebars.registerHelper("getUser", function () {
  return Meteor.user()
})

Handlebars.registerHelper("page", function () {
  var out = {}
  out.name = Session.get("header")
  if (out.name !== "Offer" && out.name !== false){
    out.pageClass = "span12 pad"
  }
  else if (out.name === "Offer") {
    out.pageClass = "accountOffer"
  }
  return out
})

Handlebars.registerHelper("tagTable", function (data) {
})


Handlebars.registerHelper("checkExpiration", function (data) {
  // j = data
  // return _.filter(j, function (data) {
  //   return data.exp > moment().unix()
  // })
  return data
})
