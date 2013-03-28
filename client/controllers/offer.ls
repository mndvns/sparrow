
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
  # 'click li, click button, click a': (e, t)->
  #   Session.set 'selected_offer', @

  'click .help-mode .offer': ->
    return false

  'click .vote': (event, tmpl) ->
    Point.cast @

    # if event.currentTarget.hasAttribute "disabled" then return

    # watch-offer?.click!
    # Meteor.call "upvoteEvent", tmpl.data


  'click .image': (event, tmpl) ->
    console.log(this)

  'click .main': (event, tmpl) ->
    console.log( Meteor.users.findOne _id: @owner )


  "click section.actions li.map": (event, tmpl) ->
    target-el = tmpl.find("section.extension[data-extension='map'] .inner.map")
    handle-actions event, tmpl, ->
      map = {}
      directions-display = {}
      directions-service = new google.maps.DirectionsService()

      origin  = Store.get("user_loc")
      gorigin = new google.maps.LatLng(origin.lat, origin.long)
      dest    = tmpl.data.locations?.0?.geo
      gdest   = new google.maps.LatLng dest.0, dest.1

      directionsService.route {}=
        origin      : gorigin
        destination : gdest
        travelMode  : google.maps.DirectionsTravelMode.DRIVING
      , (response, status) ->
        directionsDisplay = new google.maps.DirectionsRenderer()
        mapOptions =
          mapTypeId         : google.maps.MapTypeId.ROADMAP
          panControl        : false
          zoomControl       : false
          scaleControl      : false
          streetViewControl : false
          mapTypeControl    : false

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


      # if @data._id in map (.target-id), My.prompts!
      #   $ @find '.prompt-area' .slide-down!


Template.offer_market.events {}=

  'click .payment-form button': (e, t) ->
    e.prevent-default!
    form = $ t.find "form"

    offer        = @find-offer!
    access-token = @access_token

    card =
      number    : $ ".card-number" .val!
      cvc       : $ ".card-cvc" .val!
      exp_month : $ ".card-expiry-month" .val!
      exp_year  : $ ".card-expiry-year" .val!

    if $ e.current-target .has-class "new"
      console.log "NEW CUSTOMER"

      Meteor.call "stripe_customers_create", card, ->
        [err, cust] = [&1.0, &1.1]
        if err
          console.log \ERROR, err
          return
        console.log \STRIPE_CUSTOMERS_CREATE, cust

        Meteor.call "stripe_customers_save", cust, ->
          [err, res] = [&1.0, &1.1]
          if err
            console.log \ERROR, err
            return
          console.log \STRIPE_CUSTOMERS_SAVE, res

          Meteor.call "stripe_token_create", cust.id, access-token, ->
            [err, token] = [&1.0, &1.1]
            if err
              console.log \ERROR, err
              return
            console.log \STRIPE_TOKEN_CREATE, token

            Meteor.call "stripe_charges_create", offer, cust.id, access-token, ->
              [err, charge] = [&1.0, &1.1]
              if err
                console.log \ERROR, err
                return
              console.log \STRIPE_CHARGES_CREATE, charge

    else
      cust-id = My.customer-id!

      console.log "EXISTING CUSTOMER"

      Meteor.call "stripe_token_create", cust-id, access-token, ->
        [err, token] = [&1.0, &1.1]
        if err
          console.log \ERROR, err
          return
        console.log \STRIPE_TOKEN_CREATE, token

        Meteor.call "stripe_charges_create", offer, cust-id, access-token, ->
          [err, charge] = [&1.0, &1.1]
          if err
            console.log \ERROR, err
            return
          console.log \STRIPE_CHARGES_CREATE, charge


Template.offer_market.rendered = ->
  $ @find 'form' .parsley {}=

    # basic data-api overridable properties here..
    inputs               : "input, textarea, select"
    excluded             : "input[type=hidden]"
    trigger              : false
    focus                : "first"
    validation-minlength : 3
    success-class        : "parsley-success"
    error-class          : "parsley-error"
    validators           : {}
    messages             : {}

    #some quite advanced configuration here..
    validate-if-unchanged: false
    errors: # specify where parsley error-success classes are set
      class-handler: (elem, is-radio-or-checkbox) ->

      container: (elem, is-radio-or-checkbox) ->

      errors-wrapper: "<ul></ul>"
      error-elem: "<li></li>"

    listeners:
      on-field-validate: (elem, Parsley-field) ->
        false

      on-form-submit: (is-form-valid, event, Parsley-form) ->

      on-field-error: (elem, constraints, Parsley-field) ->

      on-field-success: (elem, constraints, Parsley-field) ->







# adjustOfferElements = (main) ->
# 
#   kids   = main.children
# 
#   bottom = kids[kids.length - 1].offsetTop
# 
#   padding_top = (170 - bottom) * 0.3
# 
#   return padding_top
# 
# set-padding = (section_main) ~>
#   padding_top = adjust-offer-elements(section_main)
#   $(section_main).css("padding-top", padding_top)

Template.offer.rendered = ->
  Session.when-true <[ derp herp ]>, -> console.log "DERP AND HERP"

  # set-padding(@find("section.main"))

  # if Session.get("shift_area") is "account" or Meteor.Router.page! is "account_offer"
  #   return

  # range = stat-range!
  # keys = [
  #   name: "updatedAt"
  #   invert: false
  # ,
  #   name: "distance"
  #   invert: true
  # ,
  #   name: "votes_count"
  #   invert: false
  # ,
  #   name: "price"
  #   invert: true
  # ]
  # self = @

  # render-ratio = (callback) ->
  #   ratio = {}
  #   _.each keys, (k) ->
  #     d = k.name
  #     upper-range = self.data[d] - range.min[d] + 0.01
  #     lower-range = range.max[d] - range.min[d]
  #     out = Math.ceil((100 * (upperRange) / (lowerRange)) * 5) / 10
  #     ratio[d] = (if k.invert is false then out else Math.abs(out - 50))

  #   callback ratio

  # render-ratio (ratio) ->
  #   for key of ratio
  #     if ratio.has-own-property(key) and ratio[key]
  #       data = d3.select(self.find("section.data ." + key))
  #       metric = data.select(".metric")
  #       metric.style height: ->
  #         ratio[key] + "%"

  # user-id = Meteor.user-id!

  # voted = _.find self.data.votes_meta, (d) ->
  #   d.user is userId

  # if voted
  #   self.find( "li.vote" ).set-attribute "disabled"

  if watch-offer?
    watch-offer.stop!

