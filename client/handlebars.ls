do ->

  hh = Handlebars.registerHelper

  hh "styleDate", (date) ->
    if date
      moment(date).fromNow()
    else
      moment().fromNow()

  hh "my", ->
    My?[it]?!

  hh "if_my", (a, b)->
    My[a]()?[b]

  hh "my_tagset", ->
    My.tagset!

  hh "store_tagset", ->
    Offer.store-get!?[\tagset]

  hh "store_get", -> Store.get it

  hh "store-equals", (a, b) ->
    # console.log(a)
    return true if Store.get(a) is b

  hh "store-contains", (a, b) ->
    Store.get a |> _.contains _, b

  hh "store", (method, a, b = "")->
    Store[method](a, b)

  hh "session", (method, a, b = "")->
    Session[method](a, b)

  hh "is_customer", ->
    My.customer-id()?

  hh "count", (collection) ->
    window[collection]?.find!count!


  hh "pictures",  -> Pictures?.find!
  hh "tagsets",   -> Tagsets?.find!

  hh "tags_rated", -> Tag?.rate-all {"tagset": My.tagset! }

  hh "is_in", ( a, b ) ->
    | not b?            => false
    | find (is a), b    => true
    | _                 => false

  # {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
  hh "key_value", (obj, fn) ->
    buffer = ""
    key = void
    for key of obj
      if obj.hasOwnProperty(key)
        buffer += fn(
          key: key
          value: obj[key]
        )
    buffer


  # {{#each_with_key container key="myKey"}}...{{/each_with_key}}
  hh "each_with_key", (obj, fn) ->
    context = void
    buffer = ""
    key = void
    keyName = fn.hash.key
    for key of obj
      if obj.hasOwnProperty(key)
        context = obj[key]
        context[keyName] = key  if keyName
        buffer += fn(context)
    buffer

  hh "equal", (a,b) -> a is b

  hh "dropDecimal", (a) ->
    a?.toString().split(".")[0]

  hh "gray", (a) ->
    Store.get("gray") is a

  hh "el", (el, content) ->
    result = "<#{el}>#{content}</#{el}>"
    new Handlebars.SafeString result


  hh "page_next", (area) ->
    shift_sub_area = Session.get("shift_sub_area")
    if area isnt shift_sub_area then return false

    parse_sub_area = shift_sub_area.split("_").join("/")
    # console.log("PARSE SUB AREA", parse_sub_area)
    Meteor.Transitioner.setOptions after: ->
      Meteor.Router.to (if shift_sub_area is "home" then "/" else "/" + parse_sub_area)
      Session.set "shift_sub_area", null

    return shift_sub_area

  hh "sublink", (page, link) ->
    store_page = Store.get("page_#{page}")
    if store_page is (page + "_" + link)
      return page + "/" + link
      console.log(page + "/" + link)

  hh "next_page", ->
    shift_sub_area = Session.get("shift_sub_area")
    unless shift_sub_area then return

    parse_sub_area = shift_sub_area.split("_").join("/")

    Meteor.Transitioner.setOptions after: ->
      Meteor.Router.to (if shift_sub_area is "home" then "/" else "/" + parse_sub_area)
      Session.set "shift_sub_area", null

    Template[shift_sub_area]()

  hh "show_block", (template_name) ->

    sub_area = Session.get("shift_sub_area")
    page     = Meteor.Router.page()

    switch template_name
      when sub_area
        show  = Store.get("show_#{sub_area}")
      when page
        show  = Store.get("show_#{page}")

    # console.log(sub_area, page, show)

    Template?[show]?()

  hh "textareaRows", (id)->
    el = document.getElementById(id)
    $el = $(el)

    if el and $el.length
      line_height = parseInt($el.css("line-height"))
      height      = el?.scrollHeight

      return Math.floor(height / line_height)

  hh "numberWithCommas", (number)->
    return numberWithCommas(number)

  hh "json", (context) ->
    clean = _.omit(context, "_id")
    JSON.stringify(clean, null, '\t')

  hh "key_count", (context, add) ->
    Object.keys(context).length + add

  hh "area", (method, field, index) ->
    if not index
      return App.Area[method](field)
    else
      return App.Area.at(index)[method](field)

