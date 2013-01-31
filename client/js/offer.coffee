
# globals

handleActions = (event, tmpl, cb) ->
  eventEl = event.target
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

# offer

Template.offer.helpers
  getDistance: (loc) ->
    myLoc = amplify.get("user.loc")
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

Template.offer.events
  'click .vote': (event, tmpl) ->
    tmpl.find(".votes span.actual").textContent = @.votes + 1
    Meteor.call "upvoteEvent", tmpl.data

  "click section.actions li.map": (event, tmpl) ->
    targetEl = tmpl.find("section.extension[data-extension='map'] .inner.map")
    handleActions event, tmpl, ->
      map = {}
      directionsDisplay = {}
      directionsService = new google.maps.DirectionsService()
      origin = amplify.get("user.loc")
      gorigin = new google.maps.LatLng(origin.lat, origin.long)
      dest = tmpl.data.loc
      gdest = new google.maps.LatLng(dest.lat, dest.long)
      directionsService.route
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


Template.offer.rendered = ->
  return false  if Meteor.Router.page() is "account_offer"
  range = statRange()
  keys = [
    name: "updatedAt"
    invert: false
  ,
    name: "distance"
    invert: true
  ,
    name: "votes"
    invert: false
  ,
    name: "price"
    invert: true
  ]
  self = this
  renderRatio = (callback) ->
    ratio = {}
    _.each keys, (k) ->
      d = k.name
      upperRange = self.data[d] - range.min[d][d] + 0.01
      lowerRange = range.max[d][d] - range.min[d][d]
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



Template.thisOffer.events "click button": (event, tmpl) ->
  userId = tmpl.find("input.text").value
  Meteor.call "upvoteEvent", "username", userId, this
