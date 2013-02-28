
# Message = function(){}
# 
# Message.prototype.setFrom = function (a) { this.from = a }
# Message.prototype.setTo = function (a) { this.to = a }
# Message.prototype.setMessage = function (a) { this.message = a }
# Message.prototype.setSent = function (a) { this.sent = moment().unix() * 1000 }

# Message = Backbone.Model.extend({
#   defaults: {
#     from: {
#       id: [],
#       name: []
#     },
#     to: {
#       id: [],
#       name: []
#     },
#     message: "",
#     sent: 0
#   }
# })
# 
# message = new Message()

# 
# message = Object.create( Message )




class Minimongoid
  id: undefined
  attributes: {}

  constructor: (attributes = {}) ->
    if attributes._id
      @attributes = @demongoize(attributes)
      @id = attributes._id
    else
      @attributes = attributes

  isPersisted: -> @id?

  isValid: -> true

  save: ->
    return false unless @isValid()

    attributes = @mongoize(@attributes)
    attributes['_type'] = @constructor._type if @constructor._type?

    if @isPersisted()
      @constructor._collection.update @id, { $set: attributes }
    else
      @id = @constructor._collection.insert attributes

    this

  update: (@attributes) ->
    @save()

  destroy: ->
    if @isPersisted()
      @constructor._collection.remove @id
      @id = null

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

  @_collection: undefined
  @_type: undefined

  @new: (attributes) ->
    new @(attributes)

  @create: (attributes) ->
    @new(attributes).save()

  @where: (selector = {}, options = {}) ->
    @_collection.find(selector, options)

  @all: (selector = {}, options = {}) ->
    @_collection.find(selector, options)

  @toArray: (selector = {}, options = {}) ->
    for attributes in @where(selector, options).fetch()
      # eval is ok, because _type is never entered by user
      new(eval(attributes._type) ? @)(attributes)

  @count: (selector = {}, options = {}) ->
    @where(selector, options).count()

  @destroyAll: (selector = {}) ->
    @_collection.remove(selector)



class Sticker extends Minimongoid
  @_collection: new Meteor.Collection 'stickers'
  isValid: ->
    @attributes.name.length >= 3






Offer =
  business:
    type: String
    default: "your business/vendor name"
    maxLength: 30

  city:
    type: String
    default: "Kansas City"
    maxLength: 50

  color:
    type: String
    default: "#ccc"

  colors:
    default:
      hex: "#0a85c2"
      hsl:
        a: 1
        h: 0.555
        s: 0.399
        l: 0.901

  description:
    type: String
    default: "This is a description of the offer. Since the offer name must be very brief, this is the place to put any details you want to include."
    maxLength: 140

  loc:
    type: Array
    default: []

  name:
    type: String
    default: "Offer"
    maxLength: 15

  price:
    type: Number
    default: "10"

  street:
    type: String
    default: "200 Main Street"
    maxLength: 50

  state:
    type: String
    default: "MO"
    maxLength: 30

  image:
    type: String
    default: "http://i.imgur.com/YhUFTyA.jpg"

  tags:
    type: Array
    default: ""

  tagset:
    type: String
    default: ""

  updatedAt:
    type: Date
    default: ""

  votes_meta:
    type: Array
    default: []

  votes_count:
    default: 0

  zip:
    type: String
    default: "64105"
    maxLength: 6

  published:
    default: false

