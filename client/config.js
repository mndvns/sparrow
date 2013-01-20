
//                                                //
//           ______            _____              //
//          / ____/___  ____  / __(_)___ _        //
//         / /   / __ \/ __ \/ /_/ / __ `/        //
//        / /___/ /_/ / / / / __/ / /_/ /         //
//        \____/\____/_/ /_/_/ /_/\__, /          //
//                               /____/           //
//                                                //


/* Stripe.setPublishableKey("pk_test_xB8tcSbkx4mwjHjxZtSMuZDf") */

Meteor.startup( function () {

  window.initialize = function initialize () {

    console.log("GM INITIALIZED")

  }

  $.getScript( "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize" )
  $.getScript( "http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/qrcode.js" )

  navigator.geolocation.getCurrentPosition(foundLocation, noLocation);

  function foundLocation(location) {
    Session.set('loc', {lat: location.coords.latitude, long: location.coords.longitude});
  }
  function noLocation() {
    alert('no location');
  }
  (function() {
    var config = {
      kitId: 'lnp0fti',
      scriptTimeout: 3000
    };
    var h=document.getElementsByTagName("html")[0];h.className+=" wf-loading";var t=setTimeout(function(){h.className=h.className.replace(/(\s|^)wf-loading(\s|$)/g," ");h.className+=" wf-inactive"},config.scriptTimeout);var tk=document.createElement("script"),d=false;tk.src='//use.typekit.net/'+config.kitId+'.js';tk.type="text/javascript";tk.async="true";tk.onload=tk.onreadystatechange=function(){var a=this.readyState;if(d||a&&a!="complete"&&a!="loaded")return;d=true;clearTimeout(t);try{Typekit.load(config)}catch(b){}};var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(tk,s)
  })();

})

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
})

Meteor.subscribe("offers", Session.get("loc"))
Meteor.subscribe("tagsets")
Meteor.subscribe("tags")
Meteor.subscribe("sorts")
Meteor.subscribe("userData")
Meteor.subscribe("metrics")

Handlebars.registerHelper("styleDate", function (date) {
  return moment(date).fromNow()
})

Handlebars.registerHelper("page", function () {
  var out = {}
  out.name = Session.get("header")
  if (out.name !== "offer" && out.name !== false){
    out.pageClass = "span12 pad"
  }
  else if (out.name === "Offer") {
    out.pageClass = "accountOffer"
  }
  return out
})

