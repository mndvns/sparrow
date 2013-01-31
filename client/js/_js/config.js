// 
// //                                                //
// //           ______            _____              //
// //          / ____/___  ____  / __(_)___ _        //
// //         / /   / __ \/ __ \/ /_/ / __ `/        //
// //        / /___/ /_/ / / / / __/ / /_/ /         //
// //        \____/\____/_/ /_/_/ /_/\__, /          //
// //                               /____/           //
// //                                                //
// 
// 
// /* Stripe.setPublishableKey("pk_test_xB8tcSbkx4mwjHjxZtSMuZDf") */
// 
// Color = net.brehaut.Color
// 
// var getLocation = function () {
// 
//   var foundLocation = function (location) {
//     amplify.set('user.loc', {
//       "lat": location.coords.latitude,
//       "long": location.coords.longitude
//     })
//   }
// 
//   var noLocation = function() { alert('no location') };
// 
//   navigator.geolocation.getCurrentPosition( foundLocation, noLocation )
// }
// 
// Meteor.startup( function () {
// 
//   window.initialize = function initialize () { console.log("GM INITIALIZED") }
// 
//   $.getScript( "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize" )
//   $.getScript( "http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/qrcode.js" )
// 
//   var loadTypekit = function() {
//     var config = {
//       kitId: 'lnp0fti',
//       scriptTimeout: 3000
//     };
//     var h=document.getElementsByTagName("html")[0];h.className+=" wf-loading";var t=setTimeout(function(){h.className=h.className.replace(/(\s|^)wf-loading(\s|$)/g," ");h.className+=" wf-inactive"},config.scriptTimeout);var tk=document.createElement("script"),d=false;tk.src='//use.typekit.net/'+config.kitId+'.js';tk.type="text/javascript";tk.async="true";tk.onload=tk.onreadystatechange=function(){var a=this.readyState;if(d||a&&a!="complete"&&a!="loaded")return;d=true;clearTimeout(t);try{Typekit.load(config)}catch(b){}};var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(tk,s)
//   }();
// 
//   // if (! amplify.get("user.loc")) {
//   //   console.log("Attempting to get location...")
//   //   getLocation()
//   // }
// 
// })
// 
// Accounts.ui.config({
//   passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
// })
// 
// Meteor.subscribe("offers", Session.get("user_loc"))
// Meteor.subscribe("tagsets")
// Meteor.subscribe("tags")
// Meteor.subscribe("sorts")
// Meteor.subscribe("userData")
// Meteor.subscribe("metrics")
// 
// Meteor.subscribe("messages")
// 
// Handlebars.registerHelper("styleDate", function (date) {
//   if (date) {
//     return moment(date).fromNow()
//   } else {
//     return moment().fromNow()
//   }
// })
// 
// Handlebars.registerHelper("getAmplify", function (a) {
//   if ( Session.get(a) ) {
//     return true
//   } else {
//     var p = a.split("_").join('.')
//     if ( amplify.get(p) ) {
//       return true
//     } else {
//       return false
//     }
//   }
// })
// 
// 
// 
