
//////////////////////////////////////////////
//  $$ globals locals

as = amplify.store

var permittedKeys = [8, 37, 38, 39, 40, 46, 9, 91, 93]

var values = {
  business: {
    default: 'your business/vendor name',
    maxLength: 30,
    message: "Too short"
  },
  city: {
    default: 'Kansas City',
    maxLength: 50,
    message: "City error"
  },
  color: {
    default: '#ccc',
  },
  description: {
    default: 'This is a description of the offer. Since the offer name must be very brief, this is the place to put any details you want to include.',
    maxLength: 140,
    message: "Description error"
  },
  loc: {
    default: '',
  },
  name: {
    default: 'Offer',
    maxLength: 10,
    message: "No way, too short!"
  },
  price: {
    default: '10',
  },
  street: {
    default: '200 Main Street',
    maxLength: 50,
    message: "Street error"
  },
  state: {
    default: 'MO',
    maxLength: 30,
    message: "State error"
  },
  symbol: {
    default: 'glyph-lamp-2',
  },
  tags: {
    default: '',
  },
  tagset: {
    default: '',
  },
  updatedAt: {
    default: '',
  },
  votes: {
    default: '1',
  },
  zip: {
    default: '64105',
    maxLength: 6,
    message: "Zip error"
  },
}

//////////////////////////////////////////////
//  $$ helpers

Handlebars.registerHelper("signedIn", function (a, fn) {
  if (!Meteor.user()) { return false } else { return true }
})

Handlebars.registerHelper("key_value", function (a, fn) {
  var out = "", key
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      out += fn({ key: key, value:a[key]})
    }
  }
  return out
})

Handlebars.registerHelper("grab", function (a, z) {
  var m
  if (a === "Users"){
    m = Meteor.users.find().fetch() }
  else if (a === "User"){
    m = [Meteor.user()] }
  else {
    m = window[a].find().fetch() }

  var out = {
    name: a,
    collection: m,
    keys: function () {
      var out = {}
      var first = this.collection[0]
      if (!first) return false
        return Object.keys(first)
    },
  }
  return z.fn(out)
})

Handlebars.registerHelper("first", function (a, options) {
  var that = _.first(a)
  return options.fn(that)
})

Handlebars.registerHelper('charLength', function (a) {
  return values[a].maxLength - (this[a] && this[a].length)
})


//////////////////////////////////////////////
//  $$ body

Template.body.events({
  'click .links li': function (event, tmpl) {
    var selector = event.currentTarget.getAttribute("data-page")
    as("accountPage", selector)
    Session.set("accountPage", selector)
  }
})

Template.body.created = function () {
  if (Meteor.loggingIn()) {
    Meteor.call("registerLogin")
  }
}

//////////////////////////////////////////////
//  $$ account

Template.account.rendered = function () {
  var self = this
  self.handle = Meteor.autorun( function () {
    var out = Session.get("accountPage")
    var target = $("ul.links li[data-page='"+out+"']")
    target.addClass("active")
    target.siblings().removeClass("active")
  })
  self.handle.stop()
}

Template.account.created = function () {
  Meteor.call("getLogin", function (err, res) {
    if (err) { console.log(err) }
    if (res < 2) {
      console.log("AAAW YEAH")
      as("accountPage", "offer")
      as("show", "intro")
      as("help", "true")
      Session.set("accountPage", as("accountPage"))
      Session.set("show", as("show"))
      Session.set("help", true)
    }
  })
}


Template.account.events({
  'click li.save' : function (event, tmpl) {

    var offer = as()
    Session.set("currentOffer", offer)

    /* console.log(offer) */

    var errors = []

    for (key in values) {
      if (values[key].hasOwnProperty("maxLength")){
        if ( !offer[key] ) {
          errors.push(key)
        }
      }
    }

    if (errors.length) {
      Session.set("status_alert", {
        heading: "Whoops...",
        message: "You didn't enter anything for your " + errors.join(", ") + ".",
        type: "alert-warning in",
      })
      return false
    } else {
      Session.set("status_alert", {
        heading: "Loading...",
        message: "We're just charging the lasers.",
        type: "alert-success"
      })
    }

    var type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'
      , geo = new google.maps.Geocoder()

    geo.geocode({ address: offer.street +" "+ offer.city +" "+ offer.state +" "+ offer.zip}, function (results, status) {
      if (status !== "OK") {
        Session.set('status_alert', {
          heading: "Uh-oh...",
          message: "We couldn't seem to find your location. Did you enter your address correctly?",
          type: "alert-error",
          time: moment().unix()
        })
      } else {
        offer.loc = {
          lat: results[0].geometry.location.Ya,
          long: results[0].geometry.location.Za
        }
      Meteor.call('editOffer', type, offer, function (error) {
          if (error) {
            Session.set('status_alert', {
              heading: "Uh-oh...",
              message: error.reason,
              type: "alert-error",
              time: moment().unix()
            })
          } else {
            Session.set('status_alert', {
              heading: "Nice!",
              message: "You're good to go.",
              type: "alert-success",
              time: moment().unix()
            })
            Meteor.setTimeout(function(){
              $(".alert").slideUp('fast', function () {
                Session.set('status_alert', null)
              })
            }, 2000 )
          }
        })
      }
    })
  }
})

//////////////////////////////////////////////
// $$  account_offer

Template.account_offer.helpers({
  getOffer: function () {
    return Session.get("currentOffer")
  },
  status_alert: function () {
    return Session.get('status_alert')
  },
  show: function (a) {
    if (Session.get("show") === a) {
      return true
    }
  },
})

