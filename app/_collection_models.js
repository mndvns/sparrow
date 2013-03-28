var toString$ = {}.toString;
(function(){
  var MC, AC, ENV, CALL, ISSERVER, ISCLIENT, MIX, Model, METHODS, GENERATE, MM, this$ = this;
  MC = Meteor.Collection;
  AC = App.Collection = {};
  ENV = My.env();
  CALL = Meteor.call;
  switch (false) {
  case !Meteor.isServer:
    ISSERVER = true;
    break;
  case !Meteor.isClient:
    ISCLIENT = true;
  }
  ENV.Users = AC.Users = new MC("userData");
  ENV.Sorts = AC.Sorts = new MC("sorts");
  ENV.Messages = AC.Messages = new MC("messages");
  ENV.Alerts = AC.Alerts = new MC("alerts");
  MIX = {
    Check: {
      checkChar: function(it){
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
      },
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
          return this$.checkChar(it);
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
      checkList: function(it){
        var i$, len$, i, results$ = [];
        for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
          i = it[i$];
          results$.push(this.checkField(i));
        }
        return results$;
      },
      checkSet: function(){
        var n, out, ref$, k, v, key$;
        n = toString$.call(arguments[0]).slice(8, -1) === "Arguments"
          ? arguments
          : arguments[0];
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
      },
      checkSave: function(){
        var this$ = this;
        switch (false) {
        case !this.isPersisted():
          return this.checkSet(arguments, function(it){
            return this$.constructor._collection.update(this$._id, {
              $set: it
            });
          });
        default:
          return this['throw'](this.constructor.name + " must save before set-saving");
        }
      }
    },
    Default: {
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
    },
    Limit: {
      limitGuard: function(){
        if (!this.isPersisted() && this.constructor._limit - this.constructor.mine().count() <= 0) {
          return this['throw']("Collection at limit");
        }
      }
    },
    Lock: {
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
    },
    Store: {
      storeMethod: function(){
        return typeof Store != 'undefined' && Store !== null ? Store[arguments[0]]("instance_" + this.constructor.displayName.toLowerCase(), arguments[1]) : void 8;
      },
      storeSet: function(){
        return this.set(arguments[0], arguments[1]) && this.storeMethod("set", this);
      },
      storeClear: function(){
        return this.storeMethod("set", null);
      },
      storeGet: function(){
        return this.storeMethod("get", null);
      }
    },
    Cite: {
      citeSet: function(arg$, q, method, cb){
        var field, list, attr, col, ref$;
        field = arg$.field, list = arg$.list, attr = arg$.attr;
        col = ENV[list.toProperCase()].find((ref$ = {}, ref$[[q[0]]] = this[q[1]], ref$))[method]();
        if (field !== list) {
          col = map(function(it){
            return it[field];
          }, col);
        }
        if (cb != null) {
          col = cb(col);
        }
        return this[attr] = col;
      },
      citeJam: function(){
        var i$, ref$, len$, p, results$ = [];
        for (i$ = 0, len$ = (ref$ = this.constructor._cites).length; i$ < len$; ++i$) {
          p = ref$[i$];
          results$.push(this.citeSet(p[0], p[1], p[2], p[3]));
        }
        return results$;
      }
    },
    Clone: {
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
    },
    Is: {
      isPersisted: function(){
        return this._id != null;
      },
      isStructured: function(){
        return this.constructor._schema != null;
      },
      isLocked: function(){
        return this.constructor._locks != null;
      },
      isLimited: function(){
        return this.constructor._limit != null;
      },
      isCorrect: function(){
        var x$, y$, z$;
        if (this.isLocked()) {
          x$ = this;
          x$.lockSet();
          x$.lockCheck();
        }
        if (this.isLimited()) {
          y$ = this;
          y$.limitGuard();
        }
        if (this.isStructured()) {
          z$ = this;
          z$.checkList(keys(filter(function(it){
            return it.required;
          }, this.constructor._schema)));
          return z$;
        }
      }
    }
  };
  Model = (function(){
    Model.displayName = 'Model';
    var prototype = Model.prototype, constructor = Model;
    importAll$(prototype, arguments[0]);
    importAll$(prototype, arguments[1]);
    function Model(it){
      _.extend(this, it);
    }
    prototype['throw'] = function(it){
      throw new Error(it);
    };
    prototype.alert = function(it){
      switch (false) {
      case ISSERVER == null:
        return new Alert({
          text: it
        });
      case ISCLIENT == null:
        return Meteor.Alert.set({
          text: it
        });
      }
    };
    prototype.set = function(){
      return this[arguments[0]] = arguments[1];
    };
    prototype.update = function(){
      var k, v;
      return (function(args$){
        var ref$, results$ = [];
        for (k in ref$ = args$[0]) {
          v = ref$[k];
          results$.push(this[k] = v);
        }
        return results$;
      }.call(this, arguments)) && this.save(arguments[1]);
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
    prototype.save = function(it){
      var e;
      try {
        this.isCorrect();
      } catch (e$) {
        e = e$;
        this.alert(e != null ? e.message : void 8);
        if (typeof it === 'function') {
          it(e.message);
        }
        return;
      }
      this.upsert();
      this.alert("Successfully saved " + this.constructor.name.toLowerCase());
      return typeof it === 'function' ? it(void 8, this) : void 8;
    };
    prototype.destroy = function(){
      if (this.isPersisted()) {
        this.constructor._collection.remove(this._id) && (this._id = null);
      }
      return typeof this.storeClear === 'function' ? this.storeClear() : void 8;
    };
    Model['new'] = function(){
      return new this(arguments[0]);
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
      return CALL("instance_destroy_mine", this._collection._name.toProperCase());
    };
    Model.serialize = function(it){
      return this['new'](listToObj(map(function(it){
        return [it.name, it.value];
      }, $(it).serializeArray())));
    };
    return Model;
  }(MIX.Lock, MIX.Is));
  METHODS = {
    shared: {},
    server: {},
    client: {}
  };
  GENERATE = function(arg$){
    var K, C, S, F, M, object, Coll, Klass, i$, ref$, len$, m, s, v, f, mName;
    K = arg$[0], C = arg$[1], S = arg$[2], F = arg$[3], M = arg$[4];
    object = clone$(K.klass);
    object = (function(superclass){
      var prototype = extend$((import$(object, superclass).displayName = 'object', object), superclass).prototype, constructor = object;
      function object(){
        object.superclass.apply(this, arguments);
      }
      return object;
    }(Model));
    switch (false) {
    case C.scratch == null:
      Coll = null;
      break;
    default:
      Coll = C.coll.toLowerCase();
    }
    Klass = ENV[K.klass] = object;
    Klass._collection = ENV[C.coll] = AC[C.coll] = new MC(Coll, {
      transform: C.trans
    });
    if (K.mix.length != null) {
      for (i$ = 0, len$ = (ref$ = K.mix).length; i$ < len$; ++i$) {
        m = ref$[i$];
        importAll$(Klass.prototype, MIX[m]);
      }
    }
    if (S) {
      for (s in S) {
        v = S[s];
        Klass["_" + s] = v;
      }
    }
    if (F != null && F.proto) {
      for (f in ref$ = F.proto) {
        v = ref$[f];
        Klass.prototype[f] = v;
      }
    }
    if (F != null && F.method) {
      for (f in ref$ = F.method) {
        v = ref$[f];
        Klass[f] = v;
      }
    }
    if (M) {
      for (i$ = 0, len$ = M.length; i$ < len$; ++i$) {
        m = M[i$];
        mName = (K.klass.toLowerCase() + "_" + m.name).toString();
        switch (m.type) {
        case 'proto':
          Klass.prototype[m.name] = fn$;
          break;
        case 'method':
          Klass[m.name] = fn1$;
        }
        METHODS[m.side][mName] = m.func;
      }
    }
    return Klass;
    function fn$(it){
      return CALL(mName, it);
    }
    function fn1$(it){
      return CALL(mName, it);
    }
  };
  GENERATE([
    {
      klass: 'Location',
      mix: ['Check', 'Limit']
    }, {
      coll: 'Locations',
      trans: function(it){
        var x$;
        x$ = Location['new'](it);
        x$.set("distance", x$.geoPlot());
        return x$;
      }
    }, {
      limit: 20,
      locks: {
        ownerId: function(){
          return My.userId();
        },
        offerId: function(){
          return My.offerId();
        }
      },
      schema: {
        "geo": {
          'default': [47, -122],
          required: true,
          max: 2,
          min: 2
        },
        "city": {
          'default': "Kansas City",
          required: true,
          max: 30,
          min: 5
        },
        "street": {
          'default': "200 Main Street",
          required: true,
          max: 30,
          min: 5
        },
        "state": {
          'default': "MO",
          required: true,
          max: 2,
          min: 2
        },
        "zip": {
          'default': "64105",
          required: true,
          max: 5,
          min: 5
        }
      }
    }, {
      proto: {
        geoMap: function(it){
          var e, ref$, this$ = this;
          try {
            this.checkList(['city', 'street', 'state', 'zip']);
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
        },
        geoPlot: function(){
          var m, g;
          m = (typeof My.userLoc === 'function' ? My.userLoc() : void 8) || {
            lat: 39,
            long: -94
          };
          g = this.geo;
          if (g != null) {
            return Math.round(distance(m.lat, m.long, g[0], g[1], "MMMMMMMMMM" / 10));
          }
        }
      }
    }, [{
      name: 'rargo',
      side: 'shared',
      type: 'proto',
      func: function(){
        return console.log("RARGOOOOOOOOO");
      }
    }]
  ]);
  GENERATE([
    {
      klass: 'Tagset',
      mix: ['Check', 'Limit']
    }, {
      coll: 'Tagsets',
      trans: function(it){
        return Tagset['new'](it);
      }
    }, {
      limit: 5,
      locks: {
        collection: function(){
          return (this$.displayName + "s").toLowerCase();
        }
      },
      schema: {
        "name": {
          'default': "see"
        },
        "noun": {
          'default': "event"
        }
      }
    }, {
      proto: {
        "count-tags": function(){
          return Tag.where({
            "tagset": this.name
          }).count();
        }
      }
    }
  ]);
  GENERATE([
    {
      klass: 'Tag',
      mix: ['Check', 'Limit', 'Clone']
    }, {
      coll: 'Tags',
      trans: function(it){
        return Tag['new'](it);
      }
    }, {
      limit: 20,
      locks: {
        ownerId: function(){
          return My.userId();
        },
        offerId: function(){
          return My.offerId() || 'pending';
        },
        tagset: function(){
          return My.tagset();
        },
        collection: function(){
          return (this$.displayName + "s").toLowerCase();
        }
      },
      schema: {
        "name": {
          'default': "tag",
          required: true,
          max: 20,
          min: 2
        },
        "tagset": {
          'default': "eat",
          required: true,
          max: 10,
          min: 2
        }
      }
    }, {
      proto: {
        rateIt: function(){
          return this.rate = this.constructor.where({
            name: this.name
          }).count();
        }
      },
      method: {
        rateAll: function(it){
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
        }
      }
    }
  ]);
  GENERATE([
    {
      klass: 'Prompt',
      mix: []
    }, {
      coll: 'Prompts',
      scratch: true,
      trans: function(it){
        return Prompt['new'](it);
      }
    }, {
      locks: {
        ownerId: function(){
          return My.userId();
        },
        setAt: function(){
          return Time.now();
        }
      }
    }, {
      method: {
        target: function(it){
          return this['new']({
            targetId: it
          });
        },
        test: function(it){
          return in$(it, map(function(it){
            return it.targetId;
          }, My.prompts()));
        }
      }
    }
  ]);
  GENERATE([
    {
      klass: 'Offer',
      mix: ['Check', 'Limit', 'Cite', 'Store', 'Default']
    }, {
      coll: 'Offers',
      trans: function(it){
        var x$;
        x$ = Offer['new'](it);
        x$.citeJam();
        x$.setNearest();
        return x$;
      }
    }, {
      limit: 1,
      cites: [
        [
          {
            field: "name",
            list: "tags",
            attr: "tags"
          }, ['ownerId', 'ownerId'], 'fetch'
        ], [
          {
            field: "locations",
            list: "locations",
            attr: "locations"
          }, ['ownerId', 'ownerId'], 'fetch'
        ], [
          {
            field: "points",
            list: "points",
            attr: "points"
          }, ['targetOffer', '_id'], 'count'
        ], [
          {
            field: "markets",
            list: "markets",
            attr: "market"
          }, ['offerId', '_id'], 'fetch', function(it){
            return it[0];
          }
        ]
      ],
      locks: {
        ownerId: function(){
          return My.userId();
        },
        updatedAt: function(){
          return Time.now();
        }
      },
      schema: {
        "business": {
          'default': "your business/vendor name",
          required: true,
          max: 30,
          min: 3
        },
        "description": {
          'default': "This is a description of the offer. Since the offer name must be very brief, this is the place to put any details you want to include.",
          required: true,
          max: 140,
          min: 3
        },
        "image": {
          'default': "http       : //i.imgur.com/YhUFTyA.jpg"
        },
        "locations": {
          'default': []
        },
        "name": {
          'default': "Offer",
          required: true,
          max: 15,
          min: 3
        },
        "price": {
          'default': 10,
          required: true,
          min: 3,
          max: 2000
        },
        "published": {
          'default': false
        }
      }
    }, {
      proto: {
        setNearest: function(){
          if (this.locations != null) {
            return this.nearest = minimum((function(){
              var i$, x$, ref$, len$, results$ = [];
              for (i$ = 0, len$ = (ref$ = this.locations).length; i$ < len$; ++i$) {
                x$ = ref$[i$];
                results$.push(x$.distance);
              }
              return results$;
            }.call(this)));
          }
        }
      },
      method: {
        getStore: function(){
          return this['new'](Store.get("instance_" + this.displayName.toLowerCase()));
        },
        loadStore: function(){
          var this$ = this;
          return Meteor.autorun(function(){
            var x$, y$;
            if (Session.get("subscribe_ready") === true) {
              console.log("LOAD STORE");
              switch (false) {
              case Offer.getStore() != null:
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
        }
      }
    }
  ]);
  GENERATE([
    {
      klass: 'Point',
      mix: []
    }, {
      coll: 'Points',
      trans: function(it){
        return Point['new'](it);
      }
    }, {
      locks: {
        ownerId: function(){
          return My.userId();
        },
        setAt: function(){
          return Time.now();
        }
      }
    }, {
      method: {
        cast: function(it){
          var x$;
          x$ = this['new']({
            targetOffer: it._id,
            targetUser: it.ownerId
          });
          x$.save();
          return x$;
        }
      }
    }
  ]);
  MIX.Prompt = {
    promptTarget: function(it){
      return this.set('prompt', Prompt['new']({
        targetId: it
      }));
    }
  };
  GENERATE([
    {
      klass: 'Market',
      mix: ['Limit', 'Prompt']
    }, {
      coll: 'Markets',
      trans: function(it){
        return Market['new'](it);
      }
    }, {
      limit: 1,
      locks: {
        ownerId: function(){
          return My.userId();
        },
        offerId: function(){
          return My.offerId();
        }
      }
    }, {
      proto: {
        findOffer: function(){
          return Offers.findOne({
            _id: this.offerId
          });
        },
        createTokenCustomer: function(card){
          return CALL('stripe_token_create', card, function(err, res){
            console.log("GOT HERE");
            if (err) {
              console.log("ERROR", err);
            }
            if (res) {
              console.log('SUCCESS', 'create-token');
              console.log('ERR?', err);
              return console.log('RES?', res);
            }
          });
        },
        createPurchase: function(){
          var offer, access_token, amount;
          offer = this.findOffer();
          access_token = this.access_token;
          amount = parseInt(offer.price);
          return CALL('purchase_create', access_token, amount, function(err, res){
            var p, x$;
            if (err) {
              throw err;
            } else {
              p = {
                charge: res,
                offer: offer,
                sellerId: offer.ownerId,
                status: "active"
              };
              x$ = Purchase['new'](p);
              x$.save();
              return console.log(err, res, 'SUCCESS', "purchase_create");
            }
          });
        }
      }
    }, [{
      name: 'oauth',
      side: 'server',
      type: 'method',
      func: function(it){
        var out;
        out = {
          data: {
            client_secret: stripeClientSecret,
            code: it,
            grant_type: "authorization_code"
          }
        };
        return Meteor.http.call("POST", "https://connect.stripe.com/oauth/token", out, function(err, res){
          var fields, x$;
          if (err) {
            return console.log("ERROR", err);
          } else {
            console.log("SUCCESS", res);
            fields = {
              access_token: res.data.access_token,
              refresh_token: res.data.refresh_token,
              stripe_publishable_key: res.data.stripe_publishable_key,
              stripe_user_id: res.data.stripe_user_id
            };
            if (My.market() != null) {
              return My.market().update(fields);
            } else {
              x$ = Market['new'](fields);
              x$.save();
              return x$;
            }
          }
        });
      }
    }]
  ]);
  GENERATE([
    {
      klass: 'Customer',
      mix: ['Limit']
    }, {
      coll: 'Customers',
      trans: function(it){
        return Customer['new'](it);
      }
    }, {
      limit: 1,
      locks: {
        ownerId: function(){
          return My.userId();
        }
      }
    }, 0, [
      {
        name: 'create',
        side: 'server',
        type: 'method',
        func: function(token){
          var out, f;
          console.log("GOT HERE IN CUST CREATE");
          out = {
            card: function(){
              return StripeAPI(stripeClientSecret);
            }(),
            description: "A happy customer"
          };
          f = new Future();
          stripe.customers.create(out, function(err, res){
            if (err) {
              console.log("ERR", err);
              return f['return'](err);
            } else {
              console.log("RES", res);
              return f['return'](res);
            }
          });
          return f.wait();
        }
      }, {
        name: 'save',
        side: 'server',
        type: 'method',
        func: function(customer){
          var f, myCust;
          f = new Future();
          myCust = typeof My.customer === 'function' ? My.customer() : void 8;
          if (myCust) {
            console.log("CUSTOMER ALREADY");
            myCust.update(customer, function(err, res){
              if (err) {
                throw err;
              }
              console.log("UPDATED CUSTOMER", res);
              return f['return'](err, res);
            });
          } else {
            console.log("NO CUSTOMER");
            Customer['new'](customer).save(function(err, res){
              if (err) {
                throw err;
              }
              console.log("CREATED NEW CUSTOMER", res);
              return f['return'](err, res);
            });
          }
          return f.wait();
        }
      }
    ]
  ]);
  GENERATE([
    {
      klass: 'Purchase',
      mix: []
    }, {
      coll: 'Purchases',
      trans: function(it){
        return Purchase['new'](it);
      }
    }, {
      limit: 1000,
      locks: {
        ownerId: function(){
          return My.userId();
        }
      }
    }, 0, [{
      name: 'create',
      side: 'server',
      type: 'method',
      func: function(access_token, amount){
        var stripe, out, f;
        stripe = StripeAPI(access_token);
        out = {};
        out.amount = function(){
          return amount * 100;
        }();
        out.application_fee = function(){
          return amount * 5;
        }();
        out.currency = "USD";
        out.customer = function(){
          return My.customerId();
        }();
        f = new Future();
        stripe.charges.create(out, function(err, res){
          if (err) {
            console.log("ERR", err);
            return f['return'](err);
          } else {
            console.log("RES", res);
            return f['return'](res);
          }
        });
        return f.wait();
      }
    }]
  ]);
  GENERATE([
    {
      klass: 'Picture',
      mix: ['Check']
    }, {
      coll: 'Pictures',
      trans: function(it){
        return Picture['new'](it);
      }
    }, {
      locks: {
        ownerId: function(){
          return My.userId();
        },
        offerId: function(){
          return My.offerId();
        }
      },
      schema: {
        "status": {
          'default': "active"
        },
        "imgur": {
          'default': false
        },
        "type": {
          'default': "jpg"
        },
        "src": {
          'default': "http://i.imgur.com/YhUFTyA.jpg"
        }
      }
    }, {
      proto: {
        activate: function(){
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
        },
        deactivate: function(){
          this.status = "deactivated";
          return this.alert("Image successfully removed");
        },
        onUpload: function(err, res){
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
        },
        onDelete: function(err, res){
          switch (false) {
          case !err:
            console.log("ERROR", err);
            break;
          case !res:
            console.log("SUCCESS", res);
          }
          return this.destroy();
        }
      }
    }
  ]);
  MM = Meteor.methods;
  MM(METHODS.shared);
  switch (false) {
  case !ISCLIENT:
    return MM(METHODS.client);
  case !ISSERVER:
    return MM(METHODS.server);
  }
})();
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
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
function in$(x, arr){
  var i = -1, l = arr.length >>> 0;
  while (++i < l) if (x === arr[i] && i in arr) return true;
  return false;
}