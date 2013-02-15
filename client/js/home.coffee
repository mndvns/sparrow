
#////////////////////////////////////////////
#  $$  globals and locals

checkHelpMode = ->
  $(".wrapper").hasClass("help-mode")

# checkHelp = (a)->
#   if a.getAttribute("data-help-block") is "true"
#     return true

Sparrow = {}
Sparrow.shift = ->
  Session.get "shift_area"

statCurrent = ->
  out =
    query:
      tagset: Session.get("current_tagsets")
      tag: Session.get("current_tags")
      sort:
        selector: Session.get("current_sorts_selector")
        order: Session.get("current_sorts_order")

    verbose:
      tagset: Session.get("current_tagsets")
      tag: Session.get("current_tags")
      sort: Session.get("current_sorts")
      noun: Session.get("current_nouns")

  out.verbose.tagset = (if out.verbose.tagset and out.verbose.tagset.length then out.verbose.tagset else ["find"])
  out.verbose.noun = (if out.verbose.noun and out.verbose.noun.length then out.verbose.noun else ["offer"])
  out.verbose.article = (if out.verbose.sort and out.verbose.sort.length then ["the"] else ["some"])
  if out.verbose.tagset.toString() is "shop"
    article = out.verbose.article.toString()
    out.verbose.article = ["for " + article]
  out

statRange = ->
  out =
    max:
      updatedAt: Session.get("max_updatedAt")
      distance: Session.get("max_distance")
      votes: Session.get("max_votes")
      price: Session.get("max_price")

    min:
      updatedAt: Session.get("min_updatedAt")
      distance: Session.get("min_distance")
      votes: Session.get("min_votes")
      price: Session.get("min_price")

  out


#////////////////////////////////////////////
#  $$ helpers
Handlebars.registerHelper "page_next", (area) ->
  shift_sub_area = Session.get("shift_sub_area")
  if area isnt shift_sub_area then return false
  parse_sub_area = shift_sub_area.split("_").join("/")
  Meteor.Transitioner.setOptions after: ->
    Meteor.Router.to (if shift_sub_area is "home" then "/" else "/" + parse_sub_area)

  return shift_sub_area



Template.wrapper.events

  "click a[data-toggle-mode]": (event, tmpl) ->
    selectEl = event.currentTarget
    rivalEl = $(selectEl.parentElement).siblings(".toggler-group")

    mode     = selectEl.getAttribute "data-toggle-mode"
    targetEl = tmpl.find(".terrace")
    modeEl   = targetEl.querySelector("##{mode}")

    slipElements
      selectEl: $(selectEl)
      targetEl: $(targetEl)
      modeEl  : $(modeEl)
      rivalEl : rivalEl

  "click a[data-toggle-mode='help']": (event, tmpl) ->
    dhb = "data-help-block"
    blocks = $("[#{dhb}]")
    status = blocks.first().attr(dhb)
    wrapper = $(tmpl.find(".wrapper"))
    wrapperClasses = "help-mode clr-bg dark"
    span = $(event.currentTarget).children("span")

    if status is "true"
      blocks.attr(dhb, "false")
      blocks.removeAttr "help-active"
      wrapper.removeClass wrapperClasses
      span.text("help")

    else
      blocks.attr(dhb, "true")
      wrapper.addClass wrapperClasses
      span.text("exit")

  "click .help-mode [data-help-block='true']": (event, tmpl) ->

    event.stopPropagation()

    $target = $(event.currentTarget)
    selector = $target.attr "data-help-selector"

    oldB = tmpl.findAll("[help-active='true']")
    newB = tmpl.findAll("[data-help-selector='#{selector}']")

    console.log(oldB, newB)

    $(oldB).attr("help-active", "false")
    $(newB).attr("help-active", "true")

    tmpl.find("#help p").textContent = helpBlocks[selector].summary

    return false

  "mouseenter .help-mode [data-help-block='true']": (event, tmpl) ->

    selector = event.currentTarget.getAttribute "data-help-selector"

    help = tmpl.find("#help")

    text = (cb)->
      help.querySelector("h4").innerHTML = helpBlocks[selector] and helpBlocks[selector].title
      help.querySelector("p").innerHTML = helpBlocks[selector] and helpBlocks[selector].summary
      if cb and typeof cb is "function" then cb()

    if help.style.display isnt "block"
      text()
      $(help).fadeIn 'fast'
    else
      $(help).fadeOut 'fast', ->
        text(->
          $(help).fadeIn 'fast'
        )

  "mouseleave .help-mode [data-help-block='true']": (event, tmpl) ->
    help = tmpl.find("#help")
    $(help).fadeOut('fast')

  "click .shift": (event, tmpl) ->

    if checkHelpMode() then return
    if event.currentTarget.hasAttribute("disabled") then return

    dir = event.currentTarget.getAttribute("data-shift-direction")
    area = event.currentTarget.getAttribute("data-shift-area")
    page = Meteor.Router.page()
    current = _.first(page.split("_"))
    sub_area = as("page_" + area) or area

    # console.log("DIR", dir)
    console.log("AREA", area)
    console.log("SUB AREA", sub_area)
    # console.log("PAGE", page)
    console.log("CURRENT", current)

    Session.set "shift_direction", dir
    Session.set "shift_area", area
    Session.set "shift_sub_area", sub_area
    Session.set "shift_current", current




