
App.Model      = {}

class App.Model.Model
  id         : undefined
  attributes : {}
  alert      : (text) ->
    if Meteor.isServer
      console.log(text)
      new Alert
        text: text
    if Meteor.isClient
      Meteor.Alert.set
        text: text

  constructor: (attributes = {}) ->

    if attributes._id
      @attributes = @demongoize(attributes)
      @id = attributes._id
    else
      defaults = {}
      for key in @keys()
        defaults[key] = null

      for lock in @locks()
        defaults[lock] = @constructor._locks[lock]()

      @attributes = _.defaults attributes, defaults

  isPersisted: -> @id?

  locks: ->
    _.keys @constructor._locks

  keys: ->
    _.keys @constructor._schema

  setDefaults: ->
    for key in @keys()
      @attributes[key] ?= @constructor._schema[key].default
    this

  authorize: ->
    if @attributes.ownerId isnt My.userId()
      throw Error "User not authorized"

  validate: ->
    cons = @constructor
    attr = @attributes

    if not @isPersisted()
      if (cons._limit - cons.mine().count() <= 0)
        throw Error "Collection at limit"

    for key in @keys()

      err  = [ "#{cons.name}'s", key, "must" ]

      sk  = cons._schema[key]
      ak  = attr[key]

      sk_type = type sk.default
      ak_type = type ak

      max   = sk.max
      min   = sk.min

      if not ak and sk.required
        err.push "contain"

      else if sk_type isnt ak_type
        err.push "contain only"

      else if (min or max)

        size  = _.size(ak)

        switch max is min
          when true
            if min isnt size
              err.push "exactly #{min}"
            else
              continue

          when false
            if max < size
              err.push "less than #{max}"
            else if min >= size
              err.push "more than #{min}"
            else
              continue

      else
        continue

      switch sk_type
        when "string"
          err.push "letters"
        when "object"
          err.push "properties"
        when "boolean"
          err.push "true or false"
        when "array"
          err.push "array items"

      throw Error err.join(" ")

  name: ->
    @constructor.name.toLowerCase()

  set: (attributes)->
    @attributes = _.extend(@attributes, attributes)

  unset: (attributes)->
    @attributes = _.omit(@attributes, attributes)

  save: (cb) ->

    # if Store?.get("test_log_object") is "true"
    #   console.log("LOG_OBJECT", @attributes)

    # console.log "COLLECT", @constructor._collection

    Meteor.call "instance_save", @constructor.name, @, (err, res) =>
      if err
        @alert err.reason
        cb?(err.reason)
      else
        @alert "Save successful"
        @id = res.id
        cb?(null, res)


  destroy: (cb)->
    try
      @authorize()
    catch error
      @alert error.message
      cb?(error.message)
      return this

    if @isPersisted()
      @constructor._collection.remove @id
      @id = null

    @storeClear()

    cb?(null, this)
    return this

  storeSet: ->
    extend = _.extend( @attributes, {_id: @id} )
    Store?.set "instance_#{@constructor._type.toLowerCase()}", extend

  storeClear: ->
    Store?.set "instance_#{@constructor._type.toLowerCase()}", null

  mongoize: (attributes) ->
    taken = {}
    for name, value of attributes
      continue if name.match(/^_/)
      taken[name] = value
    taken

  demongoize: (attributes) ->
    taken = {}
    for name, value of attributes
      continue if name.match(/^_/)
      taken[name] = value
    taken

  @_collection : undefined
  @_type       : undefined
  @_limit      : undefined
  @_locks      : {}
  @_schema     : {}

  @new: (attributes) ->
    new @(attributes)

  @storeGet: ->
    Store.get "instance_#{@_type.toLowerCase()}"

  @create: (attributes) ->
    @new(attributes).save()

  @where: (selector = {}, options = {}) ->
    @_collection.find(selector, options)

  @mine: (selector = {}, options = {}) ->
    @where( _.extend(selector, ownerId: Meteor.userId()), options)

  @all: (selector = {}, options = {}) ->
    @_collection.find(selector, options)

  @toArray: (selector = {}, options = {}) ->
    for attributes in @where(selector, options).fetch()
      # eval is ok, because _type is never entered by user
      new(eval(attributes._type) ? @)(attributes)

  @destroyAll: ->
    @_collection.remove ownerId: Meteor.userId()






App.Collection.Locations = new Meteor.Collection 'locations'
class App.Model.Location extends App.Model.Model
  @_type: "Location"
  @_collection: App.Collection.Locations
  @_locks =
    ownerId: ->
      My.userId()
    offerId: ->
      My.offerId()
  @_schema =
    geo:
      default: [ 47, -122 ]
      max: 2
      min: 2
    address:
      city:
        default: "Kansas City"
        max: 50
        min: 3
      street:
        default: "200 Main Street"
        max: 50
        min: 3
      state:
        default: "MO"
        max: 2
        min: 2
      zip:
        default: "64105"
        max: 6
        min: 6
  @_limit = 20

  @mapDistance: ->
    @all().map (d)->
      myLoc = My.loc()
      d.distance =
        Math.round(
          distance(
            myLoc.lat, myLoc.long, d.geo[0], d.geo[1], "M"
          ) * 10
        ) / 10
      d

App.Collection.Tags = new Meteor.Collection 'tags'
class App.Model.Tag extends App.Model.Model
  @_type: "Tag"
  @_collection: App.Collection.Tags
  @_limit = 20
  @_locks =
    ownerId: ->
      My.userId()
    offerId: ->
      My.offerId()
  @_schema =
    name:
      default: "tag"
      max: 20
      min: 2

App.Collection.Offers = new Meteor.Collection 'offers'
class App.Model.Offer extends App.Model.Model
  @_type: "Offer"
  @_collection: App.Collection.Offers
  @_limit = 1
  @_locks =
    ownerId: ->
      My.userId()
    updatedAt: ->
      Time.now()
  @_schema =
    business:
      default: "your business/vendor name"
      required: true
      max: 30
      min: 3
    description:
      default: "This is a description of the offer. Since the offer name must be very brief, this is the place to put any details you want to include."
      required: true
      max: 140
      min: 3
    name:
      default: "Offer"
      required: true
      max: 15
      min: 3
    price:
      default: "10"
      required: true
    image:
      default: "http://i.imgur.com/YhUFTyA.jpg"
    tags:
      default: ""
    tagset:
      default: ""
    votes_meta:
      default: []
    votes_count:
      default: 0
    published:
      default: false

  @loadStore: ->
    unless @handle
      @handle = Meteor.autorun =>
        if Session.get("subscribe_ready") is true
          if @storeGet()
            return
          else if @mine().count()
            @new( My.offer() ).storeSet()
          else
            @new().setDefaults().storeSet()

