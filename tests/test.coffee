
chai.should()
expect = chai.expect

model    = undefined
instance = undefined

unless @load_tests
  @load_tests = ->

    if not App?.Area and not @tests_rendered
      @handle = Meteor.setTimeout(=>
        console.log("DELAYED")
        @tests_rendered = true
        @load_tests()
      , 200 )
      return
    else
      Meteor.clearTimeout @handle





    model_check = ( model, instance, field ) ->

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

        it "should be object", ->
          instance.should.be.an("object")

      describe "set", ->

        it "should set defaults", (done)->
          instance.setDefaults()
          try
            instance.validate()
          catch error
            throw Error(error)

          done()

        it "should set properties", ->
          instance.set field, "ASD"
          instance.attributes[field].should.equal "ASD"

        it "should unset properties", (done)->
          instance.unset field
          unless instance.attributes[field] then done()

        it "should set store on command", ->
          instance.storeSet()
          model.storeGet().should.be.an "object"

      describe "save", ->

        it "should not save with absent required properties", (done)->
          instance.unset field
          instance.save (err, res)->
            console.log("ERRRRR", err)
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

    model_clean = ( context, field ) ->

      a           = App.Model
      model       = a[ context ]
      instance    = model.new()

      describe context, ->
        before ->
          a[ context ].destroyMine()
          a[ context ].new().storeClear()

        after ->
          a[ context ]._type = context
          a[ context ].new().storeClear()

        afterEach ->
          a[ context ].destroyMine()

        model_check( model, instance, field )


    describe "Base Models", ->

      model_clean( "Offer", "business" )

      model_clean( "Location", "geo" )

    describe "Location features", ->

      model = Location
      instance = model.new().setDefaults()

      it "should have a valid street address", (done) ->
        instance.save (err, res) ->
          if res then done()

     # it "should present an error if the address if not correct"
     # it "should notify the user once it has a response"
     # it "should save the coordinates if the request was successful"

    return

@load_tests()
