
Meteor.Router.add
  "/": ->
    Session.set "shift_current", "home"
    "home"

  "/:area": (area) ->
    Session.set "shift_current", area
    area

  "/:area/:id": (area, id) ->
    Session.set "shift_current", area
    area + "_" + id

  # "/about": ->
  #   Meteor.Router.to "about/stuff")

  "/offer/:id": (id) ->
    Session.set "showThisOffer", Offers.findOne(business: id)
    Session.set "header", null
    "thisOffer"

  "/access/*": ->
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
    if urlParams.code and Session.get("callingServer") isnt true
      Session.set "callingServer", true
      Meteor.call "oauth", urlParams.code, ->
        console.log "Got to Router"
        Meteor.Router.to "/user/account/profile"

    else console.log urlParams  if urlParams.error

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

#   checkLoc: (page) ->
#     if not amplify.get("user.loc")
#       Meteor.Router.to "about"
#     else
#       page
# 
# Meteor.Router.filter "checkLoc"
#   except: ["about"]

Meteor.Router.filter "checkLoggedIn",
  only: ["account"]

Meteor.Router.filter "checkAdmin",
  only: ["/admin/users"]
