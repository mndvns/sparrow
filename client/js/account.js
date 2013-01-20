
Handlebars.registerHelper("key_value", function (a, fn) {
  var out = "", key
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      out += fn({ key: key, value:a[key]})
    }
  }
  return out
})

Handlebars.registerHelper("derp", function (a) {
  console.log(this, a)
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
  console.log(this, that)
  return options.fn(that)
})




as = amplify.store

Template.account_offer.events({
  'click .save' : function (event, tmpl) {
    var type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'
      , geo = new google.maps.Geocoder()
    
    geo.geocode({ address: as().street +" "+ as().city_state +" "+ as().zip}, function (results, status) {
      if (status === "OK") {
        as("loc", {
          lat: results[0].geometry.location.Ya,
          long: results[0].geometry.location.Za
        })
      Meteor.call('editOffer', type, as(), function (error) {
        if (error)
          Session.set('status_alert', {
            heading: "Uh-oh...",
            message: error.reason,
            type: "alert-error",
            time: moment().unix()
          })
        else
          Session.set('status_alert', {
            heading: "Nice!",
            message: "You're good to go.",
            type: "alert-success",
            time: moment().unix()
          })
        })
      }
    })

  },
  'click .alert button': function (event, tmpl) {
    $(".alert").fadeOut('fast', function () {
      Session.set("status_alert", false)
    })
  },
  'click section': function (event, tmpl) {
    var area = event.currentTarget.getAttribute("class")
    Session.set("show", area)
  },
  'keyup input.text': function (event, tmpl) {
    var target = $(event.currentTarget)
    , attr = target.attr('id')
    , val = target.val()

    if (event.currentTarget.id === "price") {
      console.log("RIGHT HERE")
      val = parseInt(target.val())
    }

    as(attr, val)
    Session.set("currentOffer", as())
  },
  'keyup input.color': function (event, tmpl) {
    if (event.keyCode == 13) {
      var color = event.target.value
      as("color", color)
      Session.set("currentOffer", as())
    }
  },
  'click .glyph div': function (event, tmpl) {
    var attr = event.target.getAttribute("class")
    as("symbol", attr)
    Session.set("currentOffer", as())
  },
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

Template.account_offer.helpers({
  getOffer: function () {
    return Session.get("currentOffer")
  },
  status_alert: function () {
    return Session.get('status_alert')
  },
  show: function (options) {
    if (Session.get("show") === options) {
      return true
    }
  },
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

Template.account_offer.rendered = function () {
  Session.set("currentOffer", as())
}

Template.account_offer.created = function () {
  var id = Meteor.userId()
    , offer = Offers.findOne({ owner: id })

  if (! id || id != as("owner")) {
    as("owner", Meteor.userId())
    if (offer) {
      as("business", offer.business)
      as("city_state", offer.city_state)
      as("color", offer.color)
      as("description", offer.description)
      as("loc", offer.loc)
      as("name", offer.name)
      as("price", offer.price)
      as("street", offer.street)
      as("symbol", offer.symbol)
      as("tags", offer.tags)
      as("tagset", offer.tagset)
      as("updatedAt", offer.updatedAt)
      as("votes", offer.votes)
      as("zip", offer.zip)
    } else {
      _.each( _.keys(as()), function (key) {
        as( key, null )
      })
    }
  }
}


Template.account_metrics.offers = function () {
  return Offers.find().count()
}

Template.account_metrics.votes = function () {
  var votes = _.pluck(Offers.find().fetch(), "votes")
  return votes
  // , total = 0
  // for (var i = 0; i < votes.length; i++) {
  //   total += votes[i]
  // }
  // return total
}

