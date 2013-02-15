# Meteor.absoluteUrl
#   replaceHost: true
#   rootUrl: "http://localhost:3000"

Meteor.absoluteUrl
  replaceHost: true
  rootUrl: "http://deffenbaugh.herokuapp.com"

Users    = new Meteor.Collection "userData"
Offers   = new Meteor.Collection "offers"

Tags     = new Meteor.Collection "tags"
Tagsets  = new Meteor.Collection "tagsets"
Sorts    = new Meteor.Collection "sorts"

Messages = new Meteor.Collection "messages"

String::toProperCase = ->
  @replace /\w\S*/g, (txt) ->
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

numberWithCommas = (x)->
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

Color = net.brehaut.Color

Time =
  now: ->
    Date.now()
  setStart: ->
    console.log("START TIME")
    @start = @now()
  endStart: ->
    console.log("END TIME",  numberWithCommas(@now() - @start) + " milliseconds" )
  addMinutes: (time, min) ->
    moment(time).add('minutes', min).unix() * 1000

Meteor.methods

  getRandomOffer: (cb) ->
    offers = Offers.find({}).fetch()
    offer = offers[_.random(0, offers.length)]

  insertTag: (obj) ->
    names = Tags.find().map (m) ->
      m.name
    if _.contains( names, obj.name )
      throw new Meteor.Error 500, "A tag with that name has already been made"
    else
      Tags.insert obj

  aggregateTags: (userLoc, tagSelection) ->

    query = []
    stintTags = []

    Tags.find().map (d)->
      dist = [1]

      for inv of d.involves
        if inv and inv.loc
          miles = distance(inv.loc.lat, inv.loc.long, userLoc.lat, userLoc.long)
          if miles < 3100 then dist.push miles

      ratio = _.reduce dist, (memo, num)->
        memo + (num / (num^2 + (memo / dist.length)))

      d.ratio = (Math.round(ratio * 10)/100)
      d.rate = Math.round(Meteor.user()?.karma / d.ratio)

      tagset = _.find query, (r)->
        r.name is d?.tagset

      unless tagset
        tagset =
          name: d?.tagset
          active: false
          tags: []
          ratio: 0

        tagset.active = true if _.find(tagSelection?.tagset, (t)-> t.name is d?.tagset)
        query.push tagset

      d.active = true if  _.contains( _.pluck( tagSelection?.tags, "name"), d.name)
      tagset.ratio = (Math.round(tagset.ratio + (d.ratio / 2)*100)/100)

      tagset?.tags.push d
      stintTags.push d

    if Meteor.isServer
      Meteor.users.update _id: @userId,
        $set:
          stint:
            tags:
              stintTags

    query

  upvoteEvent: (offer) ->
    @unblock()
    Offers.update offer._id,
      $push:
        votes:
          user: @userId
          exp: Date.now()

    Meteor.users.update offer.owner,
      $inc:
        karma: 1

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

