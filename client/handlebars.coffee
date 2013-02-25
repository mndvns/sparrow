
Handlebars.registerHelper "styleDate", (date) ->
  if date
    moment(date).fromNow()
  else
    moment().fromNow()

Handlebars.registerHelper "getStore", (a) ->
  if Meteor.BrowserStore.get a
    return Store.get a

Handlebars.registerHelper "storeEquals", (a, b) ->
  # console.log(a)
  return true if Store.get(a) is b

# {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
Handlebars.registerHelper "key_value", (obj, fn) ->
  buffer = ""
  key = undefined
  for key of obj
    if obj.hasOwnProperty(key)
      buffer += fn(
        key: key
        value: obj[key]
      )
  buffer


# {{#each_with_key container key="myKey"}}...{{/each_with_key}}
Handlebars.registerHelper "each_with_key", (obj, fn) ->
  context = undefined
  buffer = ""
  key = undefined
  keyName = fn.hash.key
  for key of obj
    if obj.hasOwnProperty(key)
      context = obj[key]
      context[keyName] = key  if keyName
      buffer += fn(context)
  buffer
Handlebars.registerHelper "equal", (a,b) ->
  return true if a is b
  return false

Handlebars.registerHelper "dropDecimal", (a) ->
  a?.toString().split(".")[0]

Handlebars.registerHelper "gray", (a) ->
  Store.get("gray") is a

Handlebars.registerHelper "el", (el, content) ->
  result = "<#{el}>#{content}</#{el}>"
  new Handlebars.SafeString result

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

Handlebars.registerHelper "page_next", (area) ->
  shift_sub_area = Session.get("shift_sub_area")
  if area isnt shift_sub_area then return false

  parse_sub_area = shift_sub_area.split("_").join("/")
  # console.log("PARSE SUB AREA", parse_sub_area)
  Meteor.Transitioner.setOptions after: ->
    Meteor.Router.to (if shift_sub_area is "home" then "/" else "/" + parse_sub_area)
    Session.set "shift_sub_area", null

  return shift_sub_area

Handlebars.registerHelper "sublink", (page, link) ->
  store_page = Store.get("page_#{page}")
  if store_page is (page + "_" + link)
    return page + "/" + link
    console.log(page + "/" + link)

Handlebars.registerHelper "next_page", ->
  shift_sub_area = Session.get("shift_sub_area")
  unless shift_sub_area then return

  parse_sub_area = shift_sub_area.split("_").join("/")

  Meteor.Transitioner.setOptions after: ->
    Meteor.Router.to (if shift_sub_area is "home" then "/" else "/" + parse_sub_area)
    Session.set "shift_sub_area", null

  Template[shift_sub_area]()

Handlebars.registerHelper "show_block", (template_name) ->

  sub_area = Session.get("shift_sub_area")
  page     = Meteor.Router.page()

  switch template_name
    when sub_area
      show  = Store.get("show_#{sub_area}")
    when page
      show  = Store.get("show_#{page}")

  # console.log(sub_area, page, show)

  Template?[show]?()

# Handlebars.registerHelper "validate_fields", (template_name) ->
#   console.log "RANG IT"
# 
#   $("[data-validate]")
#     .jqBootstrapValidation()

Handlebars.registerHelper "textareaRows", (id)->
  el = document.getElementById(id)
  $el = $(el)

  if el and $el.length
    line_height = parseInt($el.css("line-height"))
    height      = el?.scrollHeight

    return Math.floor(height / line_height)

Handlebars.registerHelper "numberWithCommas", (number)->
  return numberWithCommas(number)
