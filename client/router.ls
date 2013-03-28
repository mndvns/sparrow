

A.Area =
  area : ->
    page = Meteor.Router.page().split("_")
    if @index
      [page[@index]]
    else
      page

  verify: ->
    _.intersection(@area(), arguments).length isnt 0

  has: (fields) ->
    @verify(fields)

  is: (field) ->
    @area().toString() is field

  at: (index) ->
    @index = index
    @

  get: ->
    @area()


Meteor.Router.add {}=
  "/": ->
    Session.set "shift_current", "home"
    "home"

  "/access/*": ->
    console.log("YOOOOOOOOO")
    url-params = {}
    do ->
      compare = void
      pl = /\+/g
      search = /([^&=]+)=?([^&]*)/g
      decode = (s) ->
        decodeURIComponent s.replace(pl, " ")

      query = window.location.search.substring(1)
      console.log "QUERY" query
      while compare = search.exec(query)
        url-params[decode(compare[1])] = decode(compare[2]) 

    console.log \PARAMS, url-params

    Meteor.call 'market_oauth', url-params.code, -> window.close()
    "account_earnings_dashboard"

  "/:area": (area) ->
    Session.set "shift_current", area
    store_page = Store.get("page_" + area)
    if store_page
      # console.log("RETURNING STORE_PAGE", store_page)
      return store_page
    area

  "/:area/:link": (area, link) ->
    Session.set "shift_current", area

    store_page = Store.get("page_" + area + "_" + link)
    if store_page
      return store_page

    area + "_" + link

  "/:area/:link/:sublink": (area, link, sublink) ->
    sub_area = area + "_" + link + "_" + sublink
    Session.set "shift_current", area

    if link is "collections"
      Store.set("nab", sublink.toProperCase())
      Store.set("nab_query", {})
      Store.set("nab_sort", {})

    # Store.set "page_#{area}", sub_area
    sub_area

  "/offer/:id": (id) ->
    Session.set "showThisOffer", Offers.findOne(business: id)
    Session.set "header", null
    "thisOffer"

  "/*": ->
    Session.set "shift_current", "home"
    "404"

Meteor.Router.filters {}=
  checkLoggedIn: (page) ->
    if Meteor.user()
      page
    else
      "home"

  checkAdmin: (page) ->
    user = Meteor.user()
    if user.type is "basic"
      page
    else
      "home"

Meteor.Router.filter "checkLoggedIn",
  only: ["account"]

Meteor.Router.filter "checkAdmin",
  only: ["/admin/users"]
