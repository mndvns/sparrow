
chai.should()
expect = chai.expect

model    = undefined
instance = undefined

unless @load_tests
  @load_tests = ->

    if not @tests_rendered
      @handle = Meteor.setTimeout(=>
        console.log("DELAYED")
        @tests_rendered = true
        @load_tests()
      , 200 )
      return
    else
      Meteor.clearTimeout @handle

    model_check = ( model, instance, field ) ->

      # console.log "MODEL m", model
      # console.log "INSTANCE i", instance
      # console.log "FIELD f", field

      # window.m = model
      # window.i = instance
      # window.f = field

      model_field = model._schema[field]

      min = model_field.min
      max = model_field.max
      def = model_field.default

      correct_type = type def

      wrong_type_example = undefined

      switch correct_type
        when "string", "number"
          wrong_type_example = [1, 2, 3, 4, 5, 6]
        when "array", "object"
          wrong_type_example = "asd asd asd"

       adjust_type = (range, num) ->

        arr = arrayRepeat( "a", range + num )

        switch correct_type
          when "string"
            arr = arr.join("")
          when "number"
            arr = arr.length

        return arr

      describe "new", ->

        it "should be an object", ->
          instance.should.be.an("object")

        # it "should have valid ownerId", ->
        #   instance.get("ownerId").should.equal My.userId()

        # it "should not allow invalid locks", ->
        #   for l in model._locks
        #     instance.get(l.toString()).should.equal My[l]()

      describe "set", ->

        it "should set defaults", (done)->
          instance.defaultSet()
          try
            instance.checkAll()
          catch error
            throw Error(error)

          done()

        it "should set properties", ->
          instance.set field, "ASD"
          instance.get([field]).should.equal "ASD"

        it "should unset properties", (done)->
          instance.unset field
          unless instance.get([field]) then done()

        it "should set store on command", ->
          instance.storeSet()
          store = model.storeGet()
          store.should.be.an "object"

      describe "save", ->

        it "should not save with absent required properties", (done)->
          instance.unset field
          instance.save (err, res)->
            if err then done()

        it "should not save with wrong type properties", (done)->
          instance.set field, wrong_type_example
          instance.save (err, res)->
            if err then done()

        it "should not save with short properties", (done)->
          instance.set field, adjust_type( min, -1 )
          instance.save (err, res)->
            if err then done()

        it "should not save with long properties", (done)->
          instance.set field, adjust_type( max, 10 )
          instance.save (err, res)->
            if err then done()

        it "should not save alterations to owner", (done)->
          instance.set field, adjust_type( min, 0 )

          instance.set "ownerId", 123
          instance.save (err, res)->
            if err then done()

        it "should save if valid", (done)->
          instance.set "ownerId", Meteor.userId()
          instance.set field, def
          instance.save (err, res)->
            if res then done()

      describe "destroy", ->

        it "should not destroy with authorized owner", (done)->
          instance.set "ownerId", 123
          instance.destroy (err, res)->
            if err then done()

        it "should destroy with authorized owner", (done)->
          instance.set "ownerId", Meteor.userId()
          instance.destroy (err, res)->
            if res then done()

        it "should also destory store", (done)->
          unless model.storeGet() then done()

    model_clean = ( context, field, cb ) ->

      a           = App.Model
      model       = a[ context ]
      instance    = model.new()

      describe context, ->
        before ->
          a[ context ].destroyMine()
          a[ context ].new().storeClear()

        after ->
          a[ context ].new().storeClear()

        cb( model, instance, field )
        return


    describe "Location features", ->

      before ->
        o = Offer.new()
        o.defaultSet()
        o.save()

        model = App.Model.Location
        instance = model.new()
        instance.defaultSet()

      after ->
        Offer.destroyMine()
        Location.destroyMine()

      it "should have an offer", ->
        Offer.mine().count().should.equal(1)

      it "should have a valid street address", (done) ->
        instance.save (err, res) -> if res then done()

      it "should check address before saving", (done) ->
        done()
        instance.set "street", ""
        unless google?.maps?.Geocoder then done()
        instance.geoMap (err, res) -> if err then done()

      it "should set the coordinates if the request was successful", (done) ->
        done()
        unless google?.maps?.Geocoder then done()
        instance.geoMap (err, res) -> if res then done()

      it "should have valid offerId on save", ->
        instance.get("offerId").should.equal My.offerId()

    describe "Base Models", ->

      model_clean( "Offer", "business", model_check )
      return


    return

@load_tests()
