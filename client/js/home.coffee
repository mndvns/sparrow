
#////////////////////////////////////////////
#  $$  globals and locals

distance = (lat1, lon1, lat2, lon2, unit) ->
  radlat1 = Math.PI * lat1 / 180
  radlat2 = Math.PI * lat2 / 180
  radlon1 = Math.PI * lon1 / 180
  radlon2 = Math.PI * lon2 / 180
  theta = lon1 - lon2
  radtheta = Math.PI * theta / 180
  dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  dist = dist * 1.609344  if unit is "K"
  dist = dist * 0.8684  if unit is "N"
  dist
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
  return false  if area isnt Session.get("shift_area")
  Meteor.Transitioner.setOptions after: ->
    Meteor.Router.to (if area is "home" then "/" else "/" + area)
    Session.set "shift_current", area

  area


#////////////////////////////////////////////
#  $$ body
Template.body.events
  "click .shift i": (event, tmpl) ->
    dir = event.target.parentElement.getAttribute("data-shift-direction")
    area = event.target.parentElement.getAttribute("data-shift-area")
    page = Meteor.Router.page()
    current = _.first(page.split("_"))
    Session.set "shift_direction", dir
    Session.set "shift_area", area
    Session.set "shift_current", current

  "click [data-modal]": (event, tmpl) ->
    Session.set "show_modal", true
    Session.set "modal", event.currentTarget.getAttribute("data-modal")

  # "mouseover .logout": (event, tmpl) ->
  #   $(event.currentTarget).fadeOut()
  #   $(event.currentTarget).find(".hover").fadeIn()

  # "mouseleave .logout": (event, tmpl) ->
  #   $(event.currentTarget).fadeIn()
  #   $(event.currentTarget).find(".hover").fadeOut()

  "click .logout": (event, tmpl) ->
    Meteor.logout()



colorFill = (el, selector, value) ->
  "#{el} { #{selector} : #{value} }"

Handlebars.registerHelper "renderThemeColors", (user, selector) ->

  if user and user.colors
    color = user.colors

    themeColors = _.find document.styleSheets, (d) ->
      d.title is "dynamic-theme"

    for rule in themeColors.rules
      themeColors.removeRule()


    themeColors.insertRule( colorFill ".clr-text.prime", "color", color.prime.light )
    themeColors.insertRule( colorFill ".clr-text.prime:hover", "color", color.prime.medium )
    themeColors.insertRule( colorFill ".clr-text.prime:active", "color", color.prime.dark )
    themeColors.insertRule( colorFill ".clr-text.prime.active", "color", color.prime.medium )

    themeColors.insertRule( colorFill ".clr-text.desat", "color", color.prime.light )
    themeColors.insertRule( colorFill ".clr-text.desat:hover", "color", color.prime.medium )
    themeColors.insertRule( colorFill ".clr-text.desat:active", "color", color.prime.dark )

    themeColors.insertRule( colorFill ".clr-bg", "background", color.prime.light )
    themeColors.insertRule( colorFill ".clr-bg:hover", "background", color.prime.medium)
    themeColors.insertRule( colorFill ".clr-bg:active", "background", color.prime.dark )

    return


#////////////////////////////////////////////
#  $$ modal
Template.modal.events
  "click button[type=\"submit\"]": (event, tmpl) ->
    event.preventDefault()
    username = tmpl.find("input#username").value
    password = tmpl.find("input#password").value
    console.log username, password
    handleResponse = (err, res) ->
      if err
        $(tmpl.find(".alert")).text(err.reason).addClass "alert-error in"
      else
        Session.set "show_modal", false
        Meteor.setTimeout (->
          Session.set "modal", null
        ), 1000

    if $(event.currentTarget).hasClass("create-account")
      Accounts.createUser
        username: username
        password: password
      , (err) ->
        handleResponse err, "Account made."

    else
      Meteor.loginWithPassword username, password, (err) ->
        handleResponse err, "You've logged in."


  "click button[data-navigate]": (event, tmpl) ->
    Session.set "modal", event.currentTarget.getAttribute("data-navigate")

  "click button.close": (event, tmpl) ->
    Session.set "show_modal", false

  "click .modal-backdrop": (event, tmpl) ->
    Session.set "show_modal", false

  "keydown input": (event, tmpl) ->
    $(tmpl.find("button[type='submit']")).trigger "click"  if event.keyCode is 13

Template.modal.helpers show_modal: (opt) ->
  if Session.get("show_modal")
    class_fade: "in"
    class_hide: ""
    hidden: false
  else
    class_fade: ""
    class_hide: "hide"
    hidden: true


#////////////////////////////////////////////
#  $$ home

Template.home.helpers
  getOffers: ->
    query = {}
    sort = {}
    current = statCurrent().query
    for key of current
      if current.hasOwnProperty(key)
        sort[current[key].selector] = current[key].order  if key is "sort"
        if current[key] and current[key].length
          query.tags = $in: current[key]  if key is "tag"
          query[key] = $in: current[key]  if key is "tagset"
    result = Offers.find(query,
      sort: sort
    ).fetch()
    myLoc = amplify.get("user.loc")
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

Template.intro.events "click button": (event, tmpl) ->
  getLocation()

Template.intro.rendered = ->
  $(@find("h1.fittext")).fitText .6
