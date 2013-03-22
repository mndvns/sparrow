(function(){
  var Storer, Point, Lock, Default, Check, Model, Locations, Location, Tags, Tag, Offers, Offer, key, ref$, val, hasModel, i$, len$, g, m, c, results$ = [];
  (App.Util || (App.Util = {})).characterize = function(it){
    if (it == null) {
      return false;
    }
    switch (it) {
    case "string":
      return "letters";
    case "array":
      return "items";
    case "number":
      return "number";
    case "object":
      return "values";
    case "boolean":
      return "true or false";
    }
  };
  Storer = {
    storeMethod: function(){
      var ref$;
      return typeof Store != 'undefined' && Store !== null ? Store[arguments[0]]("instance_" + ((ref$ = this.constructor._type) != null ? ref$.toLowerCase() : void 8), arguments[1]) : void 8;
    },
    storeSet: function(){
      return this.storeMethod("set", _.extend(this.attr, this.id ? {
        _id: this.id
      } : void 8));
    },
    storeClear: function(){
      return this.storeMethod("set", null);
    },
    storeGet: function(){
      return this.storeMethod("get", null);
    }
  };
  Point = {
    pointRecall: curry$(function(it){
      return App.Collection[it.toProperCase()].find({
        "ownerId": this.attr["ownerId"]
      }).fetch();
    }),
    pointCompact: curry$(function(list){
      return _.compact(unique(list));
    }),
    pointStrip: curry$(function(field, list){
      return map(function(it){
        return it[field];
      }, list);
    }),
    pointGet: curry$(function(field, list){
      switch (false) {
      case field === list:
        return this.pointCompact(this.pointStrip(field, this.pointRecall(list)));
      default:
        return this.pointCompact(this.pointRecall(list));
      }
    }),
    pointSet: curry$(function(field, list, attr){
      attr == null && (attr = list);
      return this.set(attr, this.pointGet(field, list));
    }),
    pointJam: function(){
      var i$, ref$, len$, p, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.constructor._points).length; i$ < len$; ++i$) {
        p = ref$[i$];
        results$.push(this.pointSet(p.field, p.list, p.attr));
      }
      return results$;
    }
  };
  Lock = {
    lockGet: function(it){
      return this.constructor._locks[it];
    },
    lockSet: function(){
      var k, ref$, v, results$ = [];
      for (k in ref$ = this.constructor._locks) {
        v = ref$[k];
        results$.push(this.set(k, v()));
      }
      return results$;
    },
    lockCheck: function(){
      var l, results$ = [];
      for (l in this.constructor._locks) {
        if (this.get(l) == null) {
          results$.push(this['throw']("An error occured during the " + l + " verification process"));
        }
      }
      return results$;
    }
  };
  Default = {
    defaultSet: function(){
      var k, ref$, v, results$ = [];
      for (k in ref$ = this.constructor._schema) {
        v = ref$[k];
        results$.push(this.set(k, v['default']));
      }
      return results$;
    },
    defaultNull: function(){
      var k, results$ = [];
      for (k in this.constructor._schema) {
        results$.push(this.set(k, null));
      }
      return results$;
    }
  };
  Check = {
    checkField: function(f){
      var e, a, s, at, st, c, aval, verb, char, ref$, this$ = this;
      e = function(it){
        return this$['throw']((this$.constructor.name + "'s " + f + " property ") + it);
      };
      a = this.attr[f];
      s = this.constructor._schema[f];
      switch (false) {
      case s != null:
        e("does not exist");
        break;
      case a != null:
        e("has not been set");
      }
      at = type(a);
      st = type(s['default']);
      c = function(it){
        return App.Util.characterize(it);
      };
      switch (at) {
      case "boolean":
        return;
      case "number":
        aval = a;
        verb = "be";
        char = numberWithCommas(s.max);
        break;
      default:
        aval = length(a);
        verb = "have";
        char = s.max + " " + c(st);
      }
      switch (false) {
      case at === st:
        e("must have " + c(st) + ", not " + c(at));
        break;
      case !(s.min === (ref$ = s.max) && ref$ !== aval):
        e("must " + verb + " exactly " + char);
        break;
      case !(s.max < aval || aval < s.min):
        e("must " + verb + " between " + s.min + " and " + char);
      }
      return f + " checked";
    },
    checkLock: function(){
      return this.lockCheck();
    },
    checkList: function(it){
      var i$, len$, i, results$ = [];
      for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
        i = it[i$];
        results$.push(this.checkField(i));
      }
      return results$;
    },
    checkAll: function(){
      this.lockSet();
      this.lockCheck();
      this.checkLimit();
      return this.checkList(keys(filter(function(it){
        return it.required;
      }, this.constructor._schema)));
    },
    checkLimit: function(){
      if (!this.isPersisted() && this.constructor._limit - this.constructor.mine().count() <= 0) {
        return this['throw']("Collection at limit");
      }
    }
  };
  Model = (function(){
    Model.displayName = 'Model';
    var prototype = Model.prototype, constructor = Model;
    importAll$(prototype, arguments[0]);
    importAll$(prototype, arguments[1]);
    importAll$(prototype, arguments[2]);
    importAll$(prototype, arguments[3]);
    importAll$(prototype, arguments[4]);
    prototype.attr = {};
    prototype.id = void 8;
    function Model(attr){
      attr == null && (attr = {});
      if (attr._id) {
        this.attr = this.demongoize(attr);
        this.id = attr._id;
      } else {
        this.defaultNull();
        this.lockSet();
      }
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
    prototype.set = function(key, val){
      this.attr[key] = val;
      return this;
    };
    prototype.unset = function(it){
      return this.attr = _.omit(this.attr, it);
    };
    prototype.get = function(it){
      return this.attr[it];
    };
    prototype.save = curry$(function(it){
      var e;
      try {
        this.checkAll();
      } catch (e$) {
        e = e$;
        this.alert(e.message);
        switch (false) {
        case it == null:
          it(e.message);
          break;
        default:
          return;
        }
      }
      this.alert("Successfully saved " + this.constructor.name);
      switch (false) {
      case !this.isPersisted():
        this.constructor._collection.update(this.id, {
          $set: this.attr
        });
        break;
      default:
        this.id = this.constructor._collection.insert(this.attr);
      }
      switch (false) {
      case it == null:
        return it(null, this.attr);
      default:
        return this.attr;
      }
    });
    prototype.destroy = function(it){
      if (this.isPersisted()) {
        this.constructor._collection.remove(this.id);
        this.id = null;
      }
      this.storeClear();
      switch (false) {
      case it == null:
        return it(null, this);
      default:
        return this;
      }
    };
    prototype.mongoize = function(attr){
      attr == null && (attr = this.attr);
      attr._id = this.id;
      return this.attr;
    };
    prototype.demongoize = function(attr){
      var taken, name, value;
      attr == null && (attr = this.attr);
      taken = {};
      for (name in attr) {
        value = attr[name];
        if (name.match(/^_/)) {
          continue;
        }
        taken[name] = value;
      }
      return taken;
    };
    prototype['throw'] = function(it){
      throw new Error(it);
    };
    Model['new'] = function(it){
      return new this(it);
    };
    Model.create = function(it){
      return this['new'](it).save();
    };
    Model.where = function(sel, opt){
      var ref$;
      sel == null && (sel = {});
      opt == null && (opt = {});
      return (ref$ = this._collection) != null ? ref$.find(sel, opt) : void 8;
    };
    Model.all = function(sel, opt){
      var ref$;
      sel == null && (sel = {});
      opt == null && (opt = {});
      return (ref$ = this._collection) != null ? ref$.find(sel, opt) : void 8;
    };
    Model.mine = function(sel, opt){
      sel == null && (sel = {});
      opt == null && (opt = {});
      return this.where(_.extend(sel, {
        ownerId: My.userId()
      }, opt));
    };
    Model.destroyMine = function(){
      return Meteor.call("instance_destroy_mine", this._collection._name.toProperCase());
    };
    Model.storeGet = function(){
      return Store.get("instance_" + this._type.toLowerCase());
    };
    return Model;
  }(Point, Storer, Lock, Check, Default));
  Locations = new Meteor.Collection('locations', {
    transform: function(it){
      var x$;
      it = (x$ = Location['new'](it), x$.set("distance", x$.geoPlot()), x$);
      it = it.mongoize();
      return it;
    }
  });
  Location = (function(superclass){
    var prototype = extend$((import$(Location, superclass).displayName = 'Location', Location), superclass).prototype, constructor = Location;
    Location._type = "Location";
    Location._collection = Locations;
    Location._locks = {
      ownerId: function(){
        return My.userId();
      },
      offerId: function(){
        return My.offerId();
      }
    };
    Location._schema = {
      geo: {
        'default': [47, -122],
        required: true,
        max: 2,
        min: 2
      },
      city: {
        'default': "Kansas City",
        required: true,
        max: 30,
        min: 0
      },
      street: {
        'default': "200 Main Street",
        required: true,
        max: 30,
        min: 0
      },
      state: {
        'default': "MO",
        required: true,
        max: 2,
        min: 2
      },
      zip: {
        'default': "64105",
        required: true,
        max: 5,
        min: 5
      }
    };
    Location._limit = 20;
    prototype.geoMap = function(it){
      var e, ref$, this$ = this;
      try {
        this.checkList(["city", "street", "state", "zip"]);
      } catch (e$) {
        e = e$;
        this.alert(e.message);
        if (typeof it === 'function') {
          it(e.message);
        }
        return;
      }
      return typeof (ref$ = google.maps).Geocoder === 'function' ? new ref$.Geocoder().geocode({
        address: this.attr.street + " " + this.attr.city + " " + this.attr.state + " " + this.attr.zip
      }, function(results, status){
        var message, format, ref$;
        if (status !== "OK") {
          message = "We couldn't seem to find your location. Did you enter your address correctly?";
          this$.alert(message);
          return typeof cb === 'function' ? cb(this$['throw'](message)) : void 8;
        } else {
          format = [(ref$ = values(results[0].geometry.location))[0], ref$[1]];
          this$.alert(format);
          this$.set("geo", format);
          return typeof cb === 'function' ? cb(null, format) : void 8;
        }
      }) : void 8;
    };
    prototype.geoPlot = function(){
      var m, g;
      m = My.userLoc() || {
        lat: 39,
        long: -94
      };
      g = this.get("geo");
      return Math.round(distance(m.lat, m.long, g[0], g[1], "MMMMMMMMMM" / 10));
    };
    function Location(){
      Location.superclass.apply(this, arguments);
    }
    return Location;
  }(Model));
  Tags = new Meteor.Collection('tags', {
    transform: function(doc){
      doc.collection = "tags";
      doc.tagset = "eat";
      return doc;
    }
  });
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
      },
      collection: function(){
        return (Tag._type + "s").toLowerCase();
      }
    };
    Tag._schema = {
      name: {
        'default': "tag",
        required: true,
        max: 20,
        min: 2
      },
      tagset: {
        'default': "eat",
        required: true,
        max: 10,
        min: 2
      }
    };
    Tag.rateAll = function(){
      var list, out, i$, ref$, len$, n, lout, key, val, o;
      list = this.all().fetch();
      console.log("LIST", list);
      out = {};
      for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
        n = ref$[i$];
        if (n == null) {
          continue;
        }
        out[n] == null && (out[n] = 0);
        out[n] += 1;
      }
      lout = [];
      for (key in out) {
        val = out[key];
        o = find(fn1$, list);
        o.rate = val;
        lout.push(o);
      }
      return lout;
      function fn$(){
        var i$, x$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = list).length; i$ < len$; ++i$) {
          x$ = ref$[i$];
          results$.push(x$.name);
        }
        return results$;
      }
      function fn1$(it){
        return it.name === key;
      }
    };
    prototype.rate = function(){
      return this.set('rate', this.constructor.where({
        name: this.attr.name
      }).count());
    };
    function Tag(){
      Tag.superclass.apply(this, arguments);
    }
    return Tag;
  }(Model));
  Offers = new Meteor.Collection('offers', {
    transform: function(it){
      var x$;
      it = (x$ = Offer['new'](it), x$.pointJam(), x$.setNearest(), x$);
      it = it.mongoize();
      return it;
    }
  });
  Offer = (function(superclass){
    var prototype = extend$((import$(Offer, superclass).displayName = 'Offer', Offer), superclass).prototype, constructor = Offer;
    Offer._type = "Offer";
    Offer._collection = Offers;
    Offer._limit = 1;
    Offer._points = [
      {
        field: "name",
        list: "tags",
        attr: "tags"
      }, {
        field: "locations",
        list: "locations",
        attr: "locations"
      }
    ];
    Offer._locks = {
      ownerId: function(){
        return My.userId();
      },
      updatedAt: function(){
        return Time.now();
      }
    };
    Offer._schema = {
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
      locations: {
        'default': []
      },
      name: {
        'default': "Offer",
        required: true,
        max: 15,
        min: 3
      },
      price: {
        'default': 10,
        required: true,
        min: 3,
        max: 2000
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
    };
    prototype.nearest = function(){
      return minimum((function(){
        var i$, x$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = this.get("locations")).length; i$ < len$; ++i$) {
          x$ = ref$[i$];
          results$.push(x$.distance);
        }
        return results$;
      }.call(this)));
    };
    prototype.setNearest = function(){
      return this.set("nearest", this.nearest());
    };
    Offer.loadStore = function(){
      var ref$, this$ = this;
      return (ref$ = this.handle) != null
        ? ref$
        : this.handle = Meteor.autorun(function(){
          var x$, y$;
          if (Session.get("subscribe_ready") === true) {
            switch (false) {
            case Offer.storeGet() == null:
              break;
            case !this$.mine().count():
              x$ = this$['new'](My.offer());
              x$.storeSet();
              return x$;
              break;
            default:
              y$ = this$['new']();
              y$.defaultSet();
              y$.storeSet();
              return y$;
            }
          }
        });
    };
    function Offer(){
      Offer.superclass.apply(this, arguments);
    }
    return Offer;
  }(Model));
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
  for (key in ref$ = App.Collection) {
    val = ref$[key];
    global[key] = val;
  }
  hasModel = ["Location", "Offer", "Tag"];
  for (i$ = 0, len$ = hasModel.length; i$ < len$; ++i$) {
    g = hasModel[i$];
    m = App.Model[g] = eval(g);
    c = App.Collection[g + "s"] = eval(g + "s");
    if (Meteor.isClient) {
      window[g] = m;
      results$.push(window[g + "s"] = c);
    }
  }
  return results$;
})();
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
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