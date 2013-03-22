


do ->

  App.{}Util.characterize = ->
    if not it? then return false
    switch it
    | "string" => "letters"
    | "array"  => "items"
    | "number" => "number"
    | "object" => "values"
    | "boolean" => "true or false"

  Storer =
    store-method  : -> Store?[&0] "instance_#{@@@_type?.toLowerCase!}", &1
    store-set     : -> @store-method "set", _.extend( @attr, if @id then {_id: @id} )
    store-clear   : -> @store-method "set", null
    store-get     : -> @store-method "get", null

  Point =
    point-recall  : --> App.Collection[it.toProperCase!]find "ownerId": @attr."ownerId" .fetch!
    point-compact : ( list ) --> _.compact unique list
    point-strip   : ( field , list ) --> map (.[field]), list
    point-get : ( field, list ) -->
      | field isnt list => @point-compact @point-strip field, @point-recall list
      | _               => @point-compact @point-recall list
    point-set : ( field, list, attr = list ) --> @set attr, @point-get field, list
    point-jam : -> for p in @@@_points then @point-set p.field, p.list, p.attr

  Lock =
    lock-get    : -> @@@_locks[it]
    lock-set    : -> for k, v of @@@_locks then @set k, v!
    lock-check  : -> for l of @@@_locks then unless @get(l)?
      @throw "An error occured during the #{l} verification process"

  Default =
    default-set   : -> for k, v of @@@_schema => @set k, v.default
    default-null  : -> for k of @@@_schema    => @set k, null

  Check =
    check-field: ( f ) ->
      e = ~> @throw "#{@@@name}'s #{f} property " + it

      a = @attr[f]
      s = @@@_schema[f]

      switch
      | not s? => e "does not exist"
      | not a? => e "has not been set"

      at = type a
      st = type s.default
      c = -> App.Util.characterize it

      switch at
      | "boolean" => return
      | "number" =>
        aval = a
        verb = "be"
        char = numberWithCommas s.max
      | otherwise =>
        aval = length a
        verb = "have"
        char = s.max + " " + c st

      switch
      | at isnt st                      => e "must have #{c st}, not #{c at}"
      | s.min is s.max isnt aval        => e "must #{verb} exactly #{char}"
      | s.max < aval or aval < s.min    => e "must #{verb} between #{s.min} and #{char}"

      return "#{f} checked"

    check-lock  : -> @lock-check!
    check-list  : -> for i in it then @check-field i
    check-all   : ->

      @lock-set!
      @lock-check!

      @check-limit!
      @check-list keys filter (.required), @@@_schema

    check-limit : ->
      if (not @is-persisted!) and (@@@_limit - @@@mine!count! <= 0) then @throw "Collection at limit"



  class Model implements Point, Storer, Lock, Check, Default
    attr : {}
    id   : void

    (attr = {}) ->

      if attr._id
        @attr = @demongoize attr
        @id   = attr._id

      else
        @default-null!
        @lock-set!

    alert: (text) ->
      if Meteor.isServer
        console.log(text)
        new Alert text: text

      if Meteor.isClient
        Meteor.Alert.set text: text


    is-persisted: -> @id?

    set : ( key, val ) ->
      @attr[key] = val
      @

    unset     : -> @attr = _.omit @attr, it
    get       : -> @attr[it]

    save: -->
      try @check-all!
      catch
        @alert e.message
        switch
        | it? => it e.message
        | _   => return

      @alert "Successfully saved #{@@@name}"

      switch
      | @is-persisted!  => @@@_collection.update @id, $set: @attr
      | _               => @id = @@@_collection.insert @attr

      switch
      | it?   => it null, @attr
      | _     => return @attr

    destroy: ->
      if @is-persisted!
        @@@_collection.remove @id
        @id = null

      @store-clear!

      switch
      | it?   => it null, @
      | _     => return @

    mongoize: (attr = @attr) ->
      attr._id = @id
      @attr

    demongoize: (attr = @attr) ->
      taken = {}
      for name, value of attr
        if name.match(/^_/) then continue
        taken[name] = value
      taken

    throw : -> throw new Error it


    @new    = -> new @ it
    @create = -> @new it .save()

    @where  = (sel = {}, opt = {}) -> @_collection?.find sel, opt
    @all    = (sel = {}, opt = {}) -> @_collection?.find sel, opt
    @mine   = (sel = {}, opt = {}) -> @where _.extend sel, ownerId: My.userId!, opt

    @destroy-mine = -> Meteor.call "instance_destroy_mine", @_collection._name.to-proper-case!
    @store-get    = -> Store.get "instance_#{@_type.to-lower-case!}"


  Locations = new Meteor.Collection 'locations',
    transform: ->
      it = Location.new it ..set "distance", ..geo-plot!
      it .= mongoize!
      it

  class Location extends Model
    @_type = "Location"
    @_collection = Locations
    @_locks =
      ownerId: -> My.userId!
      offerId: -> My.offerId!
    @_schema =
      geo :
        default : [ 47, -122 ]
        required: true
        max: 2
        min: 2
      city :
        default : "Kansas City"
        required: true
        max: 30
        min: 0
      street :
        default : "200 Main Street"
        required: true
        max: 30
        min: 0
      state :
        default : "MO"
        required: true
        max: 2
        min: 2
      zip :
        default : "64105"
        required: true
        max: 5
        min: 5
    @_limit = 20

    geo-map : ->
      try
        @check-list ["city", "street", "state", "zip"]
      catch
        @alert e.message
        it? e.message
        return

      new google.maps.Geocoder?()
        .geocode address: "#{@attr.street} #{@attr.city} #{@attr.state} #{@attr.zip}",
        (results, status) ~>
          if status isnt "OK"
            message = "We couldn't seem to find your location. Did you enter your address correctly?"
            @alert message
            cb? @throw message
          else
            format = (values results[0].geometry.location)[0,1]
            @alert format
            @set "geo", format
            cb? null, format

    geo-plot: ->
      m = My.userLoc! or {lat: 39, long: -94}
      g = @get "geo"

      Math.round distance m.lat, m.long, g[0], g[1], "M" * 10 / 10


  Tags = new Meteor.Collection 'tags',
    transform: (doc) ->

      doc.collection = "tags"
      doc.tagset = "eat"

      # d = Tag.new doc ..rate!
      # d = d.demongoize!
      # console.log "DOC", d

      doc

  class Tag extends Model
    @_type = "Tag"
    @_collection = Tags
    @_limit = 20
    @_locks =
      ownerId: -> My.userId!
      offerId: -> My.offerId!
      collection: ~> (@_type + "s").to-lower-case!
    @_schema =
      name:
        default: "tag"
        required: true
        max: 20
        min: 2
      tagset:
        default: "eat"
        required: true
        max: 10
        min: 2

    @rate-all = ->
      list = @all!fetch!
      console.log "LIST", list

      out = {}
      for n in [..name for list]
        unless n? => continue
        out[n] ?= 0
        out[n] += 1

      lout = []
      for key, val of out
        o = find (.name is key), list
        o.rate = val
        lout.push o

      lout

    rate: -> @set 'rate', (@@@where name: @attr.name .count!)



  Offers = new Meteor.Collection 'offers',
    transform: ->
      it = Offer.new it ..point-jam! ..set-nearest!
      it .= mongoize!
      it

  class Offer extends Model
    @_type = "Offer"
    @_collection = Offers
    @_limit = 1
    @_points =
      * field : "name"
        list  : "tags"
        attr  : "tags"
      * field : "locations"
        list  : "locations"
        attr  : "locations"
    @_locks =
      ownerId: -> My.userId!
      updatedAt: -> Time.now!
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
      image:
        default: "http://i.imgur.com/YhUFTyA.jpg"
      locations:
        default: []
      name:
        default: "Offer"
        required: true
        max: 15
        min: 3
      price:
        default: 10
        required: true
        min: 3
        max: 2000
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


    nearest     : -> minimum [..distance for @get "locations"]
    set-nearest : -> @set "nearest", @nearest!

    @load-store = ->
      @handle ?= Meteor.autorun ~>
        if Session.get("subscribe_ready") is true
          switch
          | Offer.store-get()?      => return
          | @mine!count!            => @new My.offer! ..store-set!
          | _                       => @new! ..default-set! ..store-set!

  App.Model = {}
  App.Collection =

    Tests    : new Meteor.Collection "tests"

    Images   : new Meteor.Collection "images"
    Users    : new Meteor.Collection "userData"

    Tagsets  : new Meteor.Collection "tagsets"
    Sorts    : new Meteor.Collection "sorts"

    Messages : new Meteor.Collection "messages"
    Alerts   : new Meteor.Collection "alerts"

  for key, val of App.Collection
    global[key] = val

  hasModel = [
    "Location"
    "Offer"
    "Tag"
  ]

  for g in hasModel
    m = App.Model[g]            = eval(g)
    c = App.Collection[g + "s"] = eval(g + "s")

    if Meteor.isClient
      window[g]       = m
      window[g + "s"] = c

