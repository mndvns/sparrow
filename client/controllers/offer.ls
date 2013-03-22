
# globals

handleActions = (event, tmpl, cb) ->
  eventEl = event.currentTarget
  extension = eventEl.getAttribute("data-selector")
  targetEl = $(tmpl.find("section.extension[data-extension='" + extension + "']"))
  if eventEl.getAttribute("data-status") is "inactive"
    eventEl.setAttribute "data-status", "active"
    targetEl.slideDown "fast", ->
      unless eventEl.getAttribute("data-initialized")
        eventEl.setAttribute "data-initialized", true
        cb()

  else
    eventEl.setAttribute "data-status", "inactive"
    targetEl.slideUp "fast"
    false

Template.offer.helpers {}=
  getDistance: (loc) ->
    myLoc = Store.get("user_loc")
    if myLoc and loc
      dist = distance(myLoc.lat, myLoc.long, loc.lat, loc.long, "M")
      Math.round(dist * 10) / 10
    else
      false

  checkVote: (selection) ->
    user = Meteor.user()
    users = Meteor.users
    return false  unless user
    true  if _.contains(user.votes, selection)

Template.offer.events {}=
  'click .help-mode .offer': ->
    return false

  'click .vote': (event, tmpl) ->
    # if event.currentTarget.hasAttribute "disabled" then return

    watchOffer.click()
    Meteor.call "upvoteEvent", tmpl.data

  'click .image': (event, tmpl) ->
    console.log(this)

  'click .main': (event, tmpl) ->
    console.log( Meteor.users.findOne _id: @owner )


  "click section.actions li.map": (event, tmpl) ->
    targetEl = tmpl.find("section.extension[data-extension='map'] .inner.map")
    handleActions event, tmpl, ->
      map = {}
      directionsDisplay = {}
      directionsService = new google.maps.DirectionsService()
      origin = Store.get("user_loc")
      gorigin = new google.maps.LatLng(origin.lat, origin.long)
      dest = tmpl.data.loc
      gdest = new google.maps.LatLng(dest.lat, dest.long)
      directionsService.route {}=
        origin: gorigin
        destination: gdest
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      , (response, status) ->
        directionsDisplay = new google.maps.DirectionsRenderer()
        mapOptions =
          mapTypeId: google.maps.MapTypeId.ROADMAP
          panControl: false
          zoomControl: false
          scaleControl: false
          streetViewControl: false
          mapTypeControl: false

        console.log response, status
        map = new google.maps.Map(targetEl, mapOptions)
        directionsDisplay.setMap map
        directionsDisplay.setDirections response

        tmpl.find(".time span.value").textContent = response.routes[0].legs[0].duration.text


  "click section.actions li.message": (event, tmpl) ->
    handleActions event, tmpl, ->
      console.log "clicked messages"


  "click section.actions li.reserve": (event, tmpl) ->
    handleActions event, tmpl, ->
      console.log "clicked buy"

  'click .payment-form button': (event, tmpl) ->
    event.preventDefault()
    form = $(tmpl.find("form"))
    form.find("button").prop 'disabled', true

    Stripe.createToken {}=
      number    : $(".card-number").val()
      cvc       : $(".card-cvc").val()
      exp_month : $(".card-expiry-month").val()
      exp_year  : $(".card-expiry-year").val()
    , "sk_test_AAKXLw2R4kozgEqCoMFu9ufH", (status, response) ->
        if response.error
          form.find("button").prop "disabled", false
          Meteor.Alert.set text: response.error.message
        else
          console.log(response.id)
          token = response.id
          form.append $("<input type=\"hidden\" name=\"stripeToken\" />").val(token)

          customer_id = Meteor.user().stripe_customer_id
          createCharge = ->
            Meteor.call "stripeChargeCreate",
              amount: 1000
              application_fee: 250
              user: Meteor.user(), (err, res) ->
                if err then throw err
                console.log(err, res, "stripeChargeCreate")

          if not customer_id
            console.log("NEW CUSTOMER")
            Meteor.call "stripeCustomerCreate", token, (err, res)->
              if err then throw err
              console.log(err, res, "stripeCustomerCreate")
              customerId = _.compact(res)?.toString()
              Meteor.call "stripeSaveCustomerId", customerId, (err, res)->
                if err then throw err
                console.log(err, res, "stripeSaveCustomerId")
                createCharge()
          else
            console.log("CUSTOMER EXISTS")
            createCharge()






  "click .send": (event, tmpl) ->
    target = $(event.target)
    return false  if target.hasClass("busy")
    target.addClass "busy"
    textarea = $(tmpl.find("textarea"))
    container = textarea.siblings()
    Meteor.call "message", textarea.val(), "offer", tmpl.data.owner, (err, res) ->
      if err
        console.log "Error. You done goofed.", err
      else
        console.log "Successfully sent message", res
        container.text "Message successfully sent!"
        textarea.fadeOut 600
        container.fadeIn 600
        Meteor.setTimeout (->
          textarea.val("").fadeIn 600
          container.fadeOut 600
          target.removeClass "busy"
        ), 3000

