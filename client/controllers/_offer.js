var handleActions;
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
    return Point.cast(this);
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
      var map, directionsDisplay, directionsService, origin, gorigin, dest, ref$, ref1$, gdest;
      map = {};
      directionsDisplay = {};
      directionsService = new google.maps.DirectionsService();
      origin = Store.get("user_loc");
      gorigin = new google.maps.LatLng(origin.lat, origin.long);
      dest = (ref$ = tmpl.data.locations) != null ? (ref1$ = ref$[0]) != null ? ref1$.geo : void 8 : void 8;
      gdest = new google.maps.LatLng(dest[0], dest[1]);
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
Template.offer_market.events({
  'click .payment-form button': function(e, t){
    var form, offer, accessToken, card, custId;
    e.preventDefault();
    form = $(t.find("form"));
    offer = this.findOffer();
    accessToken = this.access_token;
    card = {
      number: $(".card-number").val(),
      cvc: $(".card-cvc").val(),
      exp_month: $(".card-expiry-month").val(),
      exp_year: $(".card-expiry-year").val()
    };
    if ($(e.currentTarget).hasClass("new")) {
      console.log("NEW CUSTOMER");
      return Meteor.call("stripe_customers_create", card, function(){
        var ref$, err, cust;
        ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], cust = ref$[1];
        if (err) {
          console.log('ERROR', err);
          return;
        }
        console.log('STRIPE_CUSTOMERS_CREATE', cust);
        return Meteor.call("stripe_customers_save", cust, function(){
          var ref$, err, res;
          ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], res = ref$[1];
          if (err) {
            console.log('ERROR', err);
            return;
          }
          console.log('STRIPE_CUSTOMERS_SAVE', res);
          return Meteor.call("stripe_token_create", cust.id, accessToken, function(){
            var ref$, err, token;
            ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], token = ref$[1];
            if (err) {
              console.log('ERROR', err);
              return;
            }
            console.log('STRIPE_TOKEN_CREATE', token);
            return Meteor.call("stripe_charges_create", offer, cust.id, accessToken, function(){
              var ref$, err, charge;
              ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], charge = ref$[1];
              if (err) {
                console.log('ERROR', err);
                return;
              }
              return console.log('STRIPE_CHARGES_CREATE', charge);
            });
          });
        });
      });
    } else {
      custId = My.customerId();
      console.log("EXISTING CUSTOMER");
      return Meteor.call("stripe_token_create", custId, accessToken, function(){
        var ref$, err, token;
        ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], token = ref$[1];
        if (err) {
          console.log('ERROR', err);
          return;
        }
        console.log('STRIPE_TOKEN_CREATE', token);
        return Meteor.call("stripe_charges_create", offer, custId, accessToken, function(){
          var ref$, err, charge;
          ref$ = [arguments[1][0], arguments[1][1]], err = ref$[0], charge = ref$[1];
          if (err) {
            console.log('ERROR', err);
            return;
          }
          return console.log('STRIPE_CHARGES_CREATE', charge);
        });
      });
    }
  }
});
Template.offer_market.rendered = function(){
  return $(this.find('form')).parsley({
    inputs: "input, textarea, select",
    excluded: "input[type=hidden]",
    trigger: false,
    focus: "first",
    validationMinlength: 3,
    successClass: "parsley-success",
    errorClass: "parsley-error",
    validators: {},
    messages: {},
    validateIfUnchanged: false,
    errors: {
      classHandler: function(elem, isRadioOrCheckbox){},
      container: function(elem, isRadioOrCheckbox){},
      errorsWrapper: "<ul></ul>",
      errorElem: "<li></li>"
    },
    listeners: {
      onFieldValidate: function(elem, ParsleyField){
        return false;
      },
      onFormSubmit: function(isFormValid, event, ParsleyForm){},
      onFieldError: function(elem, constraints, ParsleyField){},
      onFieldSuccess: function(elem, constraints, ParsleyField){}
    }
  });
};
Template.offer.rendered = function(){
  Session.whenTrue(['derp', 'herp'], function(){
    return console.log("DERP AND HERP");
  });
  if (typeof watchOffer != 'undefined' && watchOffer !== null) {
    return watchOffer.stop();
  }
};