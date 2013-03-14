

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
# icons = ["drink", "drink-2", "drink-3", "microphone", "coffee", "ice-cream", "cake", "pacman", "wallet", "gamepad", "bowling", "space-invaders", "batman", "lamp", "lamp-2", "appbarmoon"]

#////////////////////////////////////////////
#  $$ helpers

Handlebars.registerHelper "charMax", (a) ->
  Offer._schema[a].max

Handlebars.registerHelper "charLeft", (a) ->
  Offer._schema[a].max - (this[a]?.length)

Handlebars.registerHelper "getEmail", (a) ->
  user = Meteor.user()
  user?.emails and user.emails[0]

Template.account.rendered = ->
  Store.set("page_account", "account_profile")
  Store.set("page_account_profile", "account_profile_edit")

#////////////////////////////////////////////
# $$  account_offer

Template.account_offer.events
  "click .offer": (event, tmpl) ->
    return false

  "keyup [data-validate], change [data-validate]": (event, tmpl) ->
    target = event.currentTarget
    val = target.value.toString()
    offer = Offer.storeGet()
    offer[target.id] = val
    # console.log(offer)
    Offer.new( offer ).storeSet()

  'keydown [data-validate]#price': (e, t) ->
    isNumberKey = (evt) ->
      charCode = (if (evt.which) then evt.which else event.keyCode)
      return false  if charCode > 31 and (charCode < 48 or charCode > 57)
      true

    unless isNumberKey(e) then return false

  "click #qr-button": (event, tmpl) ->
    offerId = @business
    url = "http://deffenbaugh.herokuapp.com/offer/"
    update_qrcode()

Template.account_offer.created = ->
  unless Store.get("show_account_offer")
    Store.set("show_account_offer", "account_offer_info")

  Offer.loadStore()

#////////////////////////////////////////////
#  $$ account_offer_symbol


Template.account_profile_colors.rendered = ->
  $(@find("input.color")).spectrum(
    showButtons: true
    flat: true
    showInput: true
    showPallette: true
    showSelectionPallette: true
    pallette: []
    localStorageKey: "color.pallete"
    color: offer.color
    change: (color) ->
      Meteor.call "updateUserColor", color.toHexString()
    move: (color) =>
      $(@find(".color-bucket")).css("background", color.toHexString())
  )


Template.account_offer_images.events

  'click .select-file': (e, t) ->
    target = $(e.currentTarget)
    $("section.image div").attr("class", "").css("background-image", "url(#{@src})")
    as "image", @src
    Store.set "offer_active_image", @src

  'click .save-file': (e, t)->
    Meteor.call "imgurUploadFile", @

  'click .file-input .proxy': (e, t) ->
    $(e.currentTarget).siblings("input").trigger('click')


  "change .file-uploader": (e, t) ->
    file = e.target.files?[0]
    Meteor.Alert.set
      text: "Compressing image..."
      wait: true

    if file
      reader = new FileReader()
      reader.onloadend = (e)->
        img = new Image()
        img.onload = ->

          Meteor.call "imgurPrepFile", reader.result

          # canvas = document.createElement "canvas"
          # new thumbnailer canvas, img, 500, 3, ->

          #   Meteor.call "imgurPrepFile", @canvas.toDataURL()

        img.src = reader.result

      reader.readAsDataURL( file )

  'click .file': (e, t) ->
    console.log @

  'click .delete-file': (e, t) ->
    Meteor.call "imgurDelete", @, @deletehash

Template.account_offer_images.rendered = ->
  adjustFileInput = =>
    file_input = $(@find(".file-input"))
    width      = file_input.width()
    file_input.height(width)

    proxy = $(@find(".proxy span"))
    proxy_height = (width / 2) - (proxy.height() / 2)
    proxy.css("top", proxy_height + "px")


  adjustFileInput()

  $(window).on "resize", ->
    _.throttle(adjustFileInput(), 100)


#////////////////////////////////////////////
#  $$ account_offer_tags

Template.account_offer_tags.events

  'dblclick li[data-group="tags"]': (event, tmpl) ->
    Tags.remove name: $(event.currentTarget).attr("data-name")

  'click .create-tag .insert': (event, tmpl) ->
    target = $(event.currentTarget)
    text = target.next("span").children("input").val()

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


  "click li[data-group='tags'], click li[data-group='tagset']": (event, tmpl) ->
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


# Template.account_offer_tags.rendered = ->
#   unless @handle
#     @handle = Meteor.autorun ->
# 
#       console.log("RUNNING")
#       Meteor.call "pushStintTags", Store.get("user_loc"), Store.get("tag_selection"), (err, result) ->
#         if typeof err is 'undefined'
#           Store.set "stint_tags", result
#         else
#           console.log err
# 
# Template.account_offer_tags.destroyed = ->
#   @handle.stop()

#////////////////////////////////////////////
#  $$ account_feedback
Template.account_messages_feedback.events "click #feedback button": (event, tmpl) ->
  event.preventDefault()
  message = tmpl.find("textarea").value
  Meteor.call "message", message, "toAdmins"


#////////////////////////////////////////////
#  $$ account_messages

Template.account_messages.rendered = ->
  Store.set("page_account", "account_messages")
  Store.set("page_account_messages", "account_messages_inbox")

Template.account_message.events "click .send": (event, tmpl) ->
  textarea = $(tmpl.find("textarea"))
  console.log tmpl.data
  Meteor.call "message", textarea.val(), "reply", tmpl.data._id





#////////////////////////////////////////////
#  $$ account_earnings

Template.account_earnings.rendered = ->
  Store.set("page_account", "account_earnings")
  Store.set("page_account_earnings", "account_earnings_dashboard")

Template.account_earnings_dashboard.events
  'click a.stripe-connect': (event, tmpl) ->
    Meteor.Alert.set
      text: "Connecting to Stripe..."
      wait: true
    window.open "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=#{Stripe.client_id}"
