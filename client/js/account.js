as = amplify.store

Template.myOffer.events({
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
          Session.set('showStatus', error.reason)
        else
          Session.set('showStatus', "Success!")
      })
      }
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
  'click .glyph div': function (event, tmpl) {
    var attr = event.target.getAttribute("data-icon")
    tmpl.find(".symbol div").setAttribute("data-icon", attr)
    as("symbol", attr)
  },
  'click .tag-list span': function (event, tmpl) {
    if (! event.target.hasAttribute("data-active")) {
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
  'click .add-address': function (event, tmpl) {
    console.log(event, tmpl)
  }
})

Template.myOffer.helpers({
  getOffer: function () {
    return as()
  },
  message: function () {
    return Session.get('showStatus')
  },
  showStatus: function () {
    return Session.get('showStatus')
  },
  show: function (options) {
    if (Session.get("show") === options) {
      return true
    }
  },
  getIcons: function () {
    var count = []
    for(var o = 0; o < 6; o++){
      for(var i = 0; i < 15; i++){
        var j
        if (i < 10){j = i}
        else if (i === 10){j = "a"}
        else if (i === 11){j = "b"}
        else if (i === 12){j = "c"}
        else if (i === 13){j = "d"}
        else if (i === 14){j = "e"}

        count.push(o.toString() + j.toString())
      }
    }
    return count
  },
  checkTagActive: function (data) {
    var tag = {}
    tag.name = this.name
    tag.attr = _.contains(as()["tags"], this.name) ? "data-active" : ""
    return tag
  }
})

Template.myOffer.created = function () {
  var id = Meteor.userId()
    , offer = Offers.findOne({ owner: id })

  if (! id || id != as("owner")) {
    as("owner", Meteor.userId())
    if (offer) {
      as("business", offer.business)
      as("city_state", offer.city_state)
      as("description", offer.description)
      as("loc", offer.loc)
      as("name", offer.name)
      as("price", offer.price)
      as("street", offer.street)
      as("symbol", offer.symbol)
      as("tags", offer.tags)
      as("updatedAt", offer.updatedAt)
      as("votes", offer.votes)
      as("zip", offer.zip)
    } else {
      _.each( _.keys(as()), function (key) {
        as( key, null )
        console.log("Cleared key: ", key)
      })
    }
  }
  Meteor.flush()
}


Template.profile.user = function () {
  return Meteor.user()
}

Template.metrics.offers = function () {
  return Offers.find().count()
}

Template.metrics.votes = function () {
  var votes = _.pluck(Offers.find().fetch(), "votes")
  , total = 0
  for (var i = 0; i < votes.length; i++) {
    total += votes[i]
  }
  return total
}

