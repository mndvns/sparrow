
A = App = Meteor.App = {}
log = (arg)->
  console.log(arg)

if Meteor.isServer
  require  = __meteor_bootstrap__.require
  path     = require "path"
  basepath = (path.resolve('.'))
#   # console.log path, basepath, "DIR"
#   # require('./prelude-ls/prelude.js').installPrelude(global)
#   # console.log "rightooooo"
