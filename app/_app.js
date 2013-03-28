var type, My;
type = function(it){
  var classToType, i$, ref$, len$, name, myClass;
  if (it == null) {
    return String(it);
  }
  classToType = new Object;
  for (i$ = 0, len$ = (ref$ = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp']).length; i$ < len$; ++i$) {
    name = ref$[i$];
    classToType["[object " + name + "]"] = name.toLowerCase();
  }
  myClass = Object.prototype.toString.call(it);
  if (myClass in classToType) {
    return classToType[myClass];
  }
  return "object";
};
My = {
  env: function(){
    switch (false) {
    case !Meteor.isServer:
      return global;
    case !Meteor.isClient:
      return window;
    }
  },
  user: function(){
    switch (false) {
    case !Meteor.isServer:
      return Meteor.user();
    case !Meteor.isClient:
      return Meteor.user();
    }
  },
  userId: function(){
    switch (false) {
    case !Meteor.isServer:
      return Meteor.userId();
    case !Meteor.isClient:
      return Meteor.userId();
    }
  },
  userLoc: function(){
    return typeof Store != 'undefined' && Store !== null ? Store.get("user_loc") : void 8;
  },
  customer: function(){
    return Customers.findOne({
      ownerId: this.userId()
    });
  },
  customerId: function(){
    var ref$;
    return (ref$ = this.customer()) != null ? ref$.id : void 8;
  },
  offer: function(){
    return typeof Offers != 'undefined' && Offers !== null ? Offers.findOne({
      ownerId: this.userId()
    }) : void 8;
  },
  offerId: function(){
    var ref$;
    return (ref$ = this.offer()) != null ? ref$._id : void 8;
  },
  market: function(){
    return Markets.findOne({
      ownerId: this.userId()
    });
  },
  tags: function(){
    return typeof Tags != 'undefined' && Tags !== null ? Tags.find({
      ownerId: this.userId()
    }).fetch() : void 8;
  },
  tagset: function(){
    var ref$;
    return (ref$ = this.offer()) != null ? ref$.tagset : void 8;
  },
  locations: function(){
    return typeof Locations != 'undefined' && Locations !== null ? Locations.find({
      ownerId: this.userId()
    }).fetch() : void 8;
  },
  pictures: function(){
    return typeof Pictures != 'undefined' && Pictures !== null ? Pictures.find({
      ownerId: this.userId()
    }).fetch() : void 8;
  },
  alert: function(){
    var ref$;
    return typeof Alerts != 'undefined' && Alerts !== null ? (ref$ = Alerts.findOne({
      ownerId: this.userId()
    })) != null ? ref$._id : void 8 : void 8;
  },
  prompts: function(){
    return typeof Prompts != 'undefined' && Prompts !== null ? Prompts.find().fetch() : void 8;
  },
  init: function(klass, obj){
    obj == null && (obj = {});
    return this[klass]() || this.env()[klass.toProperCase()]['new'](obj);
  },
  map: curry$(function(field, list){
    return map(function(it){
      return it[field];
    }, typeof this[list] === 'function' ? this[list]() : void 8);
  })
};
Meteor.methods({
  upvoteEvent: function(offer){
    if (typeof this.unblock === 'function') {
      this.unblock();
    }
    Offers.update(offer._id, {
      $push: {
        votes_meta: {
          user: this.userId,
          exp: Time.now()
        }
      },
      $inc: {
        votes_count: 1
      }
    });
    return Meteor.users.update(offer.owner, {
      $inc: {
        karma: 1
      }
    });
  },
  instance_destroy_mine: function(it){
    return My.env()[it].remove({
      ownerId: My.userId()
    });
  }
});
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