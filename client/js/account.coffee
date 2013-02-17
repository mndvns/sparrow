

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

Template.content.rendered = ->
  return if Meteor.Router.page() is "home"
  @activateLinks = Meteor.autorun(=>
    out = Meteor.Router.page()
    parse = ("/" + out.split("_").join("/"))
    target = $(@findAll("ul.links a"))
    target.removeClass( "active" )
    target.filter("[href='" + parse + "']").addClass("active")
    if Session.get("show") isnt null
      show = Session.get("show")
      els = $(@findAll("li.show"))
      els.removeClass("active")
      els.filter("[data-value=#{show}]").addClass("active")
  )
  @activateLinks.stop()

#////////////////////////////////////////////
#  $$ account_profile
Template.account_profile.events "click .save": (event, tmpl) ->

  newEmail = tmpl.find("#email").value
  newUsername = tmpl.find("#username").value

  unless validateEmail(newEmail)
    Meteor.Alert.set
      text: "Invalid email"
    return

  Meteor.call "updateUser", newEmail, newUsername, (err) ->
    if err
      Meteor.Alert.set
        text: err.reason

    else
      Meteor.Alert.set
        text: "Saved successfully"


#////////////////////////////////////////////
# $$  account_offer
Template.account_offer.helpers
  getOffer: ->
    Session.get "currentOffer"

  show: (a) ->
    true if Session.get("show") is a

Template.account_offer.events
  "click .save": (event, tmpl) ->
    offer = as()
    Session.set "currentOffer", offer
    errors = []

    for key of Offer
      errors.push key if Offer[key].hasOwnProperty("maxLength") unless offer[key]

    if errors.length
      Meteor.Alert.set
        text: "You didn't enter anything for your #{errors.join(", ")}."
      return

    type = (if Offers.findOne(owner: Meteor.userId()) then "update" else "insert")
    console.log("SAVE TYPE", type)

    loading = Meteor.Alert.set
      text: "Loading..."
      temp: true

    geo = new google.maps.Geocoder()
    geo.geocode
      address: offer.street + " " + offer.city + " " + offer.state + " " + offer.zip
    , (results, status) ->
      if status isnt "OK"
        Meteor.Alert.set
          text: "We couldn't seem to find your location. Did you enter your address correctly?"

      else
        offer.loc =
          lat: results[0].geometry.location.Ya
          long: results[0].geometry.location.Za
        offer.updatedAt = Time.now()

        Meteor.call "editOffer", type, offer, (error) ->
          if error
            Meteor.Alert.set
              text: error.reason

          else
            Meteor.Alert.set
              text: "You're good to go!"

          return


  "click .offer": (event, tmpl) ->
    return false

  "click .show": (event, tmpl) ->
    area = event.currentTarget.getAttribute("data-value")
    as "show", area
    Session.set "show", as("show")
    Session.set "currentOffer", as()

    elem = $(event.currentTarget)
  "focus .limited": (event, tmpl) ->
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

transitionEvents = 'webkitTransitionEnd.transitioner oTransitionEnd.transitioner transitionEnd.transitioner msTransitionEnd.transitioner transitionend.transitioner'

Template.account_offer.created = ->
  # $("body").on self.transitionEvents, (e)->
  #   console.log("GOT HEEEEEEEEEEEEEEEEEEEEERE")
  #   if $(e.target).is("body")
  #     Session.set "show", as("show") or "text"

  id = Meteor.userId()
  offer = Offers.findOne owner: Meteor.userId()
  as "_id", "123"
  as "votes", [1]
  as "updatedAt", Time.now()
  if id isnt as("owner")
    if not offer
      for key of Offer
        as(key, Offer[key].default)
      as "owner", id
    else
      for key of Offer
        as(key, offer[key])
      as "owner", id
  Session.set "currentOffer", as()

# Template.account_offer.destroyed = ->
#   if Session.get "show"
#     Session.set "show", null
#     console.log("DESTORYED !!!!!")

#////////////////////////////////////////////
#  $$ account_offer_symbol


Template.account_offer_symbol.helpers
  getIcons: ->
    icons

Template.account_offer_symbol.events
  "click .glyph div": (event, tmpl) ->
    attr = event.target.getAttribute("class")
    $("section.symbol div").attr("class", attr).css("background-image", "")
    as "symbol", attr
    as "symbol_type", "glyph"
    Store.set "offer_active_symbol", attr
    # Session.set "currentOffer", as()

  'click .select-file': (e, t) ->
    target = $(e.currentTarget)
    $("section.symbol div").attr("class", "").css("background-image", "url(#{@src})")
    as "symbol", @src
    as "symbol_type", "image"
    Store.set "offer_active_symbol", @src
    # Session.set "currentOffer", as()

  'click .save-file': (e, t)->
    Meteor.call "imgurUploadFile", @

  "change .fileUploader": (e, t) ->
    file = e.target.files?[0]
    Meteor.Alert.set
      text: "Compressing image..."
      wait: true

    if file
      reader = new FileReader()
      reader.onloadend = (e)->
        img = new Image()
        img.onload = ->

          canvas = document.createElement "canvas"
          new thumbnailer canvas, img, 200, 3, ->

            Meteor.call "imgurPrepFile", @canvas.toDataURL()

        img.src = reader.result

      reader.readAsDataURL( file )

  'click .file': (e, t) ->
    console.log @

  'click .delete-file': (e, t) ->
    Meteor.call "imgurDelete", @, @deletehash

Template.account_offer_symbol.rendered = ->
  $("input.color").spectrum (
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
    move: (color) =>
      console.log "MOVED", @find(".color-bucket")
      @find(".color-bucket").style.background = color.toHexString()
  )

# Template.account_offer_symbol.preserve ['.color-bucket']


#////////////////////////////////////////////
#  $$ account_offer_tags

Template.account_offer_tags.events

  'dblclick li[data-group="tags"]': (event, tmpl) ->
    Tags.remove name: $(event.currentTarget).attr("data-name")

  'click .create-tag button': (event, tmpl) ->
    target = $(event.currentTarget)
    text = target.siblings("input").val()

    if not text
      Meteor.Alert.set
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
            Meteor.Alert.set
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
            Meteor.flush()


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

    Store.set "tag_selection", store

    amplify.store "tags_meta", store.tags, "name"
    amplify.store "tags", _.pluck(store.tags, "name")
    amplify.store "tagset", _.pluck(store.tagset, "name")?[0]


Template.account_offer_tags.rendered = =>
  unless @handle
    @handle = Meteor.autorun ->
      console.log("RUNNING")
      Meteor.call "aggregateTags", Store.get("user_loc"), Store.get("tag_selection"), (err, result) ->
        if err is `undefined`
          Store.set "stint_tags", result
        else
          console.log err


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
