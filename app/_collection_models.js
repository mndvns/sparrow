
var derp;
derp = {
  asd: 123,
  qwe: 9897
};
console.log(keys(derp));
console.log("ASD");
(function(){
  var Model, Locations, Location, Tags, Tag, Offers, Offer, grouping, i$, len$, g, m, c, results$ = [];
  Model = (function(){
    Model.displayName = 'Model';
    var prototype = Model.prototype, constructor = Model;
    prototype.attributes = {};
    prototype.id = void 8;
    function Model(attributes){
      var defaults, i$, ref$, len$, key, lock;
      attributes == null && (attributes = {});
      if (attributes._id) {
        this.attributes = this.demongoize(attributes);
        this.id = attributes._id;
      } else {
        defaults = {};
        for (i$ = 0, len$ = (ref$ = this._keys).length; i$ < len$; ++i$) {
          key = ref$[i$];
          defaults[key] = null;
        }
        for (lock in constructor._locks) {
          defaults[lock] = constructor._locks[lock]();
        }
        this.attributes = _.defaults(attributes, defaults);
      }
      console.log("ATTR", this.attributes);
    }
    prototype.alert = function(text){
      if (Meteor.isServer) {
        console.log(text);
        new Alert({
          text: text
        });
      }
      if (Meteor.isClient) {
        return Meteor.Alert.set({
          text: text
        });
      }
    };
    prototype.isPersisted = function(){
      return this.id != null;
    };
    prototype.setDefaults = function(){
      var key, ref$;
      for (key in constructor._keys) {
        (ref$ = this.attributes)[key] == null && (ref$[key] = this.constructor._schema[key]['default']);
      }
      return this;
    };
    prototype.authorize = function(){
      if (this.attributes.ownerId !== My.userId()) {
        throw Error("User not authorized");
      }
    };
    prototype.validate = function(){
      var attr, i$, ref$, len$, key, err, sk, ak, sk_type, ak_type, max, min, size, results$ = [];
      attr = this.attributes;
      if (attr.ownerId && attr.ownerId !== My.userId()) {
        throw Error("User identification error");
      }
      if (!this.isPersisted()) {
        if (this.constructor._limit - this.constructor.mine().count() <= 0) {
          throw Error("Collection at limit");
        }
      }
      for (i$ = 0, len$ = (ref$ = constructor._keys).length; i$ < len$; ++i$) {
        key = ref$[i$];
        err = [this.constructor.name + "'s", key, "field"];
        sk = this.constructor._schema[key];
        ak = attr[key];
        sk_type = type(sk['default']);
        ak_type = type(ak);
        max = sk.max;
        min = sk.min;
        if (!ak && sk.required) {
          err.push("have only");
        } else if (sk_type !== ak_type) {
          err.push("contain only");
        } else if (min || max) {
          size = _.size(ak);
          switch (max === min) {
          case true:
            if (min !== size) {
              err.push("have exactly " + min);
            } else {
              continue;
            }
            break;
          case false:
            if (max < size) {
              err.push("have less than " + max);
            } else if (min >= size) {
              err.push("have more than " + min);
            } else {
              continue;
            }
          }
        } else {
          continue;
        }
        switch (sk_type) {
        case "string":
          err.push("letters");
          break;
        case "object":
          err.push("properties");
          break;
        case "boolean":
          err.push("true or false");
          break;
        case "array":
          err.push("array items");
        }
        throw Error(err.join(" "));
      }
      return results$;
    };
    prototype.set = function(first, rest){
      return this.attributes[first] = rest;
    };
    prototype.unset = function(attributes){
      return this.attributes = _.omit(this.attributes, attributes);
    };
    prototype.save = function(cb){
      var this$ = this;
      return Meteor.call("instance_save", constructor.name, this, function(err, res){
        if (err) {
          this$.alert(err.reason);
          return typeof cb === 'function' ? cb(err.reason) : void 8;
        } else {
          this$.alert("Save successful");
          this$.id = res.id;
          return typeof cb === 'function' ? cb(null, res) : void 8;
        }
      });
    };
    prototype.destroy = function(cb){
      var error;
      try {
        this.authorize();
      } catch (e$) {
        error = e$;
        this.alert(error.message);
        if (typeof cb === 'function') {
          cb(error.message);
        }
        return this;
      }
      if (this.isPersisted()) {
        this.constructor._collection.remove(this.id);
        this.id = null;
      }
      this.storeClear();
      if (typeof cb === 'function') {
        cb(null, this);
      }
      return this;
    };
    prototype.storeSet = function(){
      var extend, ref$;
      extend = _.extend(this.attributes, {
        _id: this.id
      });
      return typeof Store != 'undefined' && Store !== null ? Store.set("instance_" + ((ref$ = this.constructor._type) != null ? ref$.toLowerCase() : void 8), extend) : void 8;
    };
    prototype.storeClear = function(){
      var ref$;
      return typeof Store != 'undefined' && Store !== null ? Store.set("instance_" + ((ref$ = constructor._type) != null ? ref$.toLowerCase() : void 8), null) : void 8;
    };
    prototype.mongoize = function(attributes){
      var taken, name, value;
      taken = {};
      for (name in attributes) {
        value = attributes[name];
        if (name.match(/^_/)) {
          continue;
        }
        taken[name] = value;
      }
      return taken;
    };
    prototype.demongoize = function(attributes){
      var taken, name, value;
      taken = {};
      for (name in attributes) {
        value = attributes[name];
        if (name.match(/^_/)) {
          continue;
        }
        taken[name] = value;
      }
      return taken;
    };
    Model._schema = {};
    Model._collection = void 8;
    Model._type = void 8;
    Model._limit = void 8;
    Model['new'] = function(attributes){
      var out;
      out = new this(attributes);
      return out;
    };
    Model.storeGet = function(){
      return typeof Store != 'undefined' && Store !== null ? Store.get("instance_" + this.name) : void 8;
    };
    Model.create = function(attributes){
      return this['new'](attributes).save();
    };
    Model.where = function(selector, options){
      var ref$;
      selector == null && (selector = {});
      options == null && (options = {});
      return (ref$ = this._collection) != null ? ref$.find(selector, options) : void 8;
    };
    Model.mine = function(selector, options){
      selector == null && (selector = {});
      options == null && (options = {});
      return this.where(_.extend(selector, {
        ownerId: Meteor.userId()
      }), options);
    };
    Model.all = function(selector, options){
      var ref$;
      selector == null && (selector = {});
      options == null && (options = {});
      return (ref$ = this._collection) != null ? ref$.find(selector, options) : void 8;
    };
    Model.toArray = function(selector, options){
      var i$, ref$, len$, attributes, ref1$, results$ = [];
      selector == null && (selector = {});
      options == null && (options = {});
      for (i$ = 0, len$ = (ref$ = this.where(selector, options).fetch()).length; i$ < len$; ++i$) {
        attributes = ref$[i$];
        results$.push(new ((ref1$ = eval(attributes._type)) != null ? ref1$ : this)(attributes));
      }
      return results$;
    };
    Model.destroyMine = function(){
      return Meteor.call("instance_destroy_mine", this._collection._name.toProperCase());
    };
    return Model;
  }());
  Locations = new Meteor.Collection('locations', {
    transform: function(doc){
      console.log(doc);
      doc.derp = "ASD";
      return doc;
    }
  });
  Location = (function(superclass){
    var prototype = extend$((import$(Location, superclass).displayName = 'Location', Location), superclass).prototype, constructor = Location;
    function Location(){
      this._type = "Location";
      this._collection = Locations;
      this._locks = {
        ownerId: function(){
          return My.userId();
        },
        offerId: function(){
          return My.offerId();
        }
      };
      this._schema = {
        geo: {
          'default': [47, -122],
          max: 2,
          min: 2
        },
        city: {
          'default': "Kansas City",
          max: 50,
          min: 3
        },
        street: {
          'default': "200 Main Street",
          max: 50,
          min: 3
        },
        state: {
          'default': "MO",
          max: 2,
          min: 2
        },
        zip: {
          'default': "64105",
          max: 5,
          min: 5
        }
      };
      this._limit = 20;
      Location.superclass.call(this);
    }
    prototype.gmap = function(){
      var geo, params, this$ = this;
      geo = new google.maps.Geocoder();
      geo.geocode(params);
      return params = [
        {
          address: this.street + " " + this.city + " " + this.state + " " + this.zip
        }, function(results, status){
          if (status !== "OK") {
            return console.log("We couldn't seem to find your location. Did you enter your address correctly?");
          }
        }
      ];
    };
    Location.plot = function(){
      return this.all().map(function(d){
        var myLoc;
        myLoc = My.loc();
        d.distance = Math.round(distance(myLoc.lat, myLoc.long, d.geo[0], d.geo[1], "M") * 10) / 10;
        return d;
      });
    };
    return Location;
  }(Model));
  Tags = new Meteor.Collection('tags');
  Tag = (function(superclass){
    var prototype = extend$((import$(Tag, superclass).displayName = 'Tag', Tag), superclass).prototype, constructor = Tag;
    Tag._type = "Tag";
    Tag._collection = Tags;
    Tag._limit = 20;
    Tag._locks = {
      ownerId: function(){
        return My.userId();
      },
      offerId: function(){
        return My.offerId();
      }
    };
    Tag._schema = {
      name: {
        'default': "tag",
        max: 20,
        min: 2
      }
    };
    function Tag(){
      Tag.superclass.apply(this, arguments);
    }
    return Tag;
  }(Model));
  Offers = new Meteor.Collection('offers');
  Offer = (function(superclass){
    var prototype = extend$((import$(Offer, superclass).displayName = 'Offer', Offer), superclass).prototype, constructor = Offer;
    function Offer(attr){
      ({
        _type: "Offer",
        _collection: Offers,
        _limit: 1,
        _locks: {
          ownerId: function(){
            return My.userId();
          },
          updatedAt: function(){
            return Time.now();
          }
        },
        _schema: {
          business: {
            'default': "your business/vendor name",
            required: true,
            max: 30,
            min: 3
          },
          description: {
            'default': "This is a description of the offer. Since the offer name must be very brief, this is the place to put any details you want to include.",
            required: true,
            max: 140,
            min: 3
          },
          image: {
            'default': "http://i.imgur.com/YhUFTyA.jpg"
          },
          name: {
            'default': "Offer",
            required: true,
            max: 15,
            min: 3
          },
          price: {
            'default': "10",
            required: true
          },
          tags: {
            'default': ""
          },
          tagset: {
            'default': ""
          },
          votes_meta: {
            'default': []
          },
          votes_count: {
            'default': 0
          },
          published: {
            'default': false
          }
        }
      });
      Offer.superclass.call(this, attr);
    }
    return Offer;
  }(Model));
  this.loadStore = function(){
    var this$ = this;
    if (!this.handle) {
      return this.handle = Meteor.autorun(function(){});
    }
  };
  App.Model = {};
  App.Collection = {
    Tests: new Meteor.Collection("tests"),
    Images: new Meteor.Collection("images"),
    Users: new Meteor.Collection("userData"),
    Tagsets: new Meteor.Collection("tagsets"),
    Sorts: new Meteor.Collection("sorts"),
    Messages: new Meteor.Collection("messages"),
    Alerts: new Meteor.Collection("alerts")
  };
  grouping = ["Location", "Offer", "Tag"];
  for (i$ = 0, len$ = grouping.length; i$ < len$; ++i$) {
    g = grouping[i$];
    m = App.Model[g] = eval(g);
    c = App.Collection[g + "s"] = eval(g + "s");
    if (Meteor.isClient) {
      window[g] = m;
      results$.push(window[g + "s"] = c);
    }
  }
  return results$;
})();
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
