
chai.should()
expect = chai.expect

console.log "TESTS RUNNING"

describe "Offer", ->
  model    = undefined
  instance = undefined

  before ->
    model = App.Model.Offer
    model._type = "Test"
    model.destroyMine()

    instance = model.new()
    instance.storeClear()

  after ->
    model._type = "Offer"

    instance.storeClear()

  afterEach ->
    model.destroyMine()

  describe "new", ->

    it "should be an object", ->
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
      instance.set business: "ASD"
      instance.attributes.business.should.equal "ASD"

    it "should unset properties", (done)->
      instance.unset "business"
      unless instance.attributes.business then done()

    it "should set store on command", ->
      instance.storeSet()
      model.storeGet().should.be.an('object')

  describe "save", ->

    it "should not save with absent required properties", (done)->
      instance.unset 'business'
      instance.save (err, res)->
        if err then done()

    it "should not save with wrong type properties", (done)->
      instance.set business: [1, 2, 3, 4, 5, 6, 7]
      instance.save (err, res)->
        if err then done()

    it "should not save with short properties", (done)->
      instance.set business: "a"
      instance.save (err, res)->
        if err then done()

    it "should not save with long properties", (done)->
      instance.set business: "
      asd asd asd asd asd asd asd asd asd asd asd asd asd asd asd "
      instance.save (err, res)->
        if err then done()

    it "should not save with unauthorized owner", (done)->
      instance.set ownerId: 123
      instance.save (err, res)->
        if err then done()

    it "should save if valid", (done)->
      instance.set
        ownerId: My.userId()
        business: "Testing"
      instance.save (err, res)->
        # console.log("ERRor", err, res)
        if res then done()

  describe "destroy", ->

    it "should not destroy with authorized owner", (done)->
      instance.set ownerId: 123
      instance.destroy (err, res)->
        if err then done()

    it "should destroy with authorized owner", (done)->
      instance.set ownerId: My.userId()
      instance.destroy (err, res)->
        if res then done()

    it "should also destory store", (done)->
      unless model.storeGet() then done()


# @load_test()
