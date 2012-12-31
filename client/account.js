Template.myOffer.events({
  'click .save' : function (event, tmpl) {
    var offer = newOffer.toJSON()
      , name = offer.name
      , price = offer.price
      , description = offer.description
      , symbol = offer.symbol
      , type = Offers.findOne({owner: Meteor.userId()}) ? 'update' : 'insert'

    Meteor.call('editOffer', type, offer, function (error) {
      if (error)
        Session.set('showStatus', error.reason)
      else
        Session.set('showStatus', "Success!")
    })
  },
  'click .field': function (event, tmpl) {
    var target = $(event.target)
      , attr = target.attr('data-field-value')
      , val = this[attr]
      , cg = $(tmpl.find(".control-group"))

    cg.find("label").text(attr)
    cg.find("input.text")
      .attr('id', attr)
      .val(val)
      .focus()
  },
  'keyup input.text': function (event, tmpl) {
    var target = $(event.currentTarget)
      , attr = target.attr('id')
      , val = target.val()

    newOffer.set(attr, val)
    $(".field[data-field-value='"+attr+"']").text(val)
  },
  'click .glyph div': function (event, tmpl) {
    var attr = event.target.getAttribute("data-icon")
    tmpl.find(".symbol").setAttribute("data-icon", attr)
    newOffer.set("symbol", attr)
  }
})

function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}

Template.myOffer.helpers({
  getOffer: function () {
    var thisOffer = Offers.findOne({owner: userId})
    if(thisOffer){
      newOffer.set({
        name: thisOffer.name,
        price: thisOffer.price,
        description: thisOffer.description,
        symbol: thisOffer.symbol
      })
      return newOffer.toJSON()
    } else {
      return newOffer.toJSON()
    }
  },
  message: function () {
    return Session.get('showStatus')
  },
  showStatus: function () {
    return Session.get('showStatus')
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
  }
})


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

