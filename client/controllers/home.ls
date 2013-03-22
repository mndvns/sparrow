

# #////////////////////////////////////////////
# #  $$  globals and locals

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
      tagset : Store.get("current_tagsets")
      tag    : Store.get("current_tags")
      sort:
        verbose   : Store.get("current_sorts")
        specifier : Store.get("current_sorts_specifier")
        selector  : Store.get("current_sorts_selector")
        order     : Store.get("current_sorts_order")

    verbose:
      tagset        : Store.get("current_tagsets")
      tag           : Store.get("current_tags")
      sort          : Store.get("current_sorts")
      sort_selector : Store.get("current_sorts_selector")
      noun          : Store.get("current_nouns")

  out.verbose.tagset  = (if out.verbose.tagset?.length then out.verbose.tagset else ["find"])
  out.verbose.noun    = (if out.verbose.noun?.length then out.verbose.noun else ["offer"])
  out.verbose.article = (if out.verbose.sort?.length then ["the"] else ["some"])

  if out.verbose.sort_selector is "$natural"
      out.verbose.sort_selector = "distance"

  if out.verbose.tagset.toString() is "shop"
    article = out.verbose.article.toString()
    out.verbose.article = ["for " + article]
  out

statRange = ->
  out =
    max:
      updatedAt   : amplify.store("max_updatedAt")
      distance    : amplify.store("max_distance")
      votes_count : amplify.store("max_votes_count")
      price       : amplify.store("max_price")

    min:
      updatedAt   : amplify.store("min_updatedAt")
      distance    : amplify.store("min_distance")
      votes_count : amplify.store("min_votes_count")
      price       : amplify.store("min_price")

  out


Template.wrapper.rendered = ->
  Session.setDefault "rendered_wrapper", true

Template.wrapper.events {}=

  "click a[data-toggle-mode='sign-in']": (event, tmpl) ->

    speed = 300

    selector = $(event.currentTarget)
    rival  = $(".toggler-group.left")
    target = $(tmpl.find ".terrace")
    sign = $("#sign-in")

    selector.toggleClass "active"

    if selector.is(".active")
      rival.animate {}=
        opacity: 0
      , "fast"

      sign.show()
      target.slipShow {}=
        speed: speed
        haste: 1

    else
      target.slipHide {}=
        speed: speed
        haste: 1
      , ->
        sign.hide()

      rival.show()
      rival.animate {}=
        opacity: 1
      , "fast"


  "click a[data-toggle-mode='help']": (event, tmpl) ->
    Meteor.Help.set()

    # dhb = "data-help-block"
    # blocks = $("[#{dhb}]")
    # status = blocks.first().attr(dhb)
    # wrapper = $(tmpl.find(".wrapper"))
    # wrapperClasses = "help-mode clr-bg dark"
    # span = $(event.currentTarget).children("span")

    # if status is "true"
    #   blocks.attr(dhb, "false")
    #   blocks.removeAttr "help-active"
    #   wrapper.removeClass wrapperClasses
    #   span.text("help")

    # else
    #   blocks.attr(dhb, "true")
    #   wrapper.addClass wrapperClasses
    #   span.text("exit")

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

    # if help.style.display isnt "block"
    #   text()
    #   $(help).fadeIn 'fast'
    # else
    #   $(help).fadeOut 'fast', ->
    #     text(->
    #       $(help).fadeIn 'fast'
    #     )

  "mouseleave .help-mode [data-help-block='true']": (event, tmpl) ->
    help = tmpl.find("#help")
    $(help).fadeOut('fast')

  "click .shift": (event, tmpl) ->

    if checkHelpMode() then return
    if event.currentTarget.hasAttribute("disabled") then return

    dir     = event.currentTarget.getAttribute("data-shift-direction")
    area    = event.currentTarget.getAttribute("data-shift-area")
    page    = Meteor.Router.page()
    current = page.split("_")[0]

    store_area     = Store.get("page_" + area) or area
    store_sub_area = Store.get("page_" + store_area )

    sub_area       = store_sub_area or store_area

    # # console.log("DIR", dir)
    # console.log("AREA", area)
    # console.log("SUB AREA", sub_area)
    # # console.log("PAGE", page)
    # console.log("CURRENT", current)

    Session.set "shift_direction", dir
    Session.set "shift_area", area
    Session.set "shift_sub_area", sub_area
    Session.set "shift_current", current




#//////////////////////////////////////////////
#// $$ ceiling

slipElements = (opt) ->
  # $select = opt.selectEl
  # $target = opt.targetEl
  # $mode   = opt.modeEl
  # $rival  = opt.rivalEl

  # $select.toggleClass("active")

  # $speed = 300

  if $select.hasClass("active")
    $mode.show()
    $rival.fadeOut('fast')
    $target.slipShow {}=
      speed: $speed
      haste: 1

    $target.slipHide {}=
      speed: $speed
      haste: 1
      , ->
        $mode.hide()
        $rival.fadeIn('fast')


