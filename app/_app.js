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
    if (Meteor.isServer) {
      return global;
    }
    if (Meteor.isClient) {
      return window;
    }
  },
  user: function(){
    return Meteor.user() || this.user();
  },
  userId: function(){
    if (Meteor.isServer) {
      return Meteor.userId();
    }
    if (Meteor.isClient) {
      return Meteor.userId();
    }
  },
  userLoc: function(){
    if (Meteor.isClient) {
      return Store.get("user_loc");
    }
  },
  offer: function(){
    return typeof Offers != 'undefined' && Offers !== null ? Offers.findOne({
      ownerId: Meteor.userId() || this.userId
    }) : void 8;
  },
  offerId: function(){
    var ref$;
    if (Meteor.isServer) {
      return typeof Offers != 'undefined' && Offers !== null ? (ref$ = Offers.findOne({
        ownerId: this.userId
      })) != null ? ref$._id : void 8 : void 8;
    }
    if (Meteor.isClient) {
      return typeof Offers != 'undefined' && Offers !== null ? (ref$ = Offers.findOne({
        ownerId: Meteor.userId()
      })) != null ? ref$._id : void 8 : void 8;
    }
  },
  tags: function(){
    return typeof Tags != 'undefined' && Tags !== null ? Tags.find({
      ownerId: this.userId()
    }).fetch() : void 8;
  },
  locations: function(){
    return typeof Locations != 'undefined' && Locations !== null ? Locations.find({
      ownerId: this.userId()
    }).fetch() : void 8;
  },
  alert: function(){
    var ref$;
    return (ref$ = App.Collection.Alerts.findOne({
      ownerId: this.userId()
    })) != null ? ref$._id : void 8;
  }
};