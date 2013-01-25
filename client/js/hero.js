//////////////////////////////////////////////
//  $$ globals and locals

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

var HeroList = function (opt) {

  var fontSize
  var chars = _.flatten(opt.current).toString().length

  if (!opt.current[opt.name]) { opt.current[opt.name] = [] }

  console.log(opt.current[opt.name])
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

//////////////////////////////////////////////
//  $$  hero

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
        console.log("got offer and collection", gotOffer, "got collection: ", gotCollection)

          var getNoun = function () {
            var out = _.find(gotCollection.tagsets, function (d) {
              return d.name === gotOffer.tagset })
              console.log(out)
            return out }
          var gotNoun = getNoun()

          if (gotNoun) {

            Session.set("current_tagsets", [gotOffer.tagset] )
            Session.set("current_tags", [] )
            Session.set("current_sorts", ["latest"] )
            Session.set("current_sorts_selector", "updatedAt" )
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

}

Template.hero.rendered = function (tmpl) {
  if (! Session.get("heroRendered")){
    Session.set("heroRendered", true)}
  if (Session.get("heroDataReady")){
    this.handle && this.handle.stop()}
}


