var heroColor, heroAdjustColors, HeroList;
heroColor = {
  shiftColor: function(a){
    var white, col;
    white = Color(fff + "");
    col = Color(a);
    this.normal = col.toString();
    this.bright = col.desaturateByAmount(0.1);
    this.sat_dark = col.darkenByAmount(0.5).saturateByAmount(0.3);
    this.hue = col.getHue();
    this.light = col.setSaturation(0.8).setLightness(0.7).toString();
    this.desat = col.desaturateByAmount(0.8).darkenByAmount(0.2).toString();
    return this.dark = col.setSaturation(1).setLightness(0.2).toString();
  }
};
heroAdjustColors = function(d){
  var user;
  user = Meteor.user();
  if (user && user.colors) {
    heroColor.shiftColor(user.colors.prime.medium);
    return Session.set("user_colors_set", true);
  } else {
    return heroColor.shiftColor('hsla(200, 90%, 40%, 1)');
  }
};
HeroList = function(opt){
  var fontSize, chars, ref$, key$, hero, x$, limbo, list, item, y$, active, z$, inactive;
  fontSize = void 8;
  chars = _.flatten(opt.current).toString().length;
  (ref$ = opt.current)[key$ = opt.name] == null && (ref$[key$] = []);
  hero = d3.select(".headline ." + opt.name).selectAll("span").data(opt.current[opt.name]);
  hero.enter().append("span");
  hero.exit().transition().style({
    opacity: 0,
    "font-size": "0px"
  }).remove();
  x$ = hero;
  x$.text(function(d){
    return d;
  });
  x$.transition();
  x$.style({
    "opacity": "1",
    "color": function(d){
      return heroColor.normal;
    },
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
  limbo = false;
  list = d3.select("ul." + opt.name + "-list");
  item = list.selectAll("li").data(opt.collection);
  item.enter().insert("li");
  item.datum(function(d, i){
    if (limbo && opt.leader) {
      d.status = "limbo";
    } else if (_.contains(opt.current[opt.name], d[opt.selector])) {
      d.status = "active";
    } else {
      d.status = "inactive";
    }
    return d;
  }).attr("class", function(d){
    return d.status;
  }).html(function(d){
    var child;
    child = "";
    if (opt.name === "tag") {
      child = "<span class='badge " + d.status + "'>" + d.rate + "</span>";
    }
    return d[opt.selector] + child;
  });
  item.exit().remove();
  y$ = active = list.selectAll("li.active");
  y$.transition();
  y$.style({
    'color': function(c){
      if (opt.leader) {
        heroAdjustColors(c);
      }
      return heroColor.normal;
    },
    'font-size': '18px'
  });
  z$ = inactive = list.selectAll("li.inactive");
  z$.transition();
  z$.style({
    'color': function(d){
      if (opt.leader) {
        return bbb + "";
      } else {
        return heroColor.bright;
      }
    },
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
  var self;
  Session.set("heroRendered", false);
  Session.set("current_changed", null);
  self = this;
  if (!self.handle) {
    self.handle = Meteor.autorun(function(){
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