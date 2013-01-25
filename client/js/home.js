
Template.hero.events({
  'click .list li': function (event, tmpl) {

    tmpl.handle.stop()

    var story = d3.select(event.target).data()[0]
    var selector = "current_" + story.collection
    var current = Session.get(selector)
    var active = event.target.getAttribute("class") === "active"
    var output

    if (active) {

      output = _.without(current, story.name)

      if (story.collection === "tagsets") {
        var nouns = Session.get("current_nouns")
        Session.set("current_nouns", _.without(nouns, story.noun))
      }

    } else {


      if (story.collection === "tags") {
        output = current.concat(story.name)
      }

      if (story.collection === "tagsets") {
        output = [story.name]
        Session.set("current_nouns", [story.noun])
        Session.set("current_tags", [])
        // var nouns = Session.get("current_nouns")
        // Session.set("current_nouns", nouns.concat(story.noun))
      }

      if (story.collection === "sorts") {
        output = [story.name]
        Session.set("current_sorts_selector", story.selector)
        var order = story.order
        if (story.name === "nearest") {
          var loc = Session.get("loc")
          order = [loc.lat, loc.long]
        }
        Session.set("current_sorts_order", order)
      }
    }

    Session.set(selector, output)

  },
  'click .headline .tag span': function (event, tmpl) {
    var selector = event.target.textContent
    var current = Session.get("current_tags")
    var out = _.without(current, selector)

    Session.set("current_tags", out)
  }
})

statCurrent = function () {

  var out = {
    query  : {
      tagset : Session.get("current_tagsets"),
      tag    : Session.get("current_tags"),
      sort   : {
        selector  : Session.get("current_sorts_selector"),
        order     : Session.get("current_sorts_order"),
      }
    },
    verbose: {
      tagset : Session.get("current_tagsets"),
      tag    : Session.get("current_tags"),
      sort   : Session.get("current_sorts"),
      noun   : Session.get("current_nouns")
    }
  }

  out.verbose.tagset = out.verbose.tagset && out.verbose.tagset.length ? out.verbose.tagset : ["find"]
  out.verbose.noun = out.verbose.noun && out.verbose.noun.length ? out.verbose.noun : ["offer"]
  out.verbose.article = out.verbose.sort && out.verbose.sort.length ? ["the"] : ["some"]

  if (out.verbose.tagset.toString() === "shop") {
    var article = out.verbose.article.toString()
    out.verbose.article = ["for " + article]
  }

  return out
}

Template.hero.created = function () {
  Session.set("heroRendered", false)

  var self = this

  if (! self.handle) {
    self.handle = Meteor.autorun( function () {

      var getOffer = function () {
        var out = Offers.findOne()
        return out }
      var gotOffer = getOffer()

      var getCollection = function () {
        var out = {
          "tagsets": Tagsets.find().fetch(),
          "tags": Tags.find().fetch(),
          "sorts": Sorts.find().fetch(),
        }
        return out }
      var gotCollection = getCollection()

      if (gotOffer && gotCollection) {
        console.log("got offer: ", gotOffer, "got collection: ", gotCollection)

          var getNoun = function () {
            var out = _.find(gotCollection.tagsets, function (d) {
              return d.name === gotOffer.tagset })
              console.log(out)
            return out }
          var gotNoun = getNoun()

          if (gotNoun) {

            Session.set("current_tagsets", [gotOffer.tagset] )
            Session.set("current_tags", [] )
            Session.set("current_sorts", ["best"] )
            Session.set("current_sorts_selector", "votes" )
            Session.set("current_sorts_order", "-1" )
            Session.set("current_nouns", [gotNoun.noun] )

            var out = {}
            for (var key in gotCollection) {
              out[key] = gotCollection[key]
            }

            as("collection", out)

        }

        Session.set("heroDataReady", true)
      }

    })
  }

  var color = {
    shiftColor: function (a) {
      var self = this
      var Col = Color(a)
      var white = Color("#fff")
      self.normal = Col
      self.bright = Col.desaturateByAmount( .3 )
      self.hue = Col.getHue()
      self.light = Col.blend( white, .8 ).desaturateByAmount( .3 ).toString()
      self.desat = Col.desaturateByAmount( .8 ).darkenByAmount( 0.2).toString()
      self.dark = Col.desaturateByAmount( .2 ).darkenByAmount( .5).toString()
    }
  }

  var renderHero = function () {
    var updateHero  = function () {
      ctx = new Meteor.deps.Context()

      ctx.onInvalidate(updateHero)

      ctx.run( function () {

        if (!Session.get("heroRendered")) {
          console.log("not rendered")
          return false
        }
        if (!Session.get("heroDataReady")) {
          console.log("no data")
          return false
        }

        var current = statCurrent().verbose

        var Collection = as("collection")
        var collection = {
          tagset : Collection.tagsets,
          tag    : _.filter(Collection.tags, function (d) {
            return _.contains(current.tagset, d.tagset) }),
          sort   : Collection.sorts,
          noun   : Collection.tagsets,
        }

        // HeroList instances
        var heroList = { 
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
            prepend: "the",
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
        }

      })
    }
    updateHero()
  }()

  //  HeroList constructor
  var HeroList = function (opt) {

    var fontSize
    var chars = _.flatten(opt.current).toString().length

    var hero = d3.select(".headline ." + opt.name).selectAll("span")
      .data( opt.current[opt.name] )

      hero
        .enter()
        .append("span")

      hero
        .exit()
        .transition()
        .style({
          "opacity": 0,
          "font-size": "0px"
        })
        .remove()

      hero
        .text(function (d) { return d })
        .transition()
        .style({
          "font-size": function (d) {
            if (!fontSize) {
              fontSize = (Math.round( 20 + (100 / chars))) + "px" }
            return fontSize
          },
          "opacity": "1",
          "color": function () {
            return color.dark }
        })

    if (opt.skipList) return false

    var list = d3.select("ul." + opt.name + "-list")

    var item = list.selectAll("li")
      .data(opt.collection)

      item
        .enter()
        .insert("li")

      item
        .datum( function (d, i) {
          var limbo = opt.current.tagset.toString() === "find" || opt.current.noun.toString() === "offer" ? true : false
          var active = _.contains(opt.current[opt.name], d[opt.selector]) ? "active" : "inactive"

          d.status = limbo && opt.leader ? "limbo" : active

          return d
        })
        .attr("class", function (d) { return d.status })
        .text(function (d) {return d[opt.selector] })

      item.exit()
        .remove()


      var limbo = list.selectAll("li.limbo")
        .style({
          background: function (d) {
            if (opt.leader) {
              color.shiftColor("teal")
            }
            return color.normal
          },
          color: "white"
        })

      var active = list.selectAll("li.active")
        .style({
          background: function (d) {
            if (opt.leader) {
              color.shiftColor(d.color)
              d3.select("html")
                .transition()
                .style("background", function () {
                  return color.light
                })
            }
            return color.normal
          },
          color: "rgba(255, 255, 255, 0.9)"
        })


      var inactive = list.selectAll("li.inactive")
        .style({
          background: function (d) {
            if (opt.leader) {
              return "transparent"
            } else {
              return color.bright
            }
          },
          color: function (d) {
            if (opt.leader) {
              return color.desat
            } else {
              return "rgba(255,255,255, 0.9)"
            }
          }
        })

    return [ list, hero ]
  }

}

