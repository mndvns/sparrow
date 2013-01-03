Meteor.startup(function () {
  Offers._ensureIndex({loc: "2d"})

});

Accounts.onCreateUser(function(options, user) {
  user.type = 'admin'
  user.votes = []
  user.votes.push(user._id)
  user.points = 10
  if (options.profile)
    user.profile = options.profile;
  return user;
});

Meteor.users.allow({
  insert: function(userId, docs) {
    if (Meteor.users.findOne({_id: userId}).type === "admin") {
      return _.all(docs)
    } else {
      return false
    }
  },
  update: function(userId, docs, fields, modifier) {
    return _.all(docs, function (doc) {
      if (Meteor.users.findOne({_id: userId}).type === "admin") {
        console.log("You're an admin!")
        return doc
      } else {
        return doc._id === userId
      }
    })
  },
  remove: function(userId, docs) {
    if (Meteor.users.findOne({_id: userId}).type === "admin") {
      console.log("You're an admin!")
      return _.all(docs)
    } else {
      return false
    }
  }
})


Meteor.publish("offers", function(loc) {
  return Offers.find({ loc: {$near : [loc.long, loc.lat]}})
})

Meteor.publish("tags", function() {
  return Tags.find({})
})

Meteor.publish("allUserData", function () {
  return Meteor.users.find({}, {type: 1})
})
