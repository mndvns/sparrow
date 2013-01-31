

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


icon =
  warning: "<i class='glyph-notice'></i>  "
  neutral: "<i class='glyph-info'></i>  "
  success: "<i class='glyph-checkmark'></i>  "

permittedKeys = [8, 37, 38, 39, 40, 46, 9, 91, 93]
icons = ["drink", "drink-2", "drink-3", "microphone", "coffee", "ice-cream", "cake", "pacman", "wallet", "gamepad", "bowling", "space-invaders", "batman", "lamp", "lamp-2", "appbarmoon"]

#////////////////////////////////////////////
#  $$ helpers
Handlebars.registerHelper "charLength", (a) ->
  Offer[a].maxLength - (this[a] and this[a].length)

Handlebars.registerHelper "getEmail", (a) ->
  user = Meteor.user()
  user.emails and user.emails[0]

Handlebars.registerHelper "multiply", (a, b) ->
  return a * b


Handlebars.registerHelper "hsl", (l, a) ->
  hue = @.colors and @.colors.hsl.h * 360
  sat = @.colors and @.colors.hsl.s * 100
  light = l or 50
  alpha = a / 100 or 1

  "hsla(" + hue + "," + sat + "%," + light + "%," + alpha + ")"


# ////////////////////////////////////////////
#  $$ body
Template.body.events "click .links li": (event, tmpl) ->


# var selector = event.currentTarget.getAttribute("data-page")
# as("accountPage", selector)
# Session.set("accountPage", selector)
Template.body.rendered = ->
  self = this
  return  if Meteor.Router.page() is "home"
  self.activateLinks = Meteor.autorun(->
    out = Meteor.Router.page()
    parse = "/" + out.split("_").join("/")
    target = $("ul.links a[href='" + parse + "']")
    target.addClass "active"
    target.siblings().removeClass "active"
  )
  self.activateLinks.stop()


#////////////////////////////////////////////
#  $$ account
# Template.account.created = ->
#   d3.select("html").transition().style "background", ->
#     "#eee"



#////////////////////////////////////////////
#  $$ account_profile
Template.account_profile.events "click .save": (event, tmpl) ->
  validateEmail = (email) ->
    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    re.test email

  newEmail = tmpl.find("#email").value
  newUsername = tmpl.find("#username").value
  unless validateEmail(newEmail)
    dhtmlx.message
      type: "warning"
      text: icon.warning + "Invalid email"

    return
  Meteor.call "updateUser", newEmail, newUsername, (err) ->
    if err
      dhtmlx.message
        type: "warning"
        text: icon.warning + err.reason

    else
      dhtmlx.message
        type: "success"
        text: icon.success + "Saved successfully"




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
      errors.push key  if Offer[key].hasOwnProperty("maxLength") unless offer[key]
    if errors.length
      dhtmlx.message
        type: "warning"
        text: icon.warning + "You didn't enter anything for your " + errors.join(", ") + "."

      return false
    
    # else {
    #   dhtmlx.message({
    #     "type": "neutral",
    #     "text": icon.neutral + "Loading...",
    #   })
    # }
    type = (if Offers.findOne(owner: Meteor.userId()) then "update" else "insert")
    geo = new google.maps.Geocoder()
    geo.geocode
      address: offer.street + " " + offer.city + " " + offer.state + " " + offer.zip
    , (results, status) ->
      if status isnt "OK"
        dhtmlx.message
          type: "warning"
          text: icon.warning + "We couldn't seem to find your location. Did you enter your address correctly?"

      else
        offer.loc =
          lat: results[0].geometry.location.Ya
          long: results[0].geometry.location.Za

        Meteor.call "editOffer", type, offer, (error) ->
          if error
            dhtmlx.message
              type: "warning"
              text: icon.warning + error.reason

          else
            dhtmlx.message
              type: "success"
              text: icon.success + "You're good to go!"




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

  "keyup input.text, keyup textarea": (event, tmpl) ->
    target = event.currentTarget
    val = target.value.toString()
    val = parseInt(target.value)  if target.id is "price"
    as target.id, val
    Session.set "currentOffer", as()

  "click #qr-button": (event, tmpl) ->
    offerId = @business
    url = "http://deffenbaugh.herokuapp.com/offer/"
    update_qrcode()

Template.account_offer.rendered = ->
  self = this
  self.showHandle = Meteor.autorun(->
    out = as("show")
    $(".account.navbar li[data-value='" + out + "']").addClass "active"
  ).stop()
  self.helpHandle = Meteor.autorun(->
    out = Session.get("help")
    $(".account.navbar li.help").addClass "active"  if out
  ).stop()

Template.account_offer.created = ->
  Session.set "show", as("show") or "text"
  Session.set "help", as("help") or false

  id = Meteor.userId()
  offer = Offers.findOne owner: Meteor.userId()
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

#////////////////////////////////////////////
#  $$ account_offer_tags
Template.account_offer_tags.helpers
  getTags: (data) ->
    self = this
    out = Tags.find(tagset: self.name).fetch()
    out

  checkTagsetActive: (data) ->
    tagset = {}
    tagset.name = @name
    tagset.attr = (if as("tagset") is @name then "active" else "inactive")
    tagset

  checkTagActive: (data) ->
    tag = {}
    tag.name = @name
    tag.attr = (if _.contains(as()["tags"], @name) then "data-active" else "")
    tag

Template.account_offer_tags.events
  "click .tagset": (event, tmpl) ->
    tar = $(event.currentTarget)
    return false  if tar.attr("data-status") is "active"
    tar.attr "data-status", "active"
    tar.siblings().attr("data-status", "inactive").find("span").removeAttr "data-active"
    as "tagset", tar.attr("data-tagset")
    as "tags", []
    Session.set "currentOffer", as()

  "click .tag-list span": (event, tmpl) ->
    tar = event.target
    unless tar.hasAttribute("data-active")
      event.target.setAttribute "data-active"
      tags = as("tags") or []
      tags.push @name
      as "tags", tags
      Session.set "currentOffer", as()
    else
      event.target.removeAttribute "data-active"
      tags = _.without(as("tags"), @name)
      as "tags", tags
      Session.set "currentOffer", as()


#////////////////////////////////////////////
#  $$ account_offer_text

#////////////////////////////////////////////
#  $$ account_metrics
Template.account_metrics.offers = ->
  Offers.find().count()

Template.account_metrics.votes = ->
  votes = _.pluck(Offers.find().fetch(), "votes")
  votes


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
