


do ->

  App.{}Util.characterize = ->
      unless it? then return false
      switch it
      | "string"  => "letters"
      | "array"   => "items"
      | "number"  => "number"
      | "object"  => "values"
      | "boolean" => "true or false"

  Storer =
    store-method  : -> Store?[&0] "instance_#{@@@_type?.toLowerCase!}", &1
    store-set     : -> @store-method "set", @
    store-clear   : -> @store-method "set", null
    store-get     : -> @store-method "get", null

  Point =
    point-recall  :                       --> App.Collection[it.to-proper-case!]find "ownerId": @ownerId .fetch!
    point-compact : ( list )              --> _.compact unique list
    point-strip   : ( field , list )      --> map (.[field]), list
    point-get     : ( field , list )      -->
      | field isnt list => @point-compact @point-strip field, @point-recall list
      | _               => @point-compact @point-recall list
    point-set     : ( field , list , attr = list ) --> @attr = @point-get field, list
    point-jam     : -> for p in @@@_points then @point-set p.field, p.list, p.attr

  Lock =
    lock-get    : -> @@@_locks[it]
    lock-set    : -> for k, v of @@@_locks  => @[k] = v!
    lock-check  : -> for l of @@@_locks     => unless @[l]?
      @throw "An error occured during the #{l} verification process"

  Default =
    default-set   : -> for k, v of @@@_schema => @[k] = v.default
    default-null  : -> for k of @@@_schema    => unless @[k]? => @[k] = null

  Check =
    check-field: ( f ) ->
      e = ~> @throw "#{@@@name}'s #{f} property " + it

      a = @[f]
      s = @@@_schema[f]

      switch
      | not s? => e "does not exist"
      | not a? => e "has not been set"

      st = type s.default
      c = -> App.Util.characterize it

      switch st
      | "boolean" => return
      | "number"  =>
        a    = parse-int a
        aval = a
        verb = "be"
        char = numberWithCommas s.max
      | otherwise =>
        aval = length a
        verb = "have"
        char = s.max + " " + c st

      at = type a

      switch
      | at isnt st                      => e "must have #{c st}, not #{c at}"
      | s.min is s.max isnt aval        => e "must #{verb} exactly #{char}"
      | s.max < aval or aval < s.min    => e "must #{verb} between #{s.min} and #{char}"

      return "#{f} checked"

    check-lock  : -> @lock-check!
    check-list  : -> for i in it then @check-field i
    check-all   : ->

      console.log \1
      @lock-set!
      console.log 2
      @lock-check!

      console.log \3
      @check-limit!
      console.log \4
      @check-list keys filter (.required), @@@_schema

    check-limit : ->
      if (not @is-persisted!) and (@@@_limit - @@@mine!count! <= 0) then @throw "Collection at limit"


  class Model implements Point, Storer, Lock, Check, Default
    id   : void

    -> _.extend @, it

    alert: (text) ->
      if Meteor.isServer
        console.log(text)
        new Alert text: text

      if Meteor.isClient
        Meteor.Alert.set text: text


    is-persisted: -> @_id?

    set : ( key, val ) ->
      @[key] = val
      @

    set-store : ->
      @[&0] = &1
      @store-set!
      @

    set-save  : ->
      unless @is-persisted! => @throw @@@name + " must save before set-saving"
      @[&0] = &1
      @check-field &0
      @@@_collection.update @_id, $set: (&0) : &1

    extend        : -> for k, v of it => @[k] = v
    update        : -> @extend it and @save!

    save: -->
      try @check-all!
      catch
        @alert e.message
        switch
        | it? => it e.message
        | _   => return

      @alert "Successfully saved #{@@@name}"

      switch
      | @is-persisted!  => @@@_collection.update @_id, $set: _.omit @, "_id"
      | _               => @_id = @@@_collection.insert @

      switch
      | it?   => it null, @
      | _     => return @

    destroy: ->
      if @is-persisted!
        @@@_collection.remove @_id
        @_id = null

      @store-clear!

      switch
      | it?   => it null, @
      | _     => return @

    throw         : -> throw new Error it

    clone-new     : -> @@@new _.omit @, (keys @_locks ..push "_id")
    clone-kill    : -> @@@_collection.remove that._id if @clone-find it
    clone-find    : (f) -> find (~> it[f] is @[f]), My[@@@_collection._name]?!

    @new          = ->  new @ it
    @create       = -> @new it .save!
    @new-default  = -> @new it ..default-set!
    @new-null     = -> @new it ..default-null!

    @where  = (sel = {}, opt = {}) -> @_collection?.find sel, opt
    @all    = (sel = {}, opt = {}) -> @_collection?.find sel, opt
    @mine   = (sel = {}, opt = {}) -> @where _.extend sel, ownerId: My.userId!

    @destroy-where  = -> @_collection.remove _.extend it, ownerId: My.userId!
    @destroy-mine   = -> Meteor.call "instance_destroy_mine", @_collection._name.to-proper-case!
    @store-get      = -> @new Store.get "instance_#{@_type.to-lower-case!}"



  Locations = new Meteor.Collection 'locations',
    transform: -> Location.new it ..set "distance", ..geo-plot!

  class Location extends Model
    @_type = "Location"
    @_collection = Locations
    @_limit = 20
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

    geo-map : ->
      try
        @check-list ["city", "street", "state", "zip"]
      catch
        @alert e.message
        it? e.message
        return

      new google.maps.Geocoder?()
        .geocode address: "#{@street} #{@city} #{@state} #{@zip}",
        (results, status) ~>
          if status isnt "OK"
            message = "We couldn't seem to find your location. Did you enter your address correctly?"
            @alert message
            cb? @throw message
          else
            format = (values results[0].geometry.location)[0,1]
            @alert format
            @geo = format
            cb? null, format

    geo-plot: ->
      m = My.userLoc?! or {lat: 39, long: -94}
      g = @geo

      if g? => Math.round distance m.lat, m.long, g[0], g[1], "M" * 10 / 10



  Tagsets = new Meteor.Collection 'tagsets',
    transform: -> it = Tagset.new it

  class Tagset extends Model
    @_type       = "Tagset"
    @_collection = Tagsets
    @_limit      = 5
    @_locks =
      collection: ~> (@_type + "s").to-lower-case!
    @_schema =
      name:
        default: "see"
      noun:
        default: "event"

    count-tags: -> Tag.where "tagset": @name .count!


  Tags = new Meteor.Collection 'tags', transform: -> it = Tag.new it
  # Tags.bind-template 'account_offer_tags'

  class Tag extends Model
    @_type = "Tag"
    @_collection = Tags
    @_limit = 20
    @_locks =
      ownerId   : -> My.userId!
      offerId   : -> My.offerId!
      tagset    : -> My.tagset!
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

    rate-it: -> @rate = (@@@where name: @name .count!)
    @rate-all = (it = {}) ->
      list = @where it .fetch!

      out = {}
      for n in [..name for list]
        unless n? => continue
        out[n] ?= 0
        out[n] += 1

      lout = []
      for key, val of out
        o = find (.name is key), list
          ..rate = val
        lout.push o

      lout



  Offers = new Meteor.Collection 'offers',
    transform: ->
      it = Offer.new it ..point-jam! ..set-nearest!
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
        required: true
        min: 2
        max: 20
      votes_meta:
        default: []
      votes_count:
        default: 0
      published:
        default: false


    set-nearest     : -> @nearest = minimum [..distance for @locations]

    @load-store = ->
      @handle ?= Meteor.autorun ~>
        if Session.get("subscribe_ready") is true
          switch
          | Offer.store-get()?      => return
          | @mine!count!            => My.offer! ..store-set!
          | _                       => @new! ..default-set! ..store-set!


  Pictures = new Meteor.Collection "pictures",
    transform: -> 
      it = Picture.new it
      it

  class Picture extends Model
    @_type = "Picture"
    @_collection = Pictures
    @_limit = 10
    @_locks  =
      ownerId : -> My.userId!
      offerId : -> My.offerId!
    @_schema =
      status:
        default: "active"
      imgur:
        default: false
      type:
        default: "jpg"
      src:
        default: "http://i.imgur.com/YhUFTyA.jpg"

    activate: ->
      Pictures.update {}=
        ownerId: @ownerId
        _id: $nin: [@_id]
      ,
        $set: status: "inactive"
      ,
        multi: true

      Pictures.update @_id,
        $set: status: "active"

    deactivate: ->
      @status = "deactivated"
      @alert "Image successfully removed"

    on-upload : (err, res)->
      if err
        console.log("ERROR", err)
        @update status: "failed"
      else
        console.log("SUCCESS", res)
        @update {}=
          status: "active"
          src: res.data.link
          imgur: true
          deletehash: res.data.deletehash

      # console.log "ATATTATATATWQEWEQEWQ", _.omit @, "src"

    on-delete : (err, res)->
      if err
        console.log("ERROR", err)
        @destoy!
      else
        console.log("SUCCESS", res)
        @destoy!



  App.Model = {}
  App.Collection =

    Tests    : new Meteor.Collection "tests"

    Users    : new Meteor.Collection "userData"

    Sorts    : new Meteor.Collection "sorts"

    Messages : new Meteor.Collection "messages"
    Alerts   : new Meteor.Collection "alerts"

  for key, val of App.Collection
    My.env![key] = val

  has-model =
    "Location"
    "Offer"
    "Tag"
    "Tagset"
    "Picture"
    ...

  for g in has-model
    m = App.Model[g]            = eval(g)
    c = App.Collection[g + "s"] = eval(g + "s")

    window?[g]       = m
    window?[g + "s"] = c

    global?[g]       = m
    global?[g + "s"] = c

