
Users   = new Meteor.Collection("userData")
Offers  = new Meteor.Collection("offers")

Tags    = new Meteor.Collection("tags")
Tagsets = new Meteor.Collection("tagsets")
Sorts   = new Meteor.Collection("sorts")

Metrics = new Meteor.Collection("metrics")

Meteor.methods({
  getRandomOffer: function (cb) {
    var offers = Offers.find({}).fetch()
      , offer = offers[_.random(0, offers.length)]

    console.log(offer)
  }
})

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

String.prototype.trunc = function(n){
  return this.substr(0, n) + (this.length > n ? '' : '');
};

Color = net.brehaut.Color
