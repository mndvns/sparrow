Handlebars.registerHelper("nab", function(){
  var nab, nab_query, nab_sort, nab_pick1, nab_pick2, result, ref$;
  nab = Store.get("nab");
  nab_query = Store.get("nab_query");
  nab_sort = Store.get("nab_sort");
  nab_pick1 = Store.get("nab_pick1");
  nab_pick2 = Store.get("nab_pick2");
  result = (ref$ = window[nab]) != null ? ref$.find(nab_query, nab_sort).map(function(d){
    var pick, id;
    if (d[nab_pick1] || d[nab_pick2]) {
      pick = _.pick(d, nab_pick1, nab_pick2);
      id = _.pick(d, '_id');
      d = _.extend(pick, id);
    }
    return d;
  }) : void 8;
  return result;
});
Template.editor.events({
  'click .save': function(event, tmpl){
    var save_type, collection, rawtext, ref$, text;
    event.preventDefault();
    save_type = event.currentTarget.getAttribute("data-save-type");
    collection = Store.get("nab").toProperCase();
    rawtext = (ref$ = $(tmpl.find("[data-text-type*=" + save_type + "]"))) != null ? ref$.val() : void 8;
    text = typeof textarea === 'function' ? textarea(JSON.parse(textarea)) : void 8;
    switch (save_type) {
    case "update":
      return window[collection].update(this._id, {
        $set: text
      });
    case "insert":
      return window[collection].insert(text);
    case "remove":
      return window[collection].remove(this._id);
    case "unset":
      return window[collection].update(this._id, {
        $unset: text
      });
    case "unset-all":
      return window[collection].update({}, {
        $unset: text
      }, {
        multi: true
      });
    case "set":
      return window[collection].update(this._id, {
        $set: text
      });
    case "set-all":
      return window[collection].update({}, {
        $set: text
      }, {
        multi: true
      });
    }
  }
});
Template.admin_section.events({
  'keyup .selector': function(event, tmpl){
    var target, text, selector, type, status, out, error;
    target = $(event.currentTarget);
    text = target.val();
    selector = target.attr("id");
    type = target.attr("data-selector-type");
    status = target.siblings();
    switch (type) {
    case "mongo":
      if (!text) {
        out = {};
      } else {
        try {
          out = JSON.parse(text);
        } catch (e$) {
          error = e$;
          status.addClass("error");
          return false;
        }
      }
      break;
    case "underscore":
      if (!text) {
        out = false;
      } else {
        out = text;
      }
    }
    status.removeClass("error");
    return Store.set("nab_" + selector, out);
  }
});
Template.mocha.rendered = function(){
  var expect, cb;
  if (Session.get("rendered_wrapper")) {
    if (window.mochaPhantomJS) {
      expect = chai.expect;
      return mochaPhantomJS.run();
    } else {
      cb = function(){};
      return mocha.run(cb);
    }
  }
};
Template.mocha.events({
  'change input': function(event, tmpl){
    var tar, type;
    tar = $(event.currentTarget);
    type = tar.attr("data-type");
    return Store.set("test_" + type, tar.val());
  }
});
Template.stats.helpers({
  "myOffers": function(event, tmpl){
    return typeof Offer != 'undefined' && Offer !== null ? Offer.mine().count() : void 8;
  },
  "myLocations": function(event, tmpl){
    return typeof Location != 'undefined' && Location !== null ? Location.mine().count() : void 8;
  }
});