adjustOfferElements = (main) ->

  kids   = main.children

  bottom = kids[kids.length - 1].offsetTop

  padding_top = (170 - bottom) * 0.3

  return padding_top

setPadding = (section_main) ~>
  padding_top = adjustOfferElements(section_main)
  $(section_main).css("padding-top", padding_top)

Template.offer.rendered = ->

  setPadding(@find("section.main"))

  if Session.get("shift_area") is "account" or Meteor.Router.page() is "account_offer"
    return

  range = statRange()
  keys = [
    name: "updatedAt"
    invert: false
  ,
    name: "distance"
    invert: true
  ,
    name: "votes_count"
    invert: false
  ,
    name: "price"
    invert: true
  ]
  self = @

  renderRatio = (callback) ->
    ratio = {}
    _.each keys, (k) ->
      d = k.name
      upperRange = self.data[d] - range.min[d] + 0.01
      lowerRange = range.max[d] - range.min[d]
      out = Math.ceil((100 * (upperRange) / (lowerRange)) * 5) / 10
      ratio[d] = (if k.invert is false then out else Math.abs(out - 50))

    callback ratio

  renderRatio (ratio) ->
    for key of ratio
      if ratio.hasOwnProperty(key) and ratio[key]
        data = d3.select(self.find("section.data ." + key))
        metric = data.select(".metric")
        metric.style height: ->
          ratio[key] + "%"

  userId = Meteor.userId()

  voted = _.find self.data.votes_meta, (d) ->
    d.user is userId

  if voted
    self.find( "li.vote" ).setAttribute "disabled"

  if watchOffer?
    watchOffer.stop()

Template.offer.created = ->
  # @data.distance = 1234


# Template.offer.created = ->
#   # console.log("OFFFFER", @)
#   # themeColors = _.find document.styleSheets, (d) ->
#   #   d.title is "dynamic-offers"
# 
#   # for rule in themeColors.rules
#   #   themeColors.removeRule()
# 
# 
#   # themeColors.insertRule( colorFill ".clr-text.prime", "color", color.prime.medium)
#   # themeColors.insertRule( colorFill "a", "color", color.prime.medium)
#   # themeColors.insertRule( colorFill "a:hover, a.active", "color", color.prime.medium )
# 
#   # themeColors.insertRule( colorFill ".clr-text.desat", "color", color.prime.light )
#   # themeColors.insertRule( colorFill ".clr-text.desat:hover", "color", color.prime.medium )
#   # themeColors.insertRule( colorFill ".clr-text.desat:active", "color", color.prime.dark )
# 
#   # themeColors.insertRule( colorFill ".clr-bg", "background", color.prime.medium)
#   # themeColors.insertRule( colorFill ".clr-bg.btn:hover", "background", color.prime.medium)
# 
#   # themeColors.insertRule( colorFill ".clr-bg.light", "background", color.prime.light )
#   # themeColors.insertRule( colorFill ".clr-bg.dark", "background", color.prime.dark )


Template.thisOffer.events "click button": (event, tmpl) ->
  userId = tmpl.find("input.text").value
  Meteor.call "upvoteEvent", "username", userId, this