Template.account_offer.events({
  'click .show': function (event, tmpl) {
    var area = event.currentTarget.getAttribute("data-value")
    as("show", area)
    Session.set("show", area)
    Session.set("currentOffer", as())
  },
  'click li.help': function (event, tmpl) {
    var out = Session.get("help") ? false : true
    as("help", out)
    Session.set("help", out)
  },
  'click .alert button': function (event, tmpl) {
    Session.set("status_alert", false)
  },
  'focus .limited': function (event, tmpl) {
    var elem = $(event.currentTarget)
    var max = values[elem.attr("id")].maxLength
    if (elem.val().lenth >= max) {
      elem.data("prevent", true)
      elem.data("value", elem.val())
    }
  },
  'blur .limited': function (event, tmpl) {
      var elem = $(event.currentTarget)
      if (elem.data("prevent")) {
        elem.val( elem.data("value") )
      }
  },
  'keydown .limited': function (event, tmpl) {
      var elem = $(event.currentTarget)
        , max = values[event.currentTarget.id].maxLength
        , count = elem.val().length

      if(count >= max && $.inArray(event.which, permittedKeys) < 0) {
          elem.data('prevent', true);
          elem.data('value', elem.val());
          return false;
      } else {
          elem.data('prevent', false);
      }
  },
  'keyup input.text, keyup textarea': function (event, tmpl) {
    var target = event.currentTarget
      , val = target.value.toString()

    if (target.id === "price") {
      val = parseInt(target.value)
    }

    as(target.id, val)
    Session.set("currentOffer", as())

  },
  'click #qr-button': function (event, tmpl) {
    var offerId = this.business
      , url = "http://deffenbaugh.herokuapp.com/offer/"

    var draw_qrcode = function(text, typeNumber, errorCorrectLevel) {
      document.write(create_qrcode(text, typeNumber, errorCorrectLevel) );
    };

    var create_qrcode = function(text, typeNumber, errorCorrectLevel, table) {

      var qr = qrcode(typeNumber || 4, errorCorrectLevel || 'M');
      qr.addData(text);
      qr.make();
      /* return qr.createImgTag(); */
      return qr.createTableTag();
    };

    var update_qrcode = function() {
      $("#qr-code").html(create_qrcode(url + offerId))
        .find("td")
        .css({width:'10px', height:'10px'})
    };

    update_qrcode()
  }
})

Template.account_offer.rendered = function () {

  var self = this

  self.showHandle = Meteor.autorun( function () {
    var out = as("show")
    $(".account.navbar li[data-value='" + out + "']")
      .addClass("active")
  }).stop()

  self.helpHandle = Meteor.autorun( function () {
    var out = Session.get("help")
    if (out) {
      $(".account.navbar li.help").addClass("active") }
  }).stop()

}

Template.account_offer.created = function () {

  var id = Meteor.userId()
    , offer = Offers.findOne({ owner: id })

  if (! id || id != as("owner")) {
    as("owner", Meteor.userId())
    if (offer) {
      for (key in values) {
        as(key, offer[values[key]])
      }
    } else {
      for (key in values) {
        as(key, values[key].default)
      }
    }
  }

  Session.set("currentOffer", as())

}


//////////////////////////////////////////////
//  $$ account_offer_symbol

Template.account_offer_symbol.helpers({
  getIcons: function () {
    return [
      "drink",
      "drink-2",
      "drink-3",
      "microphone",
      "coffee",
      "ice-cream",
      "cake",
      "pacman",
      "wallet",
      "gamepad",
      "bowling",
      "space-invaders",
      "batman",
      "lamp",
      "lamp-2",
      "appbarmoon"
    ]
  }
})

Template.account_offer_symbol.events({
  'click input.color': function (event, tmpl) {
    var target = $(".offer").find(".symbol, .main, .metric")
    colorPicker.exportColor = function(){
      var color = event.target.value
      as("color", color )
      target.css("background", color)
    }
    colorPicker(event)
  },
  'click .glyph div': function (event, tmpl) {
    var attr = event.target.getAttribute("class")
    as("symbol", attr)
    Session.set("currentOffer", as())
  }
})

//////////////////////////////////////////////
//  $$ account_offer_tags

Template.account_offer_tags.helpers({
  getTags: function (data) {
    var self = this
    var out = Tags.find({tagset: self.name }).fetch()
    return out
  },
  checkTagsetActive: function (data) {
    var tagset = {}
    tagset.name = this.name
    tagset.attr = as("tagset") === this.name ? "active" : "inactive"
    return tagset
  },
  checkTagActive: function (data) {
    var tag = {}
    tag.name = this.name
    tag.attr = _.contains(as()["tags"], this.name) ? "data-active" : ""
    return tag
  }
})

Template.account_offer_tags.events({
  'click .tagset': function (event, tmpl) {
    var tar = $(event.currentTarget)
    if (tar.attr("data-status") === "active")
      return false
    tar.attr("data-status", "active")
    tar.siblings()
      .attr("data-status", "inactive")
      .find("span")
      .removeAttr("data-active")
    as("tagset", tar.attr("data-tagset"))
    as("tags", [])
    Session.set("currentOffer", as())
  },
  'click .tag-list span': function (event, tmpl) {
    var tar = event.target
    if (! tar.hasAttribute("data-active")) {
      event.target.setAttribute("data-active")
      var tags = as("tags") || []
      tags.push(this.name)
      as("tags", tags)
      Session.set("currentOffer", as())
    } else {
      event.target.removeAttribute("data-active")
      var tags = _.without(as("tags"), this.name)
      as("tags", tags)
      Session.set("currentOffer", as())
    }
  }
})

//////////////////////////////////////////////
//  $$ account_offer_text


//////////////////////////////////////////////
//  $$ account_metrics

Template.account_metrics.offers = function () {
  return Offers.find().count()
}

Template.account_metrics.votes = function () {
  var votes = _.pluck(Offers.find().fetch(), "votes")
  return votes
}

