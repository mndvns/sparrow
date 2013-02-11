
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
    maxLength: 10

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

  symbol:
    type: String
    default: "glyph-lamp-2"

  tags:
    type: Array
    default: ""

  tagset:
    type: String
    default: ""

  updatedAt:
    type: Date
    default: ""

  votes:
    type: Array
    default: []

  zip:
    type: String
    default: "64105"
    maxLength: 6

  published:
    default: false

