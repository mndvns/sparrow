
Meteor.Router.add
  "/": ->
    Session.set "shift_current", "home"
    "home"

  "/access/*": ->
    console.log("YOOOOOOOOO")
    urlParams = {}
    (->
      match = undefined
      pl = /\+/g
      search = /([^&=]+)=?([^&]*)/g
      decode = (s) ->
        decodeURIComponent s.replace(pl, " ")

      query = window.location.search.substring(1)
      urlParams[decode(match[1])] = decode(match[2])  while match = search.exec(query)
    )()

    console.log(urlParams)

    Meteor.call "stripeOauth", urlParams.code, ->
      window.close()

  "/:area": (area) ->
    Session.set "shift_current", area
    store_page = Store.get("page_" + area)
    if store_page
      # console.log("RETURNING STORE_PAGE", store_page)
      return store_page
    area

  "/:area/:link": (area, link) ->
    Session.set "shift_current", area

    if area is "admin"
      Store.set("nab", link.toProperCase())
      Store.set("nab_query", {})
      Store.set("nab_sort", {})

    store_page = Store.get("page_" + area + "_" + link)
    if store_page
      return store_page

    area + "_" + link

  "/:area/:link/:sublink": (area, link, sublink) ->
    sub_area = area + "_" + link + "_" + sublink
    Session.set "shift_current", area
    # Store.set "page_#{area}", sub_area
    sub_area

  "/offer/:id": (id) ->
    Session.set "showThisOffer", Offers.findOne(business: id)
    Session.set "header", null
    "thisOffer"

  "/*": ->
    Session.set "shift_current", "home"
    "404"

Meteor.Router.filters
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
