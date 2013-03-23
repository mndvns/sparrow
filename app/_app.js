var type, My;
type = function(obj){
  var classToType, i$, ref$, len$, name, myClass;
  if (obj == null) {
    return String(obj);
  }
  classToType = new Object;
  for (i$ = 0, len$ = (ref$ = "Boolean Number String Function Array Date RegExp".split(" ")).length; i$ < len$; ++i$) {
    name = ref$[i$];
    classToType["[object " + name + "]"] = name.toLowerCase();
  }
  myClass = Object.prototype.toString.call(obj);
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
      return typeof Meteor.userId === 'function' ? Meteor.userId() : void 8;
    case !Meteor.isClient:
      return Meteor.userId();
    }
  },
  userLoc: function(){
    return typeof Store != 'undefined' && Store !== null ? Store.get("user_loc") : void 8;
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
  map: curry$(function(field, list){
    return map(function(it){
      return it[field];
    }, typeof this[list] === 'function' ? this[list]() : void 8);
  })
};
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