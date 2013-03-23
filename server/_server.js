var require, MongoDB, Future, allowUser, mapper;
require = __meteor_bootstrap__.require;
MongoDB = require("mongodb");
Future = require("fibers/future");
Accounts.onCreateUser(function(options, user){
  user.type = "basic";
  user.karma = 50;
  user.logins = 0;
  if (options.profile) {
    user.profile = options.profile;
  }
  user.meta = {
    firstPages: {
      home: true,
      account: true
    }
  };
  return user;
});
Meteor.users.allow({
  insert: function(userId, docs){
    var out;
    out = void 8;
    if (Meteor.users.findOne({
      _id: userId
    }).type === "admin") {
      out = _.all(docs);
    }
    return true;
  },
  update: function(userId, docs, fields, modifier){
    return _.all(docs, function(doc){
      if (Meteor.users.findOne({
        _id: userId
      }).type === "admin") {
        return doc;
      } else {
        return doc._id === userId;
      }
    });
  },
  remove: function(userId, docs){
    if (Meteor.users.findOne({
      _id: userId
    }).type === "admin") {
      return _.all(docs);
    } else {
      return false;
    }
  }
});
allowUser = function(collections){
  var i$, len$, c, results$ = [];
  for (i$ = 0, len$ = collections.length; i$ < len$; ++i$) {
    c = collections[i$];
    results$.push(c.allow({
      insert: fn$,
      update: fn1$,
      remove: fn2$,
      fetch: ['ownerId']
    }));
  }
  return results$;
  function fn$(userId, doc){
    return userId === doc.ownerId;
  }
  function fn1$(userId, doc){
    return userId === doc.ownerId;
  }
  function fn2$(userId, doc){
    return userId === doc.ownerId;
  }
};
allowUser([Offers, Tests, Tags, Locations, Pictures]);
mapper = function(a){
  var map;
  map = _.isArray(a)
    ? a
    : [a];
  return _.map(map, function(d){
    var out;
    out = {};
    out.username = d.username;
    out.id = d._id;
    return out;
  });
};
Meteor.methods({
  aggregateOffers: function(){
    var tags;
    return tags = App.Collection.Offers.aggregate({
      $project: {
        tags: 1
      }
    });
  },
  message: function(text, selector, opt){
    var message, involve, admin, existing, ID, admins, user, from, content;
    message = {};
    involve = [Meteor.userId()];
    admin = false;
    existing = void 8;
    ID = void 8;
    if (selector === "toAdmins") {
      admins = Meteor.users.find({
        type: "admin"
      }).fetch();
      involve.push(_.pluck(admins, "_id"));
      involve = _.flatten(involve);
      admin = true;
    } else if (selector === "offer") {
      user = Meteor.users.findOne({
        _id: opt
      });
      involve.push(user._id);
    }
    from = mapper(Meteor.user());
    content = {
      from: from,
      message: text,
      sent: Time.now()
    };
    if (selector === "reply") {
      ID = opt;
    } else {
      existing = Messages.findOne({
        involve: {
          $all: involve
        },
        admin: false
      });
      if (!existing) {
        message = {
          involve: involve,
          admin: admin,
          content: [content],
          lastSent: Time.now()
        };
      } else {
        ID = existing._id;
      }
    }
    console.log("New message", message);
    if (selector !== "reply" && !existing) {
      return Messages.insert(message, function(err, res){
        if (err) {
          console.log("Error", err);
        }
        return console.log("Successfully sent message, motherfucker", res);
      });
    } else {
      return Messages.update({
        _id: ID
      }, {
        $push: {
          content: content
        }
      }, function(err, res){
        if (err) {
          console.log("Error", err);
        }
        return console.log("Successfully sent message, motherfucker", res);
      });
    }
  },
  editOffer: function(type, opts){
    var out, key;
    console.log("GOT INSIDE");
    return;
    opts == null && (opts = {});
    out = {};
    if (opts.name.length < 5) {
      throw new Meteor.Error(400, "Offer name is too short");
    }
    for (key in Offer._schema) {
      out[key] = opts[key];
    }
    out.owner = Meteor.userId();
    out.createdAt == null && (out.createdAt = Time.now());
    out.updatedAt = Time.now();
    out.price = parseInt(out.price);
    if (type === "insert") {
      out.votes_meta.push({
        user: this.userId,
        exp: Date.now() * 10
      });
      out.votes_count = 1;
      out.rand = _.random(100, 999);
      return App.Collection.Offers.insert(out);
    } else {
      return App.Collection.Offers.update({
        owner: this.userId
      }, {
        $set: out
      });
    }
  },
  updateUser: function(email, username){
    var users, existing, existingEmails, existingUsernames, set;
    users = Meteor.users.find().fetch();
    existing = _.reject(users, function(d){
      return d._id === Meteor.userId();
    });
    if (email) {
      existingEmails = _.pluck(_.flatten(_.compact(_.pluck(existing, "emails"))), "address");
      if (_.contains(existingEmails, email)) {
        throw new Meteor.Error(400, "Email unavailable");
      }
    }
    existingUsernames = _.pluck(existing, "username");
    if (_.contains(existingUsernames, username)) {
      throw new Meteor.Error(400, "Username unavailable");
    }
    set = {
      $set: {
        username: username,
        emails: [{
          address: email,
          verified: false
        }]
      }
    };
    return Meteor.users.update({
      _id: Meteor.userId()
    }, set, {}, function(err){
      if (err) {
        return new Alert({
          text: "Uh oh..."
        });
      } else {
        return new Alert({
          text: "Profile saved successfully"
        });
      }
    });
  },
  activateAdmin: function(code){
    if (code !== "secret") {
      throw new Meteor.Error(400, "Activation failed");
    } else {
      return Meteor.users.update({
        _id: this.userId
      }, {
        $set: {
          type: "admin"
        }
      }, function(err){
        if (err) {
          return new Alert({
            text: err
          });
        } else {
          return new Alert({
            text: "Profile saved successfully"
          });
        }
      });
    }
  },
  isAdmin: function(id){
    var type;
    type = Meteor.users.findOne({
      _id: id
    }).type;
    if (type !== "admin") {
      return false;
    } else {
      return true;
    }
  }
});