as = amplify.store

Template.account_offer.events({
  'click .save' : function (event, tmpl) {
    var type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'
      , geo = new google.maps.Geocoder()
   
    
    geo.geocode({ address: as().street +" "+ as().city_state +" "+ as().zip}, function (results, status) {
      console.log(results, status)
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
        /* Meteor.setTimeout(hideAlert, 5000) */

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

    $(".field[data-field='"+attr+"']").text(val)
    as(attr, val)
  },
  'keyup input.color': function (event, tmpl) {
    var color = event.target.value
    $("section.symbol .large").css("background", color)
    as("color", color)
  },
  'click .glyph div': function (event, tmpl) {
    var attr = event.target.getAttribute("class")
    tmpl.find(".symbol div").setAttribute("class", attr)
    as("symbol", attr)
  },
  'click .tag-list span': function (event, tmpl) {
    var tar = event.target
    if (! tar.hasAttribute("data-active")) {
      event.target.setAttribute("data-active")
      $(tmpl.find("section.tags li:last")).after("<li>"+ this.name+"</li>" )
      var tags = as("tags") || []
      tags.push(this.name)
      as("tags", tags)
    } else {
      event.target.removeAttribute("data-active")
      $(tmpl.find("section.tags li:contains('"+this.name+"')")).remove()
      var tags = _.without(as("tags"), this.name)
      as("tags", tags)
    }
  },
  'click #qr-button': function (event, tmpl) {
    var offerId = this.business

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
      $("#qr-code").html(create_qrcode(offerId))
        .find("td")
        .css({width:'10px', height:'10px'})
    };

    update_qrcode()
  }
})

Template.account_offer.helpers({
  getOffer: function () {
    return as()
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
    // var count = []
    // for(var o = 0; o < 6; o++){
    //   for(var i = 0; i < 15; i++){
    //     var j
    //     if (i < 10){j = i}
    //     else if (i === 10){j = "a"}
    //     else if (i === 11){j = "b"}
    //     else if (i === 12){j = "c"}
    //     else if (i === 13){j = "d"}
    //     else if (i === 14){j = "e"}

    //     count.push(o.toString() + j.toString())
    //   }
    // }
    // return count
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
      "lamp-2"
    ]
  },
  checkTagActive: function (data) {
    var tag = {}
    tag.name = this.name
    tag.attr = _.contains(as()["tags"], this.name) ? "data-active" : ""
    return tag
  }
})

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
      as("updatedAt", offer.updatedAt)
      as("votes", offer.votes.length)
      as("zip", offer.zip)
    } else {
      _.each( _.keys(as()), function (key) {
        as( key, null )
        console.log("Cleared key: ", key)
      })
    }
  }
}


Template.account_profile.user = function () {
  return Meteor.user()
}

Template.account_metrics.offers = function () {
  return Offers.find().count()
}

Template.account_metrics.votes = function () {
  var votes = _.pluck(Offers.find().fetch(), "votes")
  , total = 0
  for (var i = 0; i < votes.length; i++) {
    total += votes[i]
  }
  return total
}

