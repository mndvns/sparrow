var handleActions, adjustOfferElements, setPadding, this$ = this;
handleActions = function(event, tmpl, cb){
  var eventEl, extension, targetEl;
  eventEl = event.currentTarget;
  extension = eventEl.getAttribute("data-selector");
  targetEl = $(tmpl.find("section.extension[data-extension='" + extension + "']"));
  if (eventEl.getAttribute("data-status") === "inactive") {
    eventEl.setAttribute("data-status", "active");
    return targetEl.slideDown("fast", function(){
      if (!eventEl.getAttribute("data-initialized")) {
        eventEl.setAttribute("data-initialized", true);
        return cb();
      }
    });
  } else {
    eventEl.setAttribute("data-status", "inactive");
    targetEl.slideUp("fast");
    return false;
  }
};
Template.offer.helpers({
  getDistance: function(loc){
    var myLoc, dist;
    myLoc = Store.get("user_loc");
    if (myLoc && loc) {
      dist = distance(myLoc.lat, myLoc.long, loc.lat, loc.long, "M");
      return Math.round(dist * 10) / 10;
    } else {
      return false;
    }
  },
  checkVote: function(selection){
    var user, users;
    user = Meteor.user();
    users = Meteor.users;
    if (!user) {
      return false;
    }
    if (_.contains(user.votes, selection)) {
      return true;
    }
  }
});
Template.offer.events({
  'click .help-mode .offer': function(){
    return false;
  },
  'click .vote': function(event, tmpl){
    watchOffer.click();
    return Meteor.call("upvoteEvent", tmpl.data);
  },
  'click .image': function(event, tmpl){
    return console.log(this);
  },
  'click .main': function(event, tmpl){
    return console.log(Meteor.users.findOne({
      _id: this.owner
    }));
  },
  "click section.actions li.map": function(event, tmpl){
    var targetEl;
    targetEl = tmpl.find("section.extension[data-extension='map'] .inner.map");
    return handleActions(event, tmpl, function(){
      var map, directionsDisplay, directionsService, origin, gorigin, dest, gdest;
      map = {};
      directionsDisplay = {};
      directionsService = new google.maps.DirectionsService();
      origin = Store.get("user_loc");
      gorigin = new google.maps.LatLng(origin.lat, origin.long);
      dest = tmpl.data.loc;
      gdest = new google.maps.LatLng(dest.lat, dest.long);
      return directionsService.route({
        origin: gorigin,
        destination: gdest,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function(response, status){
        var directionsDisplay, mapOptions, map;
        directionsDisplay = new google.maps.DirectionsRenderer();
        mapOptions = {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          scaleControl: false,
          streetViewControl: false,
          mapTypeControl: false
        };
        console.log(response, status);
        map = new google.maps.Map(targetEl, mapOptions);
        directionsDisplay.setMap(map);
        directionsDisplay.setDirections(response);
        return tmpl.find(".time span.value").textContent = response.routes[0].legs[0].duration.text;
      });
    });
  },
  "click section.actions li.message": function(event, tmpl){
    return handleActions(event, tmpl, function(){
      return console.log("clicked messages");
    });
  },
  "click section.actions li.reserve": function(event, tmpl){
    return handleActions(event, tmpl, function(){
      return console.log("clicked buy");
    });
  },
  'click .payment-form button': function(event, tmpl){
    var form;
    event.preventDefault();
    form = $(tmpl.find("form"));
    form.find("button").prop('disabled', true);
    return Stripe.createToken({
      number: $(".card-number").val(),
      cvc: $(".card-cvc").val(),
      exp_month: $(".card-expiry-month").val(),
      exp_year: $(".card-expiry-year").val()
    }, "sk_test_AAKXLw2R4kozgEqCoMFu9ufH", function(status, response){
      var token, customer_id, createCharge;
      if (response.error) {
        form.find("button").prop("disabled", false);
        return Meteor.Alert.set({
          text: response.error.message
        });
      } else {
        console.log(response.id);
        token = response.id;
        form.append($("<input type=\"hidden\" name=\"stripeToken\" />").val(token));
        customer_id = Meteor.user().stripe_customer_id;
        createCharge = function(){
          return Meteor.call("stripeChargeCreate", {
            amount: 1000,
            application_fee: 250,
            user: Meteor.user()
          }, function(err, res){
            if (err) {
              throw err;
            }
            return console.log(err, res, "stripeChargeCreate");
          });
        };
        if (!customer_id) {
          console.log("NEW CUSTOMER");
          return Meteor.call("stripeCustomerCreate", token, function(err, res){
            var customerId, ref$;
            if (err) {
              throw err;
            }
            console.log(err, res, "stripeCustomerCreate");
            customerId = (ref$ = _.compact(res)) != null ? ref$.toString() : void 8;
            return Meteor.call("stripeSaveCustomerId", customerId, function(err, res){
              if (err) {
                throw err;
              }
              console.log(err, res, "stripeSaveCustomerId");
              return createCharge();
            });
          });
        } else {
          console.log("CUSTOMER EXISTS");
          return createCharge();
        }
      }
    });
  },
  "click .send": function(event, tmpl){
    var target, textarea, container;
    target = $(event.target);
    if (target.hasClass("busy")) {
      return false;
    }
    target.addClass("busy");
    textarea = $(tmpl.find("textarea"));
    container = textarea.siblings();
    return Meteor.call("message", textarea.val(), "offer", tmpl.data.owner, function(err, res){
      if (err) {
        return console.log("Error. You done goofed.", err);
      } else {
        console.log("Successfully sent message", res);
        container.text("Message successfully sent!");
        textarea.fadeOut(600);
        container.fadeIn(600);
        return Meteor.setTimeout(function(){
          textarea.val("").fadeIn(600);
          container.fadeOut(600);
          return target.removeClass("busy");
        }, 3000);
      }
    });
  }
});
adjustOfferElements = function(main){
  var kids, bottom, padding_top;
  kids = main.children;
  bottom = kids[kids.length - 1].offsetTop;
  padding_top = (170 - bottom) * 0.3;
  return padding_top;
};
setPadding = function(section_main){
  var padding_top;
  padding_top = adjustOfferElements(section_main);
  return $(section_main).css("padding-top", padding_top);
};
Template.offer.rendered = function(){
  var range, keys, self, renderRatio, userId, voted;
  setPadding(this.find("section.main"));
  if (Session.get("shift_area") === "account" || Meteor.Router.page() === "account_offer") {
    return;
  }
  range = statRange();
  keys = [
    {
      name: "updatedAt",
      invert: false
    }, {
      name: "distance",
      invert: true
    }, {
      name: "votes_count",
      invert: false
    }, {
      name: "price",
      invert: true
    }
  ];
  self = this;
  renderRatio = function(callback){
    var ratio;
    ratio = {};
    _.each(keys, function(k){
      var d, upperRange, lowerRange, out;
      d = k.name;
      upperRange = self.data[d] - range.min[d] + 0.01;
      lowerRange = range.max[d] - range.min[d];
      out = Math.ceil((100 * upperRange / lowerRange) * 5) / 10;
      return ratio[d] = k.invert === false
        ? out
        : Math.abs(out - 50);
    });
    return callback(ratio);
  };
  renderRatio(function(ratio){
    var key, data, metric, results$ = [];
    for (key in ratio) {
      if (ratio.hasOwnProperty(key) && ratio[key]) {
        data = d3.select(self.find("section.data ." + key));
        metric = data.select(".metric");
        results$.push(metric.style({
          height: fn$
        }));
      }
    }
    return results$;
    function fn$(){
      return ratio[key] + "%";
    }
  });
  userId = Meteor.userId();
  voted = _.find(self.data.votes_meta, function(d){
    return d.user === userId;
  });
  if (voted) {
    self.find("li.vote").setAttribute("disabled");
  }
  if (typeof watchOffer != 'undefined' && watchOffer !== null) {
    return watchOffer.stop();
  }
};
Template.offer.created = function(){};
Template.thisOffer.events({
  "click button": function(event, tmpl){
    var userId;
    userId = tmpl.find("input.text").value;
    return Meteor.call("upvoteEvent", "username", userId, this);
  }
});