Users = new Meteor.Collection("userData")
Offers = new Meteor.Collection("offers")
Tags = new Meteor.Collection("tags")
Tagsets = new Meteor.Collection("tagsets")
Sorts = new Meteor.Collection("sorts")
Messages = new Meteor.Collection("messages")
Metrics = new Meteor.Collection("metrics")
Meteor.methods getRandomOffer: (cb) ->
  offers = Offers.find({}).fetch()
  offer = offers[_.random(0, offers.length)]
  console.log offer

String::toProperCase = ->
  @replace /\w\S*/g, (txt) ->
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()



# 
# Color = net.brehaut.Color;
Time = now: ->
  moment().unix() * 1000
