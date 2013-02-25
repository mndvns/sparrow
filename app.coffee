# Meteor.absoluteUrl
#   replaceHost: true
#   rootUrl: "http://localhost:3000"

# Meteor.absoluteUrl
#   replaceHost: true
#   rootUrl: "http://deffenbaugh.herokuapp.com"




Images   = new Meteor.Collection "images"
Users    = new Meteor.Collection "userData"
Offers   = new Meteor.Collection "offers"

Tags     = new Meteor.Collection "tags"
Tagsets  = new Meteor.Collection "tagsets"
Sorts    = new Meteor.Collection "sorts"

Messages = new Meteor.Collection "messages"
Alerts   = new Meteor.Collection "alerts"

String::toProperCase = ->
  @replace /\w\S*/g, (txt) ->
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

numberWithCommas = (x)->
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

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
    # console.log(@countKeeper, @count)
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




Meteor.methods

  getRandomOffer: (cb) ->
    offers = Offers.find({}).fetch()
    offer = offers[_.random(0, offers?.length)]

  insertTag: (obj) ->
    names = Tags.find().map (m) ->
      m.name
    if _.contains( names, obj.name )
      throw new Meteor.Error 500, "A tag with that name has already been made"
    else
      Tags.insert obj

  # aggregateOffers: ->
  #   Offers.aggregate
  #     $group:
  #       tagset.$


  aggregateStintTags: (userLoc, tagSelection) ->

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
      d.rate = Math.round(Meteor.user()?.karma / d.ratio)

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
            tags:
              stintTags

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

myOffer = ->
  Offers.findOne
    owner: Meteor.userId()

