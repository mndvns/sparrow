var slice$ = [].slice;
(function(){
  var hh;
  hh = Handlebars.registerHelper;
  hh("styleDate", function(date){
    if (date) {
      return moment(date).fromNow();
    } else {
      return moment().fromNow();
    }
  });
  hh("my", function(it){
    return typeof My != 'undefined' && My !== null ? typeof My[it] === 'function' ? My[it]() : void 8 : void 8;
  });
  hh("if_my", function(a, b){
    var ref$;
    return (ref$ = My[a]()) != null ? ref$[b] : void 8;
  });
  hh("my_tagset", function(){
    return My.tagset();
  });
  hh("store_tagset", function(){
    var ref$;
    return (ref$ = Offer.storeGet()) != null ? ref$['tagset'] : void 8;
  });
  hh("store_get", function(it){
    return Store.get(it);
  });
  hh("store-equals", function(a, b){
    if (Store.get(a) === b) {
      return true;
    }
  });
  hh("store-contains", function(a, b){
    return partialize$.apply(_, [_.contains, [void 8, b], [0]])(
    Store.get(a));
  });
  hh("store", function(method, a, b){
    b == null && (b = "");
    return Store[method](a, b);
  });
  hh("session", function(method, a, b){
    b == null && (b = "");
    return Session[method](a, b);
  });
  hh("is_customer", function(){
    return My.customerId() != null;
  });
  hh("count", function(collection){
    var ref$;
    return (ref$ = window[collection]) != null ? ref$.find().count() : void 8;
  });
  hh("pictures", function(){
    return typeof Pictures != 'undefined' && Pictures !== null ? Pictures.find() : void 8;
  });
  hh("tagsets", function(){
    return typeof Tagsets != 'undefined' && Tagsets !== null ? Tagsets.find() : void 8;
  });
  hh("tags_rated", function(){
    return typeof Tag != 'undefined' && Tag !== null ? Tag.rateAll({
      "tagset": My.tagset()
    }) : void 8;
  });
  hh("is_in", function(a, b){
    switch (false) {
    case b != null:
      return false;
    case !find((function(it){
        return it === a;
      }), b):
      return true;
    default:
      return false;
    }
  });
  hh("key_value", function(obj, fn){
    var buffer, key;
    buffer = "";
    key = void 8;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        buffer += fn({
          key: key,
          value: obj[key]
        });
      }
    }
    return buffer;
  });
  hh("each_with_key", function(obj, fn){
    var context, buffer, key, keyName;
    context = void 8;
    buffer = "";
    key = void 8;
    keyName = fn.hash.key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        context = obj[key];
        if (keyName) {
          context[keyName] = key;
        }
        buffer += fn(context);
      }
    }
    return buffer;
  });
  hh("equal", function(a, b){
    return a === b;
  });
  hh("dropDecimal", function(a){
    return a != null ? a.toString().split(".")[0] : void 8;
  });
  hh("gray", function(a){
    return Store.get("gray") === a;
  });
  hh("el", function(el, content){
    var result;
    result = "<" + el + ">" + content + "</" + el + ">";
    return new Handlebars.SafeString(result);
  });
  hh("page_next", function(area){
    var shift_sub_area, parse_sub_area;
    shift_sub_area = Session.get("shift_sub_area");
    if (area !== shift_sub_area) {
      return false;
    }
    parse_sub_area = shift_sub_area.split("_").join("/");
    Meteor.Transitioner.setOptions({
      after: function(){
        Meteor.Router.to(shift_sub_area === "home"
          ? "/"
          : "/" + parse_sub_area);
        return Session.set("shift_sub_area", null);
      }
    });
    return shift_sub_area;
  });
  hh("sublink", function(page, link){
    var store_page;
    store_page = Store.get("page_" + page);
    if (store_page === page + "_" + link) {
      return page + "/" + link;
      return console.log(page + "/" + link);
    }
  });
  hh("next_page", function(){
    var shift_sub_area, parse_sub_area;
    shift_sub_area = Session.get("shift_sub_area");
    if (!shift_sub_area) {
      return;
    }
    parse_sub_area = shift_sub_area.split("_").join("/");
    Meteor.Transitioner.setOptions({
      after: function(){
        Meteor.Router.to(shift_sub_area === "home"
          ? "/"
          : "/" + parse_sub_area);
        return Session.set("shift_sub_area", null);
      }
    });
    return Template[shift_sub_area]();
  });
  hh("show_block", function(template_name){
    var sub_area, page, show;
    sub_area = Session.get("shift_sub_area");
    page = Meteor.Router.page();
    switch (template_name) {
    case sub_area:
      show = Store.get("show_" + sub_area);
      break;
    case page:
      show = Store.get("show_" + page);
    }
    return typeof Template != 'undefined' && Template !== null ? typeof Template[show] === 'function' ? Template[show]() : void 8 : void 8;
  });
  hh("textareaRows", function(id){
    var el, $el, line_height, height;
    el = document.getElementById(id);
    $el = $(el);
    if (el && $el.length) {
      line_height = parseInt($el.css("line-height"));
      height = el != null ? el.scrollHeight : void 8;
      return Math.floor(height / line_height);
    }
  });
  hh("numberWithCommas", function(number){
    return numberWithCommas(number);
  });
  hh("json", function(context){
    var clean;
    clean = _.omit(context, "_id");
    return JSON.stringify(clean, null, '\t');
  });
  hh("key_count", function(context, add){
    return Object.keys(context).length + add;
  });
  return hh("area", function(method, field, index){
    if (!index) {
      return App.Area[method](field);
    } else {
      return App.Area.at(index)[method](field);
    }
  });
})();
function partialize$(f, args, where){
  var context = this;
  return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ?
      partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
  };
}