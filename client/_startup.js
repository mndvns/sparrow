var getLocation, validateEmail;
getLocation = function(){
  var foundLocation, noLocation;
  Meteor.Alert.set({
    text: "One moment while we charge the lasers...",
    wait: true
  });
  foundLocation = function(location){
    Store.set("user_loc", {
      lat: location.coords.latitude,
      long: location.coords.longitude
    });
    return Meteor.Alert.set({
      text: "Booya! Lasers charged!"
    });
  };
  noLocation = function(){
    return Meteor.Alert.set({
      text: "Uh oh... something went wrong"
    });
  };
  return navigator.geolocation.getCurrentPosition(foundLocation, noLocation);
};
validateEmail = function(email){
  var re;
  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
Meteor.startup(function(){
  var initialize, loadTypekit;
  window.google == null && (window.google = null);
  window.initialize = initialize = function(){
    return console.log("GM INITIALIZED");
  };
  if (App.Area.has("tests")) {
    Session.set("testing", true);
  }
  $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCcvzbUpSUtw1mK30ilGnHhGMPhIptp6Z4&sensor=false&callback=initialize");
  if (!Session.get("testing")) {
    $.getScript("http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/qrcode.js");
    (loadTypekit = function(){
      var config, h, t, tk, d, s;
      config = {
        kitId: "lnp0fti",
        scriptTimeout: 3000
      };
      h = document.getElementsByTagName("html")[0];
      h.className += " wf-loading";
      t = setTimeout(function(){
        h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
        return h.className += " wf-inactive";
      }, config.scriptTimeout);
      tk = document.createElement("script");
      d = false;
      tk.src = "//use.typekit.net/" + config.kitId + ".js";
      tk.type = "text/javascript";
      tk.async = "true";
      tk.onload = tk.onreadystatechange = function(){
        var a, d;
        a = this.readyState;
        if (d || a && a !== "complete" && a !== "loaded") {
          return;
        }
        d = true;
        clearTimeout(t);
        try {
          return Typekit.load(config);
        } catch (e$) {}
      };
      s = document.getElementsByTagName("script")[0];
      return s.parentNode.insertBefore(tk, s);
    })();
  }
  new Stopwatch("watchOffer");
  if (!Store.get("gray")) {
    return Store.set("gray", "hero");
  }
});