#//////////////////////////////////////////////
#// $$ ceiling

slipElements = (opt) ->
  $select = opt.selectEl
  $target = opt.targetEl
  $mode   = opt.modeEl
  $rival  = opt.rivalEl

  $select.toggleClass("active")

  $speed = 300

  if $select.hasClass("active")
    $mode.show()
    $rival.fadeToggle()
    $target.slipShow
      speed: $speed
      haste: 1

  else
    $target.slipHide
      speed: $speed
      haste: 1
      , ->
        $mode.hide()
        $rival.fadeToggle()


Template.ceiling.events

  "click .navigation a": (event, tmpl) ->
    target = event.currentTarget
    active = target.getAttribute("class")

    if active is "active" then return

    selectEl = $(target)
    selectEl.addClass("active")
    selectEl.siblings().removeClass("active")

    data = selectEl.data()["accountData"]

    hide = for h in data.hide
      tmpl.find("[data-account='#{h}']")
    show = for s in data.show
      tmpl.find("[data-account='#{s}']")

    speed = 150

    $(hide).slipHide
      speed: speed
      haste: 1
      , ->
        $(show).slipShow
          speed: speed
          haste: 1

    type = data.type
    text = target.textContent

    button = tmpl.find("button[type='submit']")

    button.setAttribute "data-account-submit-type", data.type
    button.textContent = data.text


  "click button[type='submit']": (event, tmpl) ->
    event.preventDefault()

    username    = tmpl.find("input#username").value
    password    = tmpl.find("input#password").value
    email       = tmpl.find("input#email").value
    password2   = tmpl.find("input#password2").value
    forgotEmail = tmpl.find("input#forgot-email").value

    type = event.currentTarget.getAttribute("data-account-submit-type")

    handleResponse = (err, res) ->
      if err
        $(tmpl.find(".alert")).text(err.reason).addClass "in"

    if type is "sign" or type is "create"

      errors = []

      if not username then errors.push "username"
      if not password then errors.push "password"

      if errors.length
        handleResponse reason: "Must enter a #{errors.join(" and ")}"
        return

      switch type
        when "create"
          errors = []

          if username.length < 5 then errors.push "username"
          if password.length < 5 then errors.push "password"

          if errors.length
            handleResponse reason: "#{errors.join(" and ")} must be at least five characters"
            return

          if password isnt password2
            handleResponse reason: "Passwords do not match"
            return

          if email and not validateEmail(email)
            handleResponse reason: "Invalid email"
            return

          Accounts.createUser
            username: username
            email: email
            password: password,
            (err) ->
              handleResponse err, "Account made"

        when "sign"
          Meteor.loginWithPassword username, password, (err) ->
            handleResponse err, "You've logged in"

    else if type is "forgot"

      if not forgotEmail
        handleResponse reason: "Must enter an email address"
        return

      if forgotEmail and not validateEmail forgotEmail
        handleResponse reason: "Invalid email"
        return

      handleResponse reason: "A message has been sent"

      console.log(forgotEmail)
      return

  "click .logout": (event, tmpl) ->
    Meteor.logout()

#////////////////////////////////////////////
#  $$ content
Template.content.events

  'click .links a': (event, tmpl) ->
    href = event.currentTarget.getAttribute "href"
    area = href.slice(1).split("/")
    amplify.set "page_#{area[0]}", area.join("_")

  'click .accord header': (event, tmpl) ->
    if not $(event.target).hasClass "active"
      $(event.currentTarget).siblings().slideDown()
    else
      $(event.currentTarget).siblings().slideUp()
    $(event.target).toggleClass "active"


