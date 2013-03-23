Meteor.publish("relations", function(loc){
  var miles, radius, filt;
  miles = 2000;
  radius = miles / 69;
  switch (loc) {
  case function(it){
    return it.lat;
  } != null:
    filt = {
      geo: {
        $near: [loc.lat, loc.long],
        $maxDistance: radius
      }
    };
    break;
  default:
    filt = {};
  }
  Meteor.publishWithRelations({
    handle: this,
    collection: Locations,
    filter: filt,
    mappings: [{
      key: 'offerId',
      collection: Offers,
      filter: {},
      mappings: [{
        reverse: true,
        key: 'offerId',
        collection: Tags,
        filter: {}
      }]
    }]
  });
  return this.ready();
});
Meteor.publish("my_offer", function(){
  return Offers.find({
    ownerId: this.userId
  });
});
Meteor.publish("my_tags", function(){
  return Tags.find({
    ownerId: this.userId
  });
});
Meteor.publish("my_pictures", function(){
  return Pictures.find({
    ownerId: this.userId,
    status: {
      $nin: ["deactivated"]
    }
  });
});
Meteor.publish("all_offers", function(){
  return App.Collection.Offers.find();
});
Meteor.publish("userData", function(){
  return Meteor.users.find({}, {
    type: 1
  });
});
Meteor.publish("tagsets", function(){
  return App.Collection.Tagsets.find({});
});
Meteor.publish("sorts", function(){
  return App.Collection.Sorts.find({}, {
    sort: {
      list_order: 1
    }
  });
});
Meteor.publish("messages", function(){
  return App.Collection.Messages.find({
    involve: {
      $in: [this.userId]
    }
  });
});
Meteor.publish("alerts", function(){
  return App.Collection.Alerts.find({
    owner: this.userId
  });
});
Meteor.publish("tests", function(){
  return App.Collection.Tests.find();
});