Template.ceiling.events {}=

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

    $(hide).slipHide {}=
      speed: speed
      haste: 1
      , ->
        $(show).slipShow {}=
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

          Accounts.createUser {}=
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
    Meteor.logout(->
      Store.clear()
    )

Template.ceiling.rendered = ->
  $(@findAll("[data-toggle='tooltip']")).tooltip()

#////////////////////////////////////////////
#  $$ content

Template.content.rendered = ->
  return if Meteor.Router.page() is "home"

  unless @activateLinks
    @activateLinks = =>
      # context = new Deps.Context()
      # context.onInvalidate @activateLinks
      # context.run =>
      Deps.autorun =>

        href = (link) ->
          if link
            '[href="/' + link.join('/') + '"]'

        page          = Meteor.Router.page()
        page_split    = page.split("_")
        page_area     = page_split.splice(0, 1)
        page_links    = page_split.splice(0, 2)
        page_sublinks = page_split
        show_sublinks = Store.get("show_#{page}")?.split("_")

        hrefs =
          href(page_links),
          href(page_sublinks),
          href(show_sublinks)
          ...

        format_hrefs = _.compact( hrefs ).toString()
        # console.log( "FORMAT HREFS", format_hrefs )

        $(@findAll("ul.links a, ul.sublinks a"))
          .removeClass( "active" )
          .addClass( "inactive" )
        .filter( format_hrefs )
          .removeClass("inactive")
          .addClass("active")

        if page_area isnt "account"
          if not $(@find("[data-validate]")).is(":focus")
            if not @page_sublinks is page_sublinks.toString()
              @page_sublinks = page_sublinks.toString()
              # console.log("activated links and sublinks")

              $(@findAll("[data-validate]")).jqBootstrapValidation()


  @activateLinks()


Template.content.events {}=

  'click .links a': (event, tmpl) ->
    href = event.currentTarget.getAttribute "href"
    area = href.slice(1).split("/")
    Store.set "page_#{area[0]}", area.join("_")

  'click .sublinks a': (event, tmpl) ->
    tar  = $(event.currentTarget)
    type = tar.attr "data-type"

    if type is "show"
      event.preventDefault()

    href = tar.attr "href"
    area = href.slice(1).split("/")
    Store.set "#{type}_#{area[0]}_#{area[1]}", area.join("_")

  'click .sublinks.account_offer a': (event, tmpl) ->
    Session.set "currentOffer", as()

  "click .sublinks.account_profile a.save": (event, tmpl) ->
    sub_area = Store.get "page_account_profile"

    unless sub_area
      Meteor.Alert.set {}=
        text: "An error occurred..."
      console.log("sub_area not defined...which area are we in?")
      return

    form = $(tmpl.find("form"))

    switch sub_area
      when "account_profile_edit"
        newEmail    = form.find("#email").val()
        newUsername = form.find("#username").val()

        if newEmail
          unless validateEmail(newEmail)
            Meteor.Alert.set {}=
              text: "Invalid email"
            return

        Meteor.call "updateUser", newEmail, newUsername, (err) ->
          if err
            Meteor.Alert.set text: err.reason

      when "account_profile_colors"
        Meteor.Alert.set text: "Profile successfully saved"

      when "account_profile_settings"
        adminCode = form.find("#admin")
        if adminCode.is(":disabled") is false
          Meteor.call "activateAdmin", adminCode.val(), (err) ->
            if err
              Meteor.Alert.set text: err.reason

        else
          Meteor.Alert.set text: "Profile saved successfully"




  "click .sublinks.account_offer a.save": (event, tmpl) ->
    Offer.create( Offer.storeGet() ).storeSet()


    # offer = as()
    # Session.set "currentOffer", offer
    # errors = []

    # for key of Offer._schema
    #   errors.push key if Offer._schema[key].hasOwnProperty("max") unless offer[key]

    # if errors.length
    #   Meteor.Alert.set
    #     text: "You didn't enter anything for your #{errors.join(", ")}."
    #   return

    # userOffer = App.Collection.Offers.findOne(owner: Meteor.userId())
    # type = (if userOffer then "update" else "insert")

    # Meteor.Alert.set
    #   text: "Loading..."
    #   wait: true

    # geo = new google.maps.Geocoder()
    # geo.geocode
    #   address: "#{offer.street} #{offer.city} #{offer.state} #{offer.zip}"
    # , (results, status) ->
    #   if status isnt "OK"
    #     Meteor.Alert.set
    #       text: "We couldn't seem to find your location. Did you enter your address correctly?"
    #   else

    #     geometry = _.values(results[0].geometry.location)
    #     offer.loc =
    #       lat: geometry[0]
    #       long: geometry[1]
    #     offer.updatedAt = Time.now()

    #     Meteor.call "editOffer", type, offer, (error) ->
    #       unless error
    #         Meteor.Alert.set
    #           text: "You're good to go!"
    #         return

    #       else
    #         Meteor.Alert.set
    #           text: error.reason
    #         return

  'click .accord header': (event, tmpl) ->
    if not $(event.target).hasClass "active"
      $(event.currentTarget).siblings().slideDown()
    else
      $(event.currentTarget).siblings().slideUp()
    $(event.target).toggleClass "active"


  'mouseenter [data-gray]': (e, t)->
    # console.log("mouseENTER")
    tar = $(e.currentTarget)
    t.find("[data-gray='true']")?.setAttribute("data-gray", false)
    tar.attr("data-gray", true)

  'click [data-gray]': (e, t)->
    Store.set "gray", e.currentTarget.getAttribute("class")


