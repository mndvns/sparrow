var HeroList;
HeroList = function(opt){
  var fontSize, chars, ref$, key$, hero, list, item, active, inactive;
  fontSize = void 8;
  chars = _.flatten(opt.current).toString().length;
  (ref$ = opt.current)[key$ = opt.name] == null && (ref$[key$] = []);
  hero = d3.select(".headline ." + opt.name).selectAll("span").data(opt.current[opt.name]);
  hero.enter().append("span");
  hero.exit().transition().style({
    "opacity": 0,
    "font-size": "0px"
  }).remove();
  hero.text(function(it){
    return it;
  }).transition().style({
    "opacity": "1",
    "font-size": function(d){
      var fontSize;
      if (!fontSize) {
        fontSize = Math.round(15 + 200 / chars) + "px";
      }
      return fontSize;
    }
  });
  if (opt.skipList) {
    return false;
  }
  list = d3.select("ul." + opt.name + "-list");
  item = list.selectAll("li").data(opt.collection);
  item.enter().insert("li");
  item.datum(function(d, i){
    d.status = _.contains(opt.current[opt.name], d[opt.selector]) ? "active" : "inactive";
    return d;
  }).attr("class", function(it){
    return it.status;
  }).html(function(d){
    var child;
    child = "";
    if (opt.name === "tag") {
      child = "<span class='badge " + d.status + "'>" + d.rate + "</span>";
    }
    return d[opt.selector] + child;
  });
  item.exit().remove();
  active = list.selectAll("li.active").transition().style({
    'font-size': '18px'
  });
  inactive = list.selectAll("li.inactive").transition().style({
    'font-size': '13px'
  });
  return [list, hero];
};
Template.hero.events({
  "click .list li": function(event, tmpl){
    var story, current, active, output, nouns, loc;
    tmpl.handle.stop();
    story = d3.select(event.currentTarget).data()[0];
    current = Store.get("current_" + story.collection);
    active = $(event.currentTarget).is(".active");
    output = void 8;
    if (active) {
      output = _.without(current, story.name);
      if (story.collection === "tagsets") {
        nouns = Store.get("current_nouns");
        Store.set("current_nouns", _.without(nouns, story.noun));
      }
    } else {
      switch (story.collection) {
      case "tags":
        output = current.concat(story.name);
        break;
      case "tagsets":
        output = [story.name];
        Store.set("current_nouns", [story.noun]);
        Store.set("current_tags", []);
        break;
      case "sorts":
        output = [story.name];
        switch (story.selector) {
        case "random":
          output = [];
          story.order = _.random(1, 100);
          break;
        case "$near":
          loc = Store.get("user_loc");
          story.order = [loc.lat, loc.long];
        }
        Store.set("current_sorts_specifier", story.specifier);
        Store.set("current_sorts_selector", story.selector);
        Store.set("current_sorts_order", story.order);
      }
    }
    Session.set("current_changed", story.collection);
    return Store.set("current_" + story.collection, output);
  },
  "click .headline .tag span": function(event, tmpl){
    var selector, current, out;
    selector = event.target.textContent;
    current = Store.get("current_tags");
    out = _.without(current, selector);
    return Store.set("current_tags", out);
  }
});
Template.hero.created = function(){
  Session.set("heroRendered", false);
  Session.set("current_changed", null);
  if (!this.handle) {
    this.handle = Meteor.autorun(function(){
      var uloc, tagsets, sorts, tags, out;
      uloc = Store.get('user_loc');
      tagsets = Tagsets.find().fetch();
      sorts = Sorts.find().fetch();
      tags = Tag.rateAll();
      if (tags && tags.length) {
        if (!Store.get("current_tagsets")) {
          Store.set("current_tagsets", ["eat"]);
          Store.set("current_tags", []);
          Store.set("current_sorts", ["latest"]);
          Store.set("current_sorts_specifier", "sort");
          Store.set("current_sorts_selector", "updatedAt");
          Store.set("current_sorts_order", "-1");
          Store.set("current_nouns", ["food"]);
        }
        out = {
          tagsets: tagsets,
          tags: tags,
          sorts: sorts
        };
        as("collection", out);
        return Session.set("heroDataReady", true);
      }
    });
  }
  Deps.autorun(function(){
    var current, Collection, collection, tagList, ref$, heroList, tagDrag;
    if (!Session.get("heroRendered")) {
      console.log("not rendered");
      return false;
    }
    if (!Session.get("heroDataReady")) {
      console.log("no data");
      return false;
    }
    current = statCurrent().verbose;
    Collection = as("collection");
    collection = {
      tagset: Collection.tagsets,
      tag: _.filter(Collection.tags, function(d){
        return _.contains(current.tagset, d.tagset);
      }),
      sort: Collection.sorts,
      noun: Collection.tagsets
    };
    tagList = $(".tag-list");
    if (Session.get("current_changed") === "tagsets") {
      if ((ref$ = tagList.data("jsp")) != null) {
        ref$.destroy();
      }
    }
    heroList = {
      tagset: new HeroList({
        name: "tagset",
        selector: "name",
        leader: true,
        current: current,
        collection: collection.tagset
      }),
      article: new HeroList({
        name: "article",
        skipItem: true,
        current: current,
        collection: collection.article
      }),
      sort: new HeroList({
        name: "sort",
        selector: "name",
        leader: false,
        current: current,
        collection: collection.sort
      }),
      tag: new HeroList({
        name: "tag",
        selector: "name",
        leader: false,
        current: current,
        collection: collection.tag
      }),
      noun: new HeroList({
        name: "noun",
        selector: "noun",
        leader: true,
        current: current,
        collection: collection.noun
      })
    };
    if (Session.get("current_changed") !== "tags") {
      tagList.jScrollPane({
        horizontalGutter: 100,
        verticalGutter: 100,
        hideFocus: true
      });
      tagDrag = tagList.find(".jspDrag");
      tagDrag.css('display', 'none');
      tagList.mouseenter(function(){
        return tagDrag.stop(true, true).fadeIn('fast');
      });
      return tagList.mouseleave(function(){
        return tagDrag.stop(true, true).fadeOut('fast');
      });
    }
  });
  return Session.set("heroUpdated", true);
};
Template.hero.rendered = function(tmpl){
  if (!Session.get("heroRendered")) {
    Session.set("heroRendered", true);
  }
  if (Session.get("heroDataReady")) {
    return this.handle && this.handle.stop();
  }
};