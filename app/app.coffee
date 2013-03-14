

# Meteor.absoluteUrl
#   replaceHost: true
#   rootUrl: "http://localhost:3000"

# Meteor.absoluteUrl
#   replaceHost: true
#   rootUrl: "http://deffenbaugh.herokuapp.com"

App.Collection =

  Tests    : new Meteor.Collection "tests"

  Images   : new Meteor.Collection "images"
  Users    : new Meteor.Collection "userData"

  Tagsets  : new Meteor.Collection "tagsets"
  Sorts    : new Meteor.Collection "sorts"

  Messages : new Meteor.Collection "messages"
  Alerts   : new Meteor.Collection "alerts"

String::toProperCase = ->
  @replace /\w\S*/g, (txt) ->
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

numberWithCommas = (x)->
  x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

Color = net.brehaut.Color

Time =
  now: ->
    Date.now()
  addMinutes: (time, min) ->
    moment(time).add('minutes', min).unix() * 1000

class Stopwatch
  constructor: (name)->
    window[name] = this
    @countKeeper = 1
    @start = Time.now()

  click: =>
    @start = Time.now()
    @clicked  = true

  stop: =>
    switch @clicked
      when false
        console.log("    redundant...")
        @clicked = null
      when null
        return
      when true
        switch @countKeeper
          when @count
            stopValue = numberWithCommas( Time.now() - @start ) + " milliseconds"
            console.log(stopValue, " for ", @count, " items")
            @clicked = false
          else
            @countKeeper += 1

  setCount: (count) =>
    @count = count
    @countKeeper = 1

My =
  user:  ->
    Meteor.user() or @user()

  userId:  ->
    if Meteor.isServer
      return Meteor.userId()
    if Meteor.isClient
      return Meteor.userId()

  offer: ->
    App.Collection.Offers.findOne(
      ownerId: Meteor.userId() or @userId
    )

  offerId: ->
    if Meteor.isServer
      return App.Collection.Offers.findOne(
        ownerId: @userId
      )?._id

    if Meteor.isClient
      return App.Collection.Offers.findOne(
        ownerId: Meteor.userId()
      )?._id

  loc: ->
    if Meteor.isClient
      return Store.get("user_loc")

  alert: ->
    App.Collection.Alerts.findOne(
      ownerId: @userId()
    )?._id


Meteor.methods

  getRandomOffer: (cb) ->
    offers = App.Collection.Offers.find({}).fetch()
    offer = offers[_.random(0, offers?.length)]

  insertTag: (obj) ->
    names = Tags.find().map (m) ->
      m.name
    if _.contains( names, obj.name )
      throw new Meteor.Error 500, "A tag with that name has already been made"
    else
      Tags.insert obj


  pushStintTags: (userLoc, tagSelection) ->
    if not tagSelection
      tagSelection = Meteor.user()?.stint?.tag_selection

    query = []
    stintTags = []

    Tagsets.find().map (d) ->
      tagset =
        name: d.name
        active: false
        tags: []
        ratio: 0

      tagset.active = true if _.find(tagSelection?.tagset, (t)-> t.name is d?.name)
      query.push tagset


    Tags.find().map (d)->
      dist = [1]

      for inv in d.involves
        if inv and inv.loc
          miles = distance(inv.loc.lat, inv.loc.long, userLoc.lat, userLoc.long)
          if miles < 3100
            dist.push miles

      ratio = _.reduce dist, (memo, num)->
        memo + (num / (num^2 + (memo / dist?.length)))

      d.ratio = (Math.round(ratio * 10)/100)
      d.rate = Math.round( Meteor.user()?.karma / d.ratio)

      tagset = _.find query, (r)->
        r.name is d.tagset

      d.active = true if  _.contains( _.pluck( tagSelection?.tags, "name"), d.name)
      tagset.ratio = (Math.round(tagset.ratio + (d.ratio / 2)*100)/100)

      tagset.tags.push d
      stintTags.push d

    if Meteor.isServer
       Meteor.users.update _id: @userId,
        $set:
          stint:
            tags: stintTags
            tag_selection: tagSelection

    query

  getColors: () ->
    @.unblock()
    this.user().colors

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

type = (obj) ->
  if obj == undefined or obj == null
    return String obj
  classToType = new Object
  for name in "Boolean Number String Function Array Date RegExp".split(" ")
    classToType["[object " + name + "]"] = name.toLowerCase()
  myClass = Object.prototype.toString.call obj
  if myClass of classToType
    return classToType[myClass]
  return "object"
