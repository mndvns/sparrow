

#////////////////////////////////////////////
#  $$ globals locals

as = amplify.store
draw_qrcode = (text, typeNumber, errorCorrectLevel) ->
  document.write create_qrcode(text, typeNumber, errorCorrectLevel)

create_qrcode = (text, typeNumber, errorCorrectLevel, table) ->
  qr = qrcode(typeNumber or 4, errorCorrectLevel or "M")
  qr.addData text
  qr.make()
  
  # return qr.createImgTag(); 
  qr.createTableTag()

update_qrcode = ->
  $("#qr-code").html(create_qrcode(url + offerId)).find("td").css
    width: "10px"
    height: "10px"

permittedKeys = [8, 37, 38, 39, 40, 46, 9, 91, 93]
icons = ["drink", "drink-2", "drink-3", "microphone", "coffee", "ice-cream", "cake", "pacman", "wallet", "gamepad", "bowling", "space-invaders", "batman", "lamp", "lamp-2", "appbarmoon"]

#////////////////////////////////////////////
#  $$ helpers
Handlebars.registerHelper "charLength", (a) ->
  Offer[a].maxLength - (this[a] and this[a].length)

Handlebars.registerHelper "getEmail", (a) ->
  user = Meteor.user()
  user.emails and user.emails[0]

Handlebars.registerHelper "hsl", (l, a) ->
  hue = @.colors and @.colors.hsl.h * 360
  sat = @.colors and @.colors.hsl.s * 100
  light = l or 50
  alpha = a / 100 or 1

  "hsla(" + hue + "," + sat + "%," + light + "%," + alpha + ")"

Template.content.rendered = =>
  return  if Meteor.Router.page() is "home"
  @activateLinks = Meteor.autorun(->
    out = Meteor.Router.page()
    parse = "/" + out.split("_").join("/")
    target = $("ul.links a[href='" + parse + "']")
    target.addClass "active"
    target.siblings().removeClass "active"
  )
  @activateLinks.stop()

#////////////////////////////////////////////
#  $$ account_profile
Template.account_profile.events "click .save": (event, tmpl) ->

  newEmail = tmpl.find("#email").value
  newUsername = tmpl.find("#username").value

  unless validateEmail(newEmail)
    new TerraceAlert
      text: "Invalid email"
    return

  Meteor.call "updateUser", newEmail, newUsername, (err) ->
    if err
      new TerraceAlert
        text: err.reason

    else
      new TerraceAlert
        text: "Saved successfully"


#////////////////////////////////////////////
# $$  account_offer
Template.account_offer.helpers
  getOffer: ->
    Session.get "currentOffer"

  show: (a) ->
    true  if Session.get("show") is a

Template.account_offer.events
  "click .save": (event, tmpl) ->
    offer = as()
    Session.set "currentOffer", offer
    errors = []

    for key of Offer
      errors.push key if Offer[key].hasOwnProperty("maxLength") unless offer[key]

    if errors.length
      new TerraceAlert
        text: "You didn't enter anything for your #{errors.join(", ")}."
      return

    type = (if Offers.findOne(owner: Meteor.userId()) then "update" else "insert")
    geo = new google.maps.Geocoder()
    geo.geocode
      address: offer.street + " " + offer.city + " " + offer.state + " " + offer.zip
    , (results, status) ->
      if status isnt "OK"
        new TerraceAlert
          text: "We couldn't seem to find your location. Did you enter your address correctly?"

      else
        offer.loc =
          lat: results[0].geometry.location.Ya
          long: results[0].geometry.location.Za

        Meteor.call "editOffer", type, offer, (error) ->
          if error
            new TerraceAlert
              text: error.reason

          else
            new TerraceAlert
              text: "You're good to go!"

          return


  "click .offer": (event, tmpl) ->
    return false

  "click .show": (event, tmpl) ->
    area = event.currentTarget.getAttribute("data-value")
    as "show", area
    Session.set "show", area
    Session.set "currentOffer", as()

  "click li.help": (event, tmpl) ->
    out = (if Session.get("help") then false else true)
    as "help", out
    Session.set "help", out

  "focus .limited": (event, tmpl) ->
    elem = $(event.currentTarget)
    max = Offer[elem.attr("id")].maxLength
    if elem.val().lenth >= max
      elem.data "prevent", true
      elem.data "value", elem.val()

  "blur .limited": (event, tmpl) ->
    elem = $(event.currentTarget)
    elem.val elem.data("value")  if elem.data("prevent")

  "keydown .limited": (event, tmpl) ->
    elem = $(event.currentTarget)
    max = Offer[event.currentTarget.id].maxLength
    count = elem.val().length
    if count >= max and $.inArray(event.which, permittedKeys) < 0
      elem.data "prevent", true
      elem.data "value", elem.val()
      false
    else
      elem.data "prevent", false

  "keyup .offer-bind-fields input.text, keyup .offer-bind-fields textarea": (event, tmpl) ->
    target = event.currentTarget
    val = target.value.toString()
    val = parseInt(target.value)  if target.id is "price"
    as target.id, val
    Session.set "currentOffer", as()

  "click #qr-button": (event, tmpl) ->
    offerId = @business
    url = "http://deffenbaugh.herokuapp.com/offer/"
    update_qrcode()