# 
# Template.content.preserve 'section.main'


colorFill = (el, selector, value) ->
  "#{el} { #{selector} : #{value} }"



#////////////////////////////////////////////
#  $$ home

class Conf
  constructor: (current)->

    @sort = {}
    if current.sort.verbose?.length
      @sort[current.sort.specifier] = {}
      @sort[current.sort.specifier][current.sort.selector] = current.sort.order
    else
      @sort_empty = true

    @query = {}
    if current.tagset?.length
      @query.tagset = current.tagset.toString()
      if current.tag?.length
        @query.tags = $in: current.tag

Template.home.helpers {}=
  getOffers: ->

    current = statCurrent()?.query
    myLoc = Store.get "user_loc"

    conf = new Conf(current)

    # console.log("QUERY SORT", conf)

    ranges =
      updatedAt   : []
      distance    : []
      votes_count : []
      price       : []

    notes =
      count: 0
      votes: 0

    # result = App.Collection.Offers.find(
    #   conf.query
    # ).map (d) ->


    result = App.Collection.Offers.find(
    ).fetch()

    # result = App.Collection.Offers.find(
    #   conf.query,
    #   conf.sort
    # ).map (d) ->

    #     # d.distance = Math.round(distance(myLoc.lat, myLoc.long, d.loc.lat, d.loc.long, "M") * 10) / 10
    #     # for r of ranges
    #     #   ranges[r].push d[r]

    #     # notes.count +=1
    #     # notes.votes += d.votes_count

    #     # if conf.sort_empty and d.rand
    #     #   d.shuffle = current.sort.order * d.rand
    #     #   d.shuffle = parseInt( d.shuffle.toString().slice(1,4) )

    #     d

    # console.log(ranges)

    # if result and myLoc

    #   watchOffer?.setCount(result.length)

    #   for r of ranges
    #     amplify.store "max_#{r}", _.max(ranges[r])
    #     amplify.store "min_#{r}", _.min(ranges[r])

    #   for n of notes
    #     notes[n] = numberWithCommas(notes[n])

    #   Store.set "notes", notes

    #   if conf.sort_empty
    #     return result = _.sortBy(result, "shuffle")
    #   else
    #     return result

    #   result

    result

  styleDate: (date) ->
    moment(date).fromNow()


#////////////////////////////////////////////
#  $$ intro

Template.intro.events {}=
  "click #getLocation": (event, tmpl) ->
    Meteor.Alert.set {}=
      text: "One moment while we charge the lasers..."
      wait: true

    noLocation = ->
      Meteor.Alert.set text: "Uh oh... something went wrong"

    foundLocation = (location) ->
      Meteor.Alert.set text: "Booya! Lasers charged!"

      Store.set "user_loc",
        lat: location.coords.latitude
        long: location.coords.longitude

    navigator.geolocation.getCurrentPosition foundLocation, noLocation

  'click .geolocate': (event, tmpl)->

    location = tmpl.find("input").value
    if not location
      Meteor.Alert.set text: "No location entered"
      return

    Meteor.Alert.set {}=
      text: "One moment..."
      wait: true

    geo = new google.maps.Geocoder()
    geo.geocode {}=
      address: location
    , (results, status) ->
      if status isnt "OK"
        Meteor.Alert.set text: "We couldn't seem to find your location. Did you enter your address correctly?"

      else
        Meteor.Alert.set text: "Found ya!"

        loc = results[0].geometry.location
        userLoc = []
        for key of loc
          if typeof loc[key] isnt 'number' then break
          userLoc.push loc[key]
        console.log("USERLOC", userLoc)

        Store.set "user_loc",
          lat: userLoc[0]
          long: userLoc[1]


Template.intro.rendered = ->
  window_height = $(".current").height() / 2
  intro = $(@find("#intro"))
  intro_height = (intro.outerHeight() * 0.75)
  intro.css {}=
    'margin-top': window_height - intro_height
