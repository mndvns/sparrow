

A = App = Meteor.App = {}

log = -> console.log &

if Meteor.isServer
  require  = __meteor_bootstrap__.require
  path     = require "path"
  basepath = (path.resolve('.'))

EH = Event-horizon


String ::=

    to-proper-case : ->
      @replace /\w\S*/g , (txt) ->
        txt.char-at 0 .to-upper-case! + txt.substr 1 .to-lower-case!

    repeat : -> new Array( it + 1 ).join ""

array-repeat = (value, len) ->
  len +=1
  out = []
  while len -=1
    out.push(value)
  out




number-with-commas = (x)->
  x?.to-string!replace(/\B(?=(\d{3})+(?!\d))/g, ",")


