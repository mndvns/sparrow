
do ->

  collect = -> My.env![&0?to-proper-case!] = new Meteor.Collection &0, transform: &1

  App.{}Util.characterize = ->
      unless it? then return false
      switch it
      | "string"  => "characters"
      | "array"   => "items"
      | "number"  => "number"
      | "object"  => "values"
      | "boolean" => "true or false"

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
        aval = a = parse-int a
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

    check-limit : -> if (not @is-persisted!) and (@@@_limit - @@@mine!count! <= 0) => @throw "Collection at limit"
    check-list  : -> for i in it then @check-field i
    check-all   : ->
      if @is-locked()?     => @ ..lock-set! ..lock-check!
      if @is-limited()?    => @ ..check-limit!
      if @is-structured()? => @ ..check-list keys filter (.required), @@@_schema

  Default =
    default-set   : -> for k, v of @@@_schema => @[k] = v.default
    default-null  : -> for k of @@@_schema    => unless @[k]? => @[k] = null

  Lock =
    lock-get    : -> @@@_locks[it]
    lock-set    : -> for k, v of @@@_locks  => @[k] = v!
    lock-check  : -> for l of @@@_locks     => unless @[l]?
      @throw "An error occured during the #{l} verification process"

  Storer =
    store-method  : -> Store?[&0] "instance_#{@@@display-name.to-lower-case!}", &1
    store-set     : -> @store-method "set", @
    store-clear   : -> @store-method "set", null
    store-get     : -> @store-method "get", null

  Point =
    point-recall  :                  --> App.Collection[it.to-proper-case!]find "ownerId": @owner-id .fetch!
    point-compact : ( list )         --> _.compact unique list
    point-strip   : ( field , list ) --> map (.[field]), list
    point-get     : ( field , list ) -->
      | field isnt list => @point-compact @point-strip field, @point-recall list
      | _               => @point-compact @point-recall list
    point-set     : ( field , list , attr = list ) --> @attr = @point-get field, list
    point-jam     : -> for p in @@@_points then @point-set p.field, p.list, p.attr

  Clone =
    clone-new     : -> @@@new _.omit @, (keys @_locks ..push "_id")
    clone-kill    : -> @@@_collection.remove that._id if @clone-find it
    clone-find    : (f) -> find (~> it[f] is @[f]), My[@@@_collection._name]?!




  class Model implements Point, Storer, Lock, Check, Default, Clone
    # id   : void

    -> _.extend @, it

    throw : -> throw new Error it
    alert : ->
      | Meteor.isServer => new Alert text: it
      | Meteor.isClient => Meteor.Alert.set text: it

    is-structured : -> @@@_schema?
    is-locked     : -> @@@_locks?
    is-limited    : -> @@@_limit?
    is-persisted  : -> @_id?

    set       : -> @[&0] = &1
    set-check : ->
      n = &
      if typeof! n.0 is "Arguments" => n = n.0

      switch typeof! n.0
      | "String"  => (@check-field n.0       ) and (@[n.0] = n.1                  ) and (out = {(n.0)   : n.1   }) # and n.2? out
      | "Array"   => (@check-field n.0[0]    ) and (@[n.0[0]] = n.0[1]            ) and (out = {(n.0[0]): n.0[1]}) # and n.1? out
      | "Object"  => (@check-list keys n.0[0]) and (for k, v of n.0[0] => @[k] = v) and (out = n.0               ) # and n.1? out
      | _         => @throw "Must pass string, array, or object"

      &[&.length - 1]? out
      out

    set-save  : ->
      | @is-persisted! => @set-check &, ~> @@@_collection.update @_id, $set: it
      | _              => @throw @@@name + " must save before set-saving"

    set-store : -> @ ..set &0, &1 ..store-set!

    update  : -> @extend it and @save!

    upsert  : ->
      | @is-persisted!  => @throw <- @@@_collection.update @_id, $set: _.omit @, "_id"
      | _               => @_id = @@@_collection.insert @

    save    : ->
      try @check-all!
      catch
        @alert e.message
        return

      @upsert!
      @alert "Successfully saved #{@@@name.to-lower-case!}"


    destroy: ->
      if @is-persisted!
        @@@_collection.remove @_id
        @_id = null

      @store-clear!

    @new          = ->  new @ it
    @create       = -> @new it .save!
    @new-default  = -> @new it ..default-set!
    @new-null     = -> @new it ..default-null!

    @where  = -> @_collection.find it
    @mine   = -> @where owner-id: My.user-id!

    @destroy-mine = -> Meteor.call "instance_destroy_mine", @_collection._name.to-proper-case!
    @store-get    = -> @new Store.get "instance_#{@display-name.to-lower-case!}"

    @serialize    = -> @new <| list-to-obj <| map (->[it.name, it.value]), $(it).serialize-array!



  collect 'locations', -> Location.new it ..set "distance", ..geo-plot!
  class Location extends Model
    @_collection = Locations
    @_limit = 20
    @_locks =
      owner-id: -> My.user-id!
      offer-id: -> My.offer-id!
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
        min: 5
      street :
        default : "200 Main Street"
        required: true
        max: 30
        min: 5
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
            it? @throw message
          else
            format = (values results[0].geometry.location)[0,1]
            @geo = format
            @ ..alert format ..save!
            it? null, format

    geo-plot: ->
      m = My.userLoc?! or {lat: 39, long: -94}
      g = @geo

      if g? => Math.round distance m.lat, m.long, g[0], g[1], "M" * 10 / 10



  collect 'tagsets', -> it = Tagset.new it
  class Tagset extends Model
    @_collection = Tagsets
    @_limit      = 5
    @_locks =
      collection: ~> "#{@display-name}s".to-lower-case!
    @_schema =
      name:
        default: "see"
      noun:
        default: "event"

    count-tags: -> Tag.where "tagset": @name .count!


  collect 'tags', -> Tag.new it
  class Tag extends Model
    @_collection = Tags
    @_limit = 20
    @_locks =
      owner-id   : -> My.user-id!
      offer-id   : -> My.offer-id!
      tagset    : -> My.tagset!
      collection: ~> "#{@display-name}s".to-lower-case!
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



  collect 'offers', -> Offer.new it ..point-jam! ..set-nearest!
  class Offer extends Model
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
      owner-id   : -> My.userId!
      updated-at : -> Time.now!
    @_schema =
      business:
        default: "your business/vendor name"
        required: true
        max: 30
        min: 3
      description:
        default: "
          This is a description of the offer. Since the offer name 
          must be very brief, this is the place to put any details you 
          want to include."
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
      published:
        default: false

    set-nearest     : -> 
      | @locations? => @nearest = minimum  [..distance for @locations]
      | _           => return

    @load-store = ->
      @handle ?= Meteor.autorun ~>
        if Session.get("subscribe_ready") is true
          switch
          | not Offer.store-get!    => return
          | @mine!count!            => My.offer! ..store-set!
          | _                       => @new! ..default-set! ..store-set!


  collect "pictures", -> Picture.new it
  class Picture extends Model
    @_collection = Pictures
    @_limit = 10
    @_locks  =
      owner-id : -> My.user-id!
      offer-id : -> My.offer-id!
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
        owner-id: @owner-id
        _id: $nin: [@_id]
      , $set: status: "inactive"
      , multi: true

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

    on-delete : (err, res)->
      | err => console.log("ERROR", err)
      | res => console.log("SUCCESS", res)
      @destroy!

  collect "votes", -> Vote.new it
  class Vote extends Model
    @_collection = Votes
    @_limit = 50
    @_locks =
      owner-id  : -> My.user-id!
      set-at    : -> Time.now!

    @cast   = ->
      window.o = @new { target-offer: it._id, target-user: it.owner-id }

      console.log o

      o ..lock-set! ..save!



  App.Model = {}
  App.Collection =

    Users    : new Meteor.Collection "userData"
    Sorts    : new Meteor.Collection "sorts"
    Messages : new Meteor.Collection "messages"
    Alerts   : new Meteor.Collection "alerts"


  for key, val of App.Collection
    My.env![key] = val

  has-model = <[ Location Offer Tag Tagset Picture Vote ]>

  for g in has-model
    m = App.Model[g]            = eval(g)
    c = App.Collection[g + "s"] = eval(g + "s")

    My.env![g]       = m
    My.env![g + "s"] = c


