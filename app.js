Offers  = new Meteor.Collection("offers")
Tags    = new Meteor.Collection("tags")
Tagsets = new Meteor.Collection("tagsets")
Users   = new Meteor.Collection("userData")

Meteor.methods({
  editOffer: function (type, options) {
    options = options || {}
    if (options.name.length < 5)
      throw new Meteor.Error(400, "Offer name is too short")

    if (type === 'insert') {
      return Offers.insert({
        owner: this.userId,
        name: options.name,
        price: options.price,
        description: options.description,
        business: options.business,
        symbol: options.symbol,
        loc: options.loc,
        tags: options.tags,
        createdAt: (moment().unix() * 1000),
        updatedAt: (moment().unix() * 1000),
        votes: [],
        street: options.street,
        city_state: options.city_state,
        zip: options.zip
      })
    }
    else if (type === 'update') {
      return Offers.update({
        owner: this.userId },
        {$set: {
          name: options.name,
          price: options.price,
          description: options.description,
          business: options.business,
          loc: options.loc,
          tags: options.tags,
          symbol: options.symbol,
          updatedAt: (moment().unix() * 1000),
          street: options.street,
          city_state: options.city_state,
          zip: options.zip
        }
      })
    }
  },
  isAdmin: function (id) {
    var type = Meteor.users.findOne({_id: id}).type
    console.log(type)
    if(type != "admin") {
      console.log("false!")
      return false
    } else {
      console.log("true!")
      return true
    } 
  }
})