Template.body.events({
  "click .shift i": function (event, tmpl) {

    var dir = event.target.parentElement.getAttribute("data-shift-direction")
    var area = event.target.parentElement.getAttribute("data-shift-area")
    var page = Meteor.Router.page()
    var current = _.first(page.split("_"))

    Session.set("shift_direction", dir)
    Session.set("shift_area", area)
    Session.set("shift_current", current)

    /* console.log("shift: ", dir.toUpperCase(), "area: ", area.toUpperCase(), "current: ", current.toUpperCase()) */
  }
})

Sparrow = {}
Sparrow.shift = function () {
  return Session.get("shift_area")
}


Handlebars.registerHelper('page_next', function (area) {
  if (area !== Session.get("shift_area")) { return false }

  Meteor.Transitioner.setOptions({
    "after": function () {
      Meteor.Router.to( area === "home" ? "/" : "/" + area)
      Session.set("shift_current", area)
    }
  })
  return area
})

Template.hero.rendered = function (tmpl) {
  if (! Session.get("heroRendered")){
    Session.set("heroRendered", true)}
  // if (Session.get("heroDataReady")){
  //   this.handle && this.handle.stop()}
}

Template.home.events({
  'click section.actions .votes i': function(event, tmpl) {
    Meteor.call("upvoteEvent", "id", Meteor.userId(), this)
  }
});

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

statRange = function () {
  var out = {
    max: {
      distance : Session.get("max_distance"),
      votes    : Session.get("max_votes"),
      price    : Session.get("max_price")
    },
    min: {
      distance : Session.get("min_distance"),
      votes    : Session.get("min_votes"),
      price    : Session.get("min_price")
    }
  }
  return out
}

Template.home.getOffers = function () {

  var query = {}
  var sort = {}

  var current = statCurrent().query

  for (key in current) {
    if (current.hasOwnProperty(key)) {
      if (key === "sort") {
        sort[current[key].selector] = current[key].order
      }
      if (current[key] && current[key].length) {
        if (key === "tag") {
          query.tags = { $in: current[key]}
        }
        if (key === "tagset") {
          query[key] = { $in: current[key] }
        }
      }
    }
  }

  var result = Offers.find(query, {sort: sort}).fetch()
  var myLoc = Session.get("loc")

  if (result && myLoc) {

    var survey = _.each(result, function (d) {
      d.distance = Math.round(distance(myLoc.lat, myLoc.long, d.loc.lat, d.loc.long, "M")*10)/10
    })

    var range = {
      max: {
        distance : _.max(result, function (o) { return o.distance }),
        votes    : _.max(result, function (o) { return o.votes }),
        price    : _.max(result, function (o) { return o.price })
      },
      min: {
        distance : _.min(result, function (o) { return o.distance }),
        votes    : _.min(result, function (o) { return o.votes }),
        price    : _.min(result, function (o) { return o.price })
      }
    }

    Session.set("max_distance", range.max.distance)
    Session.set("max_votes", range.max.votes)
    Session.set("max_price", range.max.price)
    Session.set("min_distance", range.min.distance)
    Session.set("min_votes", range.min.votes)
    Session.set("min_price", range.min.price)

    return result
  }

}

Template.home.styleDate = function (date) {
  return moment(date).fromNow()
}

