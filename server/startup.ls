

#                                                    //
#         _____ __             __                    //
#        / ___// /_____ ______/ /___  ______         //
#        \__ \/ __/ __ `/ ___/ __/ / / / __ \        //
#       ___/ / /_/ /_/ / /  / /_/ /_/ / /_/ /        //
#      /____/\__/\__,_/_/   \__/\__,_/ .___/         //
#                                   /_/              //
#                                                    //

Meteor.startup ->
  i = 0
  j = [
    " ", " ", "   ____", "  / __/___  ___ _ ____ ____ ___  _    __",
    " _\\ \\ / _ \\/ _ `// __// __// _ \\| |/|/ /",
    "/___// .__/\\_,_//_/  /_/   \\___/|__,__/ ", "    /_/", " ", " "]
  while i < j.length
    console.log "         ", j[i]
    i += 1

  # path = require 'path'
  # base = path.resolve '.'
  # isBundle = path.existsSync( base + '/bundle' )
  # modulePath = base + (isBundle ? '/bundle/static' : '/public') + '/node_modules'

  Locations._ensureIndex geo: "2d"


  # old aggregation stuff
  # App.Collection.Tags.aggregate = (pipline) ->
  #   self = this
  #   future = new Future()
  #   self.find()._mongo.db.createCollection self._name, (err, collection) ->

  #     if err
  #       future.throw err
  #       return

  #     collection.aggregate pipline, (err, result) ->
  #       if err
  #         future.throw err
  #         return
  #       future.ret [true, result]

  #   result = future.wait()
  #   throw result[1]  unless result[0]
  #   result[1]

  # App.Collection.Offers.runCommand = (pipeline) ->
  #   self = this
  #   future = new Future()
  #   self.find()._mongo.db.createCollection self._name, (err, collection) ->
  #     if err
  #       future.throw err
  #       return

  #     collection.runCommand pipeline, (err, results) ->
  #       if err
  #         future.throw err
  #         return
  #       future.ret [true, result]

  #   result = future.wait()
  #   throw result[1] unless result[0]
  #   result[1]


