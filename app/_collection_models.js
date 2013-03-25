var toString$ = {}.toString;
(function(){
  var collect, Check, Default, Lock, Storer, Point, Clone, Model, Location, Tagset, Tag, Offer, Picture, Vote, key, ref$, val, hasModel, i$, len$, g, m, c, results$ = [];
  collect = function(){
    var ref$;
    return My.env()[(ref$ = arguments[0]) != null ? ref$.toProperCase() : void 8] = new Meteor.Collection(arguments[0], {
      transform: arguments[1]
    });
  };
  (App.Util || (App.Util = {})).characterize = function(it){
    if (it == null) {
      return false;
    }
    switch (it) {
    case "string":
      return "characters";
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
  Check = {
    checkField: function(f){
      var e, a, s, st, c, aval, verb, char, at, ref$, this$ = this;
      e = function(it){
        return this$['throw']((this$.constructor.name + "'s " + f + " property ") + it);
      };
      a = this[f];
      s = this.constructor._schema[f];
      switch (false) {
      case s != null:
        e("does not exist");
        break;
      case a != null:
        e("has not been set");
      }
      st = type(s['default']);
      c = function(it){
        return App.Util.characterize(it);
      };
      switch (st) {
      case "boolean":
        return;
      case "number":
        aval = a = parseInt(a);
        verb = "be";
        char = numberWithCommas(s.max);
        break;
      default:
        aval = length(a);
        verb = "have";
        char = s.max + " " + c(st);
      }
      at = type(a);
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
    checkLimit: function(){
      if (!this.isPersisted() && this.constructor._limit - this.constructor.mine().count() <= 0) {
        return this['throw']("Collection at limit");
      }
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
      var x$, y$, z$;
      if (this.isLocked() != null) {
        x$ = this;
        x$.lockSet();
        x$.lockCheck();
      }
      if (this.isLimited() != null) {
        y$ = this;
        y$.checkLimit();
      }
      if (this.isStructured() != null) {
        z$ = this;
        z$.checkList(keys(filter(function(it){
          return it.required;
        }, this.constructor._schema)));
        return z$;
      }
    }
  };
  Default = {
    defaultSet: function(){
      var k, ref$, v, results$ = [];
      for (k in ref$ = this.constructor._schema) {
        v = ref$[k];
        results$.push(this[k] = v['default']);
      }
      return results$;
    },
    defaultNull: function(){
      var k, results$ = [];
      for (k in this.constructor._schema) {
        if (this[k] == null) {
          results$.push(this[k] = null);
        }
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
        results$.push(this[k] = v());
      }
      return results$;
    },
    lockCheck: function(){
      var l, results$ = [];
      for (l in this.constructor._locks) {
        if (this[l] == null) {
          results$.push(this['throw']("An error occured during the " + l + " verification process"));
        }
      }
      return results$;
    }
  };
  Storer = {
    storeMethod: function(){
      return typeof Store != 'undefined' && Store !== null ? Store[arguments[0]]("instance_" + this.constructor.displayName.toLowerCase(), arguments[1]) : void 8;
    },
    storeSet: function(){
      return this.storeMethod("set", this);
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
        "ownerId": this.ownerId
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
      return this.attr = this.pointGet(field, list);
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
  Clone = {
    cloneNew: function(){
      var x$;
      return this.constructor['new'](_.omit(this, (x$ = keys(this._locks), x$.push("_id"), x$)));
    },
    cloneKill: function(it){
      var that;
      if (that = this.cloneFind(it)) {
        return this.constructor._collection.remove(that._id);
      }
    },
    cloneFind: function(f){
      var key$, this$ = this;
      return find(function(it){
        return it[f] === this$[f];
      }, typeof My[key$ = this.constructor._collection._name] === 'function' ? My[key$]() : void 8);
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
    importAll$(prototype, arguments[5]);
    function Model(it){
      _.extend(this, it);
    }
    prototype['throw'] = function(it){
      throw new Error(it);
    };
    prototype.alert = function(it){
      switch (false) {
      case !Meteor.isServer:
        return new Alert({
          text: it
        });
      case !Meteor.isClient:
        return Meteor.Alert.set({
          text: it
        });
      }
    };
    prototype.isStructured = function(){
      return this.constructor._schema != null;
    };
    prototype.isLocked = function(){
      return this.constructor._locks != null;
    };
    prototype.isLimited = function(){
      return this.constructor._limit != null;
    };
    prototype.isPersisted = function(){
      return this._id != null;
    };
    prototype.set = function(){
      return this[arguments[0]] = arguments[1];
    };
    prototype.setCheck = function(){
      var n, out, ref$, k, v, key$;
      n = arguments;
      if (toString$.call(n[0]).slice(8, -1) === "Arguments") {
        n = n[0];
      }
      switch (toString$.call(n[0]).slice(8, -1)) {
      case "String":
        this.checkField(n[0]) && (this[n[0]] = n[1]) && (out = (ref$ = {}, ref$[n[0]] = n[1], ref$));
        break;
      case "Array":
        this.checkField(n[0][0]) && (this[n[0][0]] = n[0][1]) && (out = (ref$ = {}, ref$[n[0][0]] = n[0][1], ref$));
        break;
      case "Object":
        this.checkList(keys(n[0][0])) && (function(){
          var ref$, results$ = [];
          for (k in ref$ = n[0][0]) {
            v = ref$[k];
            results$.push(this[k] = v);
          }
          return results$;
        }.call(this)) && (out = n[0]);
        break;
      default:
        this['throw']("Must pass string, array, or object");
      }
      if (typeof arguments[key$ = arguments.length - 1] === 'function') {
        arguments[key$](out);
      }
      return out;
    };
    prototype.setSave = function(){
      var this$ = this;
      switch (false) {
      case !this.isPersisted():
        return this.setCheck(arguments, function(it){
          return this$.constructor._collection.update(this$._id, {
            $set: it
          });
        });
      default:
        return this['throw'](this.constructor.name + " must save before set-saving");
      }
    };
    prototype.setStore = function(){
      var x$;
      x$ = this;
      x$.set(arguments[0], arguments[1]);
      x$.storeSet();
      return x$;
    };
    prototype.update = function(it){
      return this.extend(it) && this.save();
    };
    prototype.upsert = function(){
      switch (false) {
      case !this.isPersisted():
        return this.constructor._collection.update(this._id, {
          $set: _.omit(this, "_id")
        }, function($throw){
          this['throw'] = $throw;
        });
      default:
        return this._id = this.constructor._collection.insert(this);
      }
    };
    prototype.save = function(){
      var e;
      try {
        this.checkAll();
      } catch (e$) {
        e = e$;
        this.alert(e.message);
        return;
      }
      this.upsert();
      return this.alert("Successfully saved " + this.constructor.name.toLowerCase());
    };
    prototype.destroy = function(){
      if (this.isPersisted()) {
        this.constructor._collection.remove(this._id);
        this._id = null;
      }
      return this.storeClear();
    };
    Model['new'] = function(it){
      return new this(it);
    };
    Model.create = function(it){
      return this['new'](it).save();
    };
    Model.newDefault = function(it){
      var x$;
      x$ = this['new'](it);
      x$.defaultSet();
      return x$;
    };
    Model.newNull = function(it){
      var x$;
      x$ = this['new'](it);
      x$.defaultNull();
      return x$;
    };
    Model.where = function(it){
      return this._collection.find(it);
    };
    Model.mine = function(){
      return this.where({
        ownerId: My.userId()
      });
    };
    Model.destroyMine = function(){
      return Meteor.call("instance_destroy_mine", this._collection._name.toProperCase());
    };
    Model.storeGet = function(){
      return this['new'](Store.get("instance_" + this.displayName.toLowerCase()));
    };
    Model.serialize = function(it){
      return this['new'](listToObj(map(function(it){
        return [it.name, it.value];
      }, $(it).serializeArray())));
    };
    return Model;
  }(Point, Storer, Lock, Check, Default, Clone));
  collect('locations', function(it){
    var x$;
    x$ = Location['new'](it);
    x$.set("distance", x$.geoPlot());
    return x$;
  });
  Location = (function(superclass){
    var prototype = extend$((import$(Location, superclass).displayName = 'Location', Location), superclass).prototype, constructor = Location;
    Location._collection = Locations;
    Location._limit = 20;
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
        min: 5
      },
      street: {
        'default': "200 Main Street",
        required: true,
        max: 30,
        min: 5
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
        address: this.street + " " + this.city + " " + this.state + " " + this.zip
      }, function(results, status){
        var message, format, ref$, x$;
        if (status !== "OK") {
          message = "We couldn't seem to find your location. Did you enter your address correctly?";
          this$.alert(message);
          return typeof it === 'function' ? it(this$['throw'](message)) : void 8;
        } else {
          format = [(ref$ = values(results[0].geometry.location))[0], ref$[1]];
          this$.geo = format;
          x$ = this$;
          x$.alert(format);
          x$.save();
          return typeof it === 'function' ? it(null, format) : void 8;
        }
      }) : void 8;
    };
    prototype.geoPlot = function(){
      var m, g;
      m = (typeof My.userLoc === 'function' ? My.userLoc() : void 8) || {
        lat: 39,
        long: -94
      };
      g = this.geo;
      if (g != null) {
        return Math.round(distance(m.lat, m.long, g[0], g[1], "MMMMMMMMMM" / 10));
      }
    };
    function Location(){
      Location.superclass.apply(this, arguments);
    }
    return Location;
  }(Model));
  collect('tagsets', function(it){
    return it = Tagset['new'](it);
  });
  Tagset = (function(superclass){
    var prototype = extend$((import$(Tagset, superclass).displayName = 'Tagset', Tagset), superclass).prototype, constructor = Tagset;
    Tagset._collection = Tagsets;
    Tagset._limit = 5;
    Tagset._locks = {
      collection: function(){
        return (Tagset.displayName + "s").toLowerCase();
      }
    };
    Tagset._schema = {
      name: {
        'default': "see"
      },
      noun: {
        'default': "event"
      }
    };
    prototype.countTags = function(){
      return Tag.where({
        "tagset": this.name
      }).count();
    };
    function Tagset(){
      Tagset.superclass.apply(this, arguments);
    }
    return Tagset;
  }(Model));
  collect('tags', function(it){
    return Tag['new'](it);
  });
  Tag = (function(superclass){
    var prototype = extend$((import$(Tag, superclass).displayName = 'Tag', Tag), superclass).prototype, constructor = Tag;
    Tag._collection = Tags;
    Tag._limit = 20;
    Tag._locks = {
      ownerId: function(){
        return My.userId();
      },
      offerId: function(){
        return My.offerId();
      },
      tagset: function(){
        return My.tagset();
      },
      collection: function(){
        return (Tag.displayName + "s").toLowerCase();
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
    prototype.rateIt = function(){
      return this.rate = this.constructor.where({
        name: this.name
      }).count();
    };
    Tag.rateAll = function(it){
      var list, out, i$, ref$, len$, n, lout, key, val, x$, o;
      it == null && (it = {});
      list = this.where(it).fetch();
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
        x$ = o = find(fn1$, list);
        x$.rate = val;
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
    function Tag(){
      Tag.superclass.apply(this, arguments);
    }
    return Tag;
  }(Model));
  collect('offers', function(it){
    var x$;
    x$ = Offer['new'](it);
    x$.pointJam();
    x$.setNearest();
    return x$;
  });
  Offer = (function(superclass){
    var prototype = extend$((import$(Offer, superclass).displayName = 'Offer', Offer), superclass).prototype, constructor = Offer;
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
      published: {
        'default': false
      }
    };
    prototype.setNearest = function(){
      switch (false) {
      case this.locations == null:
        return this.nearest = minimum((function(){
          var i$, x$, ref$, len$, results$ = [];
          for (i$ = 0, len$ = (ref$ = this.locations).length; i$ < len$; ++i$) {
            x$ = ref$[i$];
            results$.push(x$.distance);
          }
          return results$;
        }.call(this)));
      }
    };
    Offer.loadStore = function(){
      var ref$, this$ = this;
      return (ref$ = this.handle) != null
        ? ref$
        : this.handle = Meteor.autorun(function(){
          var x$, y$;
          if (Session.get("subscribe_ready") === true) {
            switch (false) {
            case !!Offer.storeGet():
              break;
            case !this$.mine().count():
              x$ = My.offer();
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
  collect("pictures", function(it){
    return Picture['new'](it);
  });
  Picture = (function(superclass){
    var prototype = extend$((import$(Picture, superclass).displayName = 'Picture', Picture), superclass).prototype, constructor = Picture;
    Picture._collection = Pictures;
    Picture._limit = 10;
    Picture._locks = {
      ownerId: function(){
        return My.userId();
      },
      offerId: function(){
        return My.offerId();
      }
    };
    Picture._schema = {
      status: {
        'default': "active"
      },
      imgur: {
        'default': false
      },
      type: {
        'default': "jpg"
      },
      src: {
        'default': "http://i.imgur.com/YhUFTyA.jpg"
      }
    };
    prototype.activate = function(){
      Pictures.update({
        ownerId: this.ownerId,
        _id: {
          $nin: [this._id]
        }
      }, {
        $set: {
          status: "inactive",
          multi: true
        }
      });
      return Pictures.update(this._id, {
        $set: {
          status: "active"
        }
      });
    };
    prototype.deactivate = function(){
      this.status = "deactivated";
      return this.alert("Image successfully removed");
    };
    prototype.onUpload = function(err, res){
      if (err) {
        console.log("ERROR", err);
        return this.update({
          status: "failed"
        });
      } else {
        console.log("SUCCESS", res);
        return this.update({
          status: "active",
          src: res.data.link,
          imgur: true,
          deletehash: res.data.deletehash
        });
      }
    };
    prototype.onDelete = function(err, res){
      switch (false) {
      case !err:
        console.log("ERROR", err);
        break;
      case !res:
        console.log("SUCCESS", res);
      }
      return this.destroy();
    };
    function Picture(){
      Picture.superclass.apply(this, arguments);
    }
    return Picture;
  }(Model));
  collect("votes", function(it){
    return Vote['new'](it);
  });
  Vote = (function(superclass){
    var prototype = extend$((import$(Vote, superclass).displayName = 'Vote', Vote), superclass).prototype, constructor = Vote;
    Vote._collection = Votes;
    Vote._limit = 50;
    Vote._locks = {
      ownerId: function(){
        return My.userId();
      },
      setAt: function(){
        return Time.now();
      }
    };
    Vote.cast = function(it){
      var x$;
      window.o = this['new']({
        targetOffer: it._id,
        targetUser: it.ownerId
      });
      console.log(o);
      x$ = o;
      x$.lockSet();
      x$.save();
      return x$;
    };
    function Vote(){
      Vote.superclass.apply(this, arguments);
    }
    return Vote;
  }(Model));
  App.Model = {};
  App.Collection = {
    Users: new Meteor.Collection("userData"),
    Sorts: new Meteor.Collection("sorts"),
    Messages: new Meteor.Collection("messages"),
    Alerts: new Meteor.Collection("alerts")
  };
  for (key in ref$ = App.Collection) {
    val = ref$[key];
    My.env()[key] = val;
  }
  hasModel = ['Location', 'Offer', 'Tag', 'Tagset', 'Picture', 'Vote'];
  for (i$ = 0, len$ = hasModel.length; i$ < len$; ++i$) {
    g = hasModel[i$];
    m = App.Model[g] = eval(g);
    c = App.Collection[g + "s"] = eval(g + "s");
    My.env()[g] = m;
    results$.push(My.env()[g + "s"] = c);
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