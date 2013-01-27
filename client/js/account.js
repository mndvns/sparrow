
//////////////////////////////////////////////
//  $$ globals locals

as = amplify.store

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

var icon = {
  warning: "<i class='glyph-notice'></i>  ",
  neutral: "<i class='glyph-info'></i>  ",
  success: "<i class='glyph-checkmark'></i>  "
}

var permittedKeys = [8, 37, 38, 39, 40, 46, 9, 91, 93]

var icons = [
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

//////////////////////////////////////////////
//  $$ helpers


Handlebars.registerHelper('charLength', function (a) {
  return Offer[a].maxLength - (this[a] && this[a].length)
})

Handlebars.registerHelper('getEmail', function (a) {
  var user = Meteor.user()
  return user.emails && user.emails[0]
})

//////////////////////////////////////////////
//  $$ body

Template.body.events({
  'click .links li': function (event, tmpl) {
    // var selector = event.currentTarget.getAttribute("data-page")
    // as("accountPage", selector)
    // Session.set("accountPage", selector)
  }
})

Template.body.rendered = function () {

  var self = this

  if (Meteor.Router.page() === "home") {
    return
  }

  self.activateLinks = Meteor.autorun( function () {
    var out = Meteor.Router.page()
    var parse = "/" + out.split("_").join("/")
    var target = $("ul.links a[href='"+parse+"']")
    target.addClass("active")
    target.siblings().removeClass("active")
  })
  self.activateLinks.stop()

}

//////////////////////////////////////////////
//  $$ account

Template.account.created = function () {
  d3.select("html")
    .transition()
    .style("background", function () {
      return "#eee"
    })
}


//////////////////////////////////////////////
//  $$ account_profile

Template.account_profile.events({
  'click .save': function (event, tmpl) {

    var validateEmail = function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(email);
    }

    var newEmail = tmpl.find("#email").value
    var newUsername = tmpl.find("#username").value

    if (! validateEmail(newEmail)) {
      dhtmlx.message({
        "type": "warning",
        "text": icon.warning + "Invalid email"
      })
      return
    }

    Meteor.call("updateUser", newEmail, newUsername, function (err) {
      if (err) {
        dhtmlx.message({
          "type": "warning",
          "text": icon.warning + err.reason
        })
      } else {
        dhtmlx.message({
          "type": "success",
          "text": icon.success + "Saved successfully"
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
  show: function (a) {
    if (Session.get("show") === a) {
      return true
    }
  },
})

Template.account_offer.events({
  'click .save' : function (event, tmpl) {

    var offer = as()
    Session.set("currentOffer", offer)

    var errors = []

    for (key in Offer) {
      if ( Offer[key].hasOwnProperty("maxLength")){
        if ( !offer[key] ) {
          errors.push(key)
        }
      }
    }

    if (errors.length) {
      dhtmlx.message({
        "type": "warning",
         "text" : icon.warning + "You didn't enter anything for your " + errors.join(", ") + "."
      })
      return false
    }

    // else {
    //   dhtmlx.message({
    //     "type": "neutral",
    //     "text": icon.neutral + "Loading...",
    //   })
    // }

    var type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'
      , geo = new google.maps.Geocoder()

    geo.geocode({ address: offer.street +" "+ offer.city +" "+ offer.state +" "+ offer.zip}, function (results, status) {
      if (status !== "OK") {
        dhtmlx.message({
          "type": "warning",
          "text": icon.warning + "We couldn't seem to find your location. Did you enter your address correctly?"
        })
      } else {
        offer.loc = {
          lat: results[0].geometry.location.Ya,
          long: results[0].geometry.location.Za
        }
      Meteor.call('editOffer', type, offer, function (error) {
          if (error) {
            dhtmlx.message({
              "type": "warning",
              "text": icon.warning + error.reason
            })
          } else {
            dhtmlx.message({
              "type": "success",
              "text": icon.success + "You're good to go!"
            })
          }
        })
      }
    })

  },
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
  'focus .limited': function (event, tmpl) {
    var elem = $(event.currentTarget)
    var max = Offer[elem.attr("id")].maxLength
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
        , max = Offer[event.currentTarget.id].maxLength
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

  Meteor.call("getLogin", function (err, res) {
    if (err) { console.log(err) }
    if (res < 1) {
      as("show", "intro")
      as("help", "true")
      Session.set("show", as("show"))
      Session.set("help", true)
    } else {
      Session.set("show", "text")
      Session.set("help", false)
    }
  })

  var id = Meteor.userId()
    , offer = Offers.findOne({ owner: Meteor.userId() })

  if (!id || id !== as("owner")) {
    if (offer) {
      for (key in Offer) {
        as(key, offer[key])
      }
      as("updatedAt", moment().unix() )
      as("owner", Meteor.userId())
      Session.set("currentOffer", as())
    } else {
      for (key in Offer) {
        as(key, Offer[key].default)
      }
      as("updatedAt", moment().unix() )
      as("owner", Meteor.userId())
      Session.set("currentOffer", as())
    }
  } else {
    Session.set("currentOffer", as())
  }

}


//////////////////////////////////////////////
//  $$ account_offer_symbol

Template.account_offer_symbol.helpers({
  getIcons: function () {
    return icons
  }
})

Template.account_offer_symbol.events({
  'click input.color': function (event, tmpl) {
    var target = $(".offer").find(".symbol, .main, .metric, .actions li")
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


Template.about.created = function () {
  d3.select("html")
    .transition()
    .style("background", function () {
      return "#eee"
    })
}

//////////////////////////////////////////////
//  $$ account_feedback

Template.account_feedback.events({
  'click #feedback button': function (event, tmpl) {
    event.preventDefault()
    var message = tmpl.find("textarea").value
    Meteor.call("message", message, "toAdmins")
  }
})

//////////////////////////////////////////////
//  $$ account_messages


Template.account_message.events({
  'click .send': function (event, tmpl) {
    var textarea = $(tmpl.find("textarea"))
    console.log(tmpl.data)
    Meteor.call("message", textarea.val(), "reply", tmpl.data._id )
  }
})