Template.account_offer.created = ->
  Session.set "show", as("show") or "text"

  id = Meteor.userId()
  offer = Offers.findOne owner: Meteor.userId()
  as "_id", id
  if not id or id isnt as("owner")
    if offer
      for key of Offer
        as key, offer[key]
      as "updatedAt", moment().unix()
      as "owner", Meteor.userId()
      Session.set "currentOffer", as()
    else
      for key of Offer
        as key, Offer[key].default
      as "updatedAt", moment().unix()
      as "owner", Meteor.userId()
      Session.set "currentOffer", as()
  else
    Session.set "currentOffer", as()


#////////////////////////////////////////////
#  $$ account_offer_symbol
Template.account_offer_symbol.helpers getIcons: ->
  icons

Template.account_offer_symbol.events
  "click .glyph div": (event, tmpl) ->
    attr = event.target.getAttribute("class")
    as "symbol", attr
    Session.set "currentOffer", as()

Template.account_offer_symbol.rendered = ->
  self = this
  $("input").spectrum (
    showButtons: true
    flat: true
    showInput: true
    showPallette: true
    showSelectionPallette: true
    pallette: []
    localStorageKey: "color.pallete"
    preferredFormat: "hsl"
    color: @data.color
    change: (color) ->
      amplify.set "colors.hex", color.toHexString()
      amplify.set "colors.hsl", color.toHsl()
      amplify.set "color", color.toHexString()
      Session.set "currentOffer", as()
      Meteor.call "updateUserColor", color.toHexString()
    move: (color) ->
      $(self.find ".color-bucket").css "background", color.toHexString()
  )


class Dimmer
  constructor: (args) ->
    @el = $("#dimmer")
    @el.css("background", args?.color or "white")
    @opacity = args?.opacity or 0.5
    @speed = args?.speed or 300

  dimIn: =>
    @el.css("display", "block")
    @el
      .stop(true, true)
      .animate
        opacity: @opacity
        , @speed

  dimOut: =>
    @el
      .stop(true,true)
      .animate
        opacity: 0
        , @speed
        , =>
          @el.css("display", "none")

class TerraceAlert
  constructor: (args) ->

    @body = $("body")
    @terrace = $(".terrace")
    @togglerGroups = $(".toggler-group")
    @terraceAlert = $("#terrace-alert")
    @terraceAlert.append("<p>#{args.text}</p>")

    @speed = args.speed or 200
    @autoFade = args.autoFade or true
    @dimmer = args.dimmer or new Dimmer(@)
    @setTimeout() if @autoFade

    @show()

  setTimeout: =>
    @timeoutId = Meteor.setTimeout =>
      @hide()
    , unless typeof @autoFade is "number" then 5000
    @terraceAlert.on "mouseenter", =>
      Meteor.clearTimeout @timeoutId
    @terraceAlert.on "mouseleave", =>
      @setTimeout()

  show: =>
    @dimmer.dimIn() if @dimmer
    @togglerGroups
      .stop(true, true)
      .fadeOut(@speed)
    @terrace
      .stop(true, true)
      .slipShow
        speed: 1
        haste: 1
        , =>
          @terraceAlert.slipShow
            speed: @speed
            haste: 1
          @body.on "click", "#dimmer", =>
              @hide()

  hide: =>
    Meteor.clearTimeout @timoutId
    @body.off "click", "#dimmer"
    @dimmer.dimOut() if @dimmer
    @terraceAlert
      .empty()
      .stop(true,true)
      .slipHide
        speed: @speed
        haste: 1
      , =>
        @togglerGroups
          .stop(true, true)
          .fadeIn(@speed)
        @terrace
          .stop(true, true)
          .slipHide
            speed: @speed
            haste: 1


#////////////////////////////////////////////
#  $$ account_offer_tags

Template.account_offer_tags.events

  'dblclick li[data-group="tags"]': (event, tmpl) ->
    Tags.remove name: $(event.currentTarget).attr("data-name")

  'click .create-tag button': (event, tmpl) ->
    target = $(event.currentTarget)
    text = target.siblings("input").val()

    if not text
      new TerraceAlert
        text: "You must enter a name in order to add a tag"

    else
      tagset = target.parent("li").attr("data-tagset")

      Meteor.call "insertTag",
        name: text
        tagset: tagset
        involves: []
        collection: "tags"
        , (err, res) ->
          if err
            new TerraceAlert
              text: err.reason
          else
            userLoc = Store.get("user_loc")
            store = Store.get("tag_selection")

            store.tags ?= []
            store.tags.push
              name: text
              tagset: tagset
              active: true
            console.log(res)
            amplify.store "tagset", store.tagset
            Store.set "tag_selection", store


  "click span[data-group='tags'], click li[data-group='tagset']": (event, tmpl) ->
    group = $(event.currentTarget).attr "data-group"
    store = Store.get("tag_selection") or {}
    self = @
    console.log(self)

    store[group] ?= []

    if group is "tagset"
      store.tags = []
      store.tagset = []

    existing = _.find( store[group], (g)-> g.name == self.name)

    if existing
      store[group].splice(store[group].indexOf(existing), 1)
    else
      store[group].push
        name: self.name
        disabled: false
        active: true

    amplify.store "tags", store.tags
    amplify.store "tagset", store.tagset
    Store.set "tag_selection", store


#////////////////////////////////////////////
#  $$ account_feedback
Template.account_feedback.events "click #feedback button": (event, tmpl) ->
  event.preventDefault()
  message = tmpl.find("textarea").value
  Meteor.call "message", message, "toAdmins"


#////////////////////////////////////////////
#  $$ account_messages
Template.account_message.events "click .send": (event, tmpl) ->
  textarea = $(tmpl.find("textarea"))
  console.log tmpl.data
  Meteor.call "message", textarea.val(), "reply", tmpl.data._id
