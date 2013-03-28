A.Area = {
  area: function(){
    var page;
    page = Meteor.Router.page().split("_");
    if (this.index) {
      return [page[this.index]];
    } else {
      return page;
    }
  },
  verify: function(){
    return _.intersection(this.area(), arguments).length !== 0;
  },
  has: function(fields){
    return this.verify(fields);
  },
  is: function(field){
    return this.area().toString() === field;
  },
  at: function(index){
    this.index = index;
    return this;
  },
  get: function(){
    return this.area();
  }
};
Meteor.Router.add({
  "/": function(){
    Session.set("shift_current", "home");
    return "home";
  },
  "/access/*": function(){
    var urlParams;
    console.log("YOOOOOOOOO");
    urlParams = {};
    (function(){
      var compare, pl, search, decode, query, results$ = [];
      compare = void 8;
      pl = /\+/g;
      search = /([^&=]+)=?([^&]*)/g;
      decode = function(s){
        return decodeURIComponent(s.replace(pl, " "));
      };
      query = window.location.search.substring(1);
      console.log("QUERY", query);
      while (compare = search.exec(query)) {
        results$.push(urlParams[decode(compare[1])] = decode(compare[2]));
      }
      return results$;
    })();
    console.log('PARAMS', urlParams);
    Meteor.call('market_oauth', urlParams.code, function(){
      return window.close();
    });
    return "account_earnings_dashboard";
  },
  "/:area": function(area){
    var store_page;
    Session.set("shift_current", area);
    store_page = Store.get("page_" + area);
    if (store_page) {
      return store_page;
    }
    return area;
  },
  "/:area/:link": function(area, link){
    var store_page;
    Session.set("shift_current", area);
    store_page = Store.get("page_" + area + "_" + link);
    if (store_page) {
      return store_page;
    }
    return area + "_" + link;
  },
  "/:area/:link/:sublink": function(area, link, sublink){
    var sub_area;
    sub_area = area + "_" + link + "_" + sublink;
    Session.set("shift_current", area);
    if (link === "collections") {
      Store.set("nab", sublink.toProperCase());
      Store.set("nab_query", {});
      Store.set("nab_sort", {});
    }
    return sub_area;
  },
  "/offer/:id": function(id){
    Session.set("showThisOffer", Offers.findOne({
      business: id
    }));
    Session.set("header", null);
    return "thisOffer";
  },
  "/*": function(){
    Session.set("shift_current", "home");
    return "404";
  }
});
Meteor.Router.filters({
  checkLoggedIn: function(page){
    if (Meteor.user()) {
      return page;
    } else {
      return "home";
    }
  },
  checkAdmin: function(page){
    var user;
    user = Meteor.user();
    if (user.type === "basic") {
      return page;
    } else {
      return "home";
    }
  }
});
Meteor.Router.filter("checkLoggedIn", {
  only: ["account"]
});
Meteor.Router.filter("checkAdmin", {
  only: ["/admin/users"]
});