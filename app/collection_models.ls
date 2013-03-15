derp =
  asd: 123
  qwe: 9897

console.log keys derp
console.log "ASD"

do ->

  class Model
    attributes : {}
    id : void

    (attributes = {}) ->

      if attributes._id
        @attributes = @demongoize(attributes)
        @id = attributes._id
      else
        defaults = {}

        for key in @_keys
          defaults[key] = null

        for lock of @@_locks
          defaults[lock] = @@_locks[lock]()

        @attributes = _.defaults attributes, defaults

      console.log "ATTR", @attributes

    alert: (text) ->
      if Meteor.isServer
        console.log(text)
        new Alert text: text

      if Meteor.isClient
        Meteor.Alert.set text: text


    isPersisted: -> @id?

    setDefaults: ->
      for key of @@_keys
        @attributes[key] ?= @@@_schema[key].default
      this

    authorize: ->
      if @attributes.ownerId isnt My.userId()
        throw Error "User not authorized"

    validate: ->
      attr = @attributes

      if attr.ownerId and ( attr.ownerId isnt My.userId() )
        throw Error "User identification error"


      if not @isPersisted()
        if (@@@_limit - @@@mine().count() <= 0)
          throw Error "Collection at limit"

      for key in @@_keys

        err  = [ "#{@@@name}'s", key, "field" ]

        sk  = @@@_schema[key]
        ak  = attr[key]

        sk_type = type sk.default
        ak_type = type ak

        max   = sk.max
        min   = sk.min

        if not ak and sk.required
          err.push "have only"

        else if sk_type isnt ak_type
          err.push "contain only"

        else if (min or max)

          size  = _.size(ak)

          switch max is min
            when true
              if min isnt size
                err.push "have exactly #{min}"
              else
                continue

            when false
              if max < size
                err.push "have less than #{max}"
              else if min >= size
                err.push "have more than #{min}"
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

    set: ( first, rest )->
      @attributes[first] = rest

    unset: (attributes)->
      @attributes = _.omit(@attributes, attributes)

    save: (cb) ->

      # if Store?.get("test_log_object") is "true"
      #   console.log("LOG_OBJECT", @attributes)

      Meteor.call "instance_save", @@name, @, (err, res) ~>
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
        @@@_collection.remove @id
        @id = null

      @storeClear()

      cb?(null, this)
      return this

    storeSet: ->
      extend = _.extend( @attributes, {_id: @id} )
      Store?.set "instance_#{@@@_type?.toLowerCase()}", extend

    storeClear: ->
      Store?.set "instance_#{@@_type?.toLowerCase()}", null

    mongoize: (attributes) ->
      taken = {}
      for name, value of attributes
        if name.match(/^_/) then continue
        taken[name] = value
      taken

    demongoize: (attributes) ->
      taken = {}
      for name, value of attributes
        if name.match(/^_/) then continue
        taken[name] = value
      taken

    @_schema     = {}
    @_collection = void
    @_type       = void
    @_limit      = void

    @new = (attributes) ->
      out = new @(attributes)
      # console.log "OUT", out
      out

    @storeGet = ->
      Store?.get "instance_#{ @name }"

    @create = (attributes) ->
      @new(attributes).save()

    @where = (selector = {}, options = {}) ->
      @_collection?.find(selector, options)

    @mine = (selector = {}, options = {}) ->
      @where( _.extend(selector, ownerId: Meteor.userId()), options)

    @all = (selector = {}, options = {}) ->
      @_collection?.find(selector, options)

    @toArray = (selector = {}, options = {}) ->
      for attributes in @where(selector, options).fetch()
        # eval is ok, because _type is never entered by user
        new(eval(attributes._type) ? @)(attributes)

    @destroyMine = ->
      Meteor.call "instance_destroy_mine", @_collection._name.toProperCase()



  Locations = new Meteor.Collection 'locations',
    transform: (doc)->
      console.log(doc)
      doc.derp = "ASD"
      doc

  class Location extends Model
    ->
      @_type = "Location"
      @_collection = Locations
      @_locks =
        ownerId : ->
          My.userId()
        offerId : ->
          My.offerId()
      @_schema =
        geo:
          default: [ 47, -122 ]
          max: 2
          min: 2
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
          max: 5
          min: 5
      @_limit = 20
      super!


    gmap : ->
      geo = new google.maps.Geocoder()
      geo.geocode params

      params =
        address: "#{@street} #{@city} #{@state} #{@zip}"
        (results, status) ~>
          if status isnt "OK"
            console.log "We couldn't seem to find your location. Did you enter your address correctly?"

    @plot = ->
      @all().map (d)->
        myLoc = My.loc()
        d.distance =
          Math.round(
            distance(
              myLoc.lat, myLoc.long, d.geo[0], d.geo[1], "M"
            ) * 10
          ) / 10
        d




  Tags = new Meteor.Collection 'tags'
  class Tag extends Model
    @_type = "Tag"
    @_collection = Tags
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

  Offers = new Meteor.Collection 'offers'
  class Offer extends Model
    (attr) ->
      _type : "Offer"
      _collection : Offers
      _limit : 1
      _locks :
        ownerId: ->
          My.userId()
        updatedAt: ->
          Time.now()
      _schema :
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
        image:
          default: "http://i.imgur.com/YhUFTyA.jpg"
        name:
          default: "Offer"
          required: true
          max: 15
          min: 3
        price:
          default: "10"
          required: true
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

      super attr

  @loadStore = ->
    unless @handle
      @handle = Meteor.autorun ~>
        # if Session.get("subscribe_ready") is true
        #   if @storeGet()
        #     return
        #   else if @mine().count()
        #     @new( My.offer() ).storeSet()
        #   else
        #     @new().setDefaults().storeSet()


  App.Model = {}
  App.Collection =

    Tests    : new Meteor.Collection "tests"

    Images   : new Meteor.Collection "images"
    Users    : new Meteor.Collection "userData"

    Tagsets  : new Meteor.Collection "tagsets"
    Sorts    : new Meteor.Collection "sorts"

    Messages : new Meteor.Collection "messages"
    Alerts   : new Meteor.Collection "alerts"



  grouping = [
    "Location"
    "Offer"
    "Tag"
  ]


  for g in grouping
    m = App.Model[g]            = eval(g)
    c = App.Collection[g + "s"] = eval(g + "s")

    if Meteor.isClient
      window[g]       = m
      window[g + "s"] = c

