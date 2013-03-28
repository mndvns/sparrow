


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
  $("#qr-code").html(create_qrcode(url + offerId)).find("td").css {
    width   : "10px"
    height  : "10px"
  }

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

# Template.account.rendered = ->
#   Store.set("page_account", "account_profile")
#   Store.set("page_account_profile", "account_profile_edit")

# ////////////////////////////////////////////
# $$  account_offer

Template.account_offer.events {}=

  "click .offer" : (event, tmpl) ->
    false

  "keyup [data-validate], change [data-validate]": (e, t) ->
    t = e.current-target
    o = Offer.store-get!set-store t.id, t.value

  'keydown [data-validate]#price': (e, t) ->
    is-number-key = (evt) ->
      charCode = (if (evt.which) then evt.which else event.keyCode)
      return false  if charCode > 31 and (charCode < 48 or charCode > 57)
      true
    unless is-number-key(e) then return false

  'click #qr-button': (event, tmpl) ->
    offerId = @business
    url = "http://deffenbaugh.herokuapp.com/offer/"
    update_qrcode()

Template.account_offer.created = ->
  unless Store.get("show_account_offer")
    Store.set("show_account_offer", "account_offer_info")
  Offer.loadStore()
  # My.offer!



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
    move: (color) ~>
      $(@find(".color-bucket")).css("background", color.toHexString())
  )


Template.account_offer_images.events {}=

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
    Meteor.Alert.set {}=
      text: "Compressing image..."
      wait: true

    if file
      reader = new FileReader!
      reader.onloadend = (e)->
        img = new Image!
        img.onload = ->

          # Meteor.call "imgurPrepFile", reader.result

          canvas = document.createElement "canvas"
          new thumbnailer canvas, img, 500, 3, ->

            Meteor.call "imgurPrepFile", @canvas.toDataURL()

        img.src = reader.result

      reader.readAsDataURL( file )

  'click .file': (e, t) ->
    console.log @

  'click .delete-file': (e, t) ->
    Meteor.call "imgurDelete", @, @deletehash
    @destroy!

Template.account_offer_images.rendered = ->
  adjustFileInput = ~>
    file_input = $(@find(".file-input"))
    width      = file_input.width()
    file_input.height(width)

    proxy = $(@find(".proxy span"))
    proxy_height = (width / 2) - (proxy.height() / 2)
    proxy.css("top", proxy_height + "px")


  adjustFileInput()

  $(window).on "resize", ->
    _.throttle adjustFileInput!, 100


#////////////////////////////////////////////
#  $$ account_offer_tags

Template.account_offer_tags.events {}=

  'click .create-tag .insert': (event, tmpl) ->
    Tag.new name: (tmpl.find \input .value) ..save!

  "click li[data-group='tagset']": (e, t) ->
    console.log \ASDASDASDASA, @name
    My.offer! ..set \tagset, @name ..save!
    Tag.destroy-mine!

  "click li[data-group='tags']": (e, t) ->
    switch My.map "name", "tags" |> _.contains _, @name
    | true => @clone-kill "name"
    | _    => @clone-new! ..save!

Template.account_offer_tags.helpers {}=
  "contains_my_tags": -> My.map "name", "tags" |> _.contains _, it


#////////////////////////////////////////////
#  $$ account_location

Template.account_offer_location.events {}=
  'click button': (e, t) ->
    e.prevent-default!
    Location.serialize \form#locations ..geo-map!

  'click .destroy': (e, t) ->
    @destroy!


#////////////////////////////////////////////
#  $$ account_feedback

Template.account_messages_feedback.events 'click #feedback button': (event, tmpl) ->
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

Template.account_earnings_dashboard.events {}=
  'click a.stripe-connect': (event, tmpl) ->
    Meteor.Alert.set text: "Connecting to Stripe...", wait: true
    window.open "https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=#{Stripe.client_id}"
