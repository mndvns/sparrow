Meteor.startup( function () {

  window.initialize = function initialize () {

    console.log("Google Maps initialized")

    map = {}
    directionsDisplay = {}
    j = new google.maps.DirectionsService()

    origin = Session.get("loc")
    gorigin = new google.maps.LatLng( origin.lat, origin.long )
    dest = as("loc")
    gdest = new google.maps.LatLng( dest.lat, dest.long )

    j.route({
      origin: gorigin,
      destination: gdest,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function (response , status) {
      console.log(response, status)

      directionsDisplay = new google.maps.DirectionsRenderer();
      var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
      directionsDisplay.setMap(map);
      directionsDisplay.setDirections(response)
    })

  }

  $.getScript( "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize" )

  navigator.geolocation.getCurrentPosition(foundLocation, noLocation);

  function foundLocation(location) {
    console.log(location);
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

Handlebars.registerHelper("getUser", function (user) {
  return Meteor.user()
})

Handlebars.registerHelper("getTagsets", function (data) {
  return Tagsets.find()
})

Handlebars.registerHelper('getTags', function() {
  return Tags.find({tagset: this.name})
})