colorFill = (el, selector, value) ->
  "#{el} { #{selector} : #{value} }"

Handlebars.registerHelper "renderThemeColors", (user, selector) ->

  if user and user.colors
    color = user.colors

    themeColors = _.find document.styleSheets, (d) ->
      d.title is "dynamic-theme"

    for rule in themeColors.rules
      themeColors.removeRule()


    themeColors.insertRule( colorFill ".clr-text.prime", "color", color.prime.medium)
    themeColors.insertRule( colorFill "a", "color", color.prime.medium)
    themeColors.insertRule( colorFill "a:hover, a.active", "color", color.prime.medium )

    themeColors.insertRule( colorFill ".clr-text.desat", "color", color.prime.light )
    themeColors.insertRule( colorFill ".clr-text.desat:hover", "color", color.prime.medium )
    themeColors.insertRule( colorFill ".clr-text.desat:active", "color", color.prime.dark )

    themeColors.insertRule( colorFill ".clr-bg", "background", color.prime.medium)
    themeColors.insertRule( colorFill ".clr-bg.btn:hover", "background", color.prime.medium)

    themeColors.insertRule( colorFill ".clr-bg.light", "background", color.prime.light )
    themeColors.insertRule( colorFill ".clr-bg.dark", "background", color.prime.dark )
    return



#////////////////////////////////////////////
#  $$ home

Template.home.helpers
  getOffers: ->

    current = statCurrent()?.query
    offers = Offers.find().fetch()
    myLoc = Store.get "user_loc"

    result = _.filter offers, (o)->
      if current.tagset?.length is 0
        return o

      else if current.tag?.length is 0
        contains = _.contains(_.pluck(o.tagset, "name"), current.tagset.toString())
        return o if contains

      else
        intersection = _.intersection(current.tag, _.pluck(o.tags, "name"))
        return o if intersection?.length > 0

    if result and myLoc
      survey = _.each(result, (d) ->
        d.distance = Math.round(distance(myLoc.lat, myLoc.long, d.loc.lat, d.loc.long, "M") * 10) / 10
      )
      range =
        max:
          updatedAt: _.max(result, (o) ->
            o.updatedAt
          )
          distance: _.max(result, (o) ->
            o.distance
          )
          votes: _.max(result, (o) ->
            o.votes
          )
          price: _.max(result, (o) ->
            o.price
          )

        min:
          updatedAt: _.min(result, (o) ->
            o.updatedAt
          )
          distance: _.min(result, (o) ->
            o.distance
          )
          votes: _.min(result, (o) ->
            o.votes
          )
          price: _.min(result, (o) ->
            o.price
          )

      Session.set "max_updatedAt", range.max.updatedAt
      Session.set "max_distance", range.max.distance
      Session.set "max_votes", range.max.votes
      Session.set "max_price", range.max.price
      Session.set "min_updatedAt", range.min.updatedAt
      Session.set "min_distance", range.min.distance
      Session.set "min_votes", range.min.votes
      Session.set "min_price", range.min.price
      result

  styleDate: (date) ->
    moment(date).fromNow()

#////////////////////////////////////////////
#  $$ intro

Template.intro.events
  "click #getLocation": (event, tmpl) ->
    getLocation()

  'click .geolocate': (event, tmpl)->

    location = tmpl.find("input").value
    if not location then return

    geo = new google.maps.Geocoder()
    geo.geocode
      address: location
    , (results, status) ->
      if status isnt "OK"
        dhtmlx.message
          type: "warning"
          text: icon.warning + "We couldn't seem to find your location. Did you enter your address correctly?"

      else
        # console.log
        #   lat: results[0].geometry.location.Ya
        #   long: results[0].geometry.location.Za

        Store.set "user_loc",
          lat: results[0].geometry.location.Ya
          long: results[0].geometry.location.Za


resizeButton = ->
  button = $("button")
  text = button.siblings()
  height = text.outerHeight()
  $("#intro").height(height)

Template.intro.rendered = ->
  $(@find("h1")).fitText .6
  $(@find("h2")).fitText 2
  # resizeButton()
  # $(window).on "resize", ->
  #   resizeButton()
