#////////////////////////////////////////////
#  $$ globals and locals
color = shiftColor: (a) ->
  self = this
  Col = Color(a)
  white = Color("#fff")
  self.normal = Col
  self.bright = Col.desaturateByAmount(.3)
  self.sat_dark = Col.darkenByAmount(.5).saturateByAmount(0.3)
  self.hue = Col.getHue()
  self.light = Col.blend(white, .8).desaturateByAmount(.3).toString()
  self.desat = Col.desaturateByAmount(.8).darkenByAmount(0.2).toString()
  self.dark = Col.desaturateByAmount(.2).darkenByAmount(.5).toString()

HeroList = (opt) ->
  fontSize = undefined
  chars = _.flatten(opt.current).toString().length
  opt.current[opt.name] = []  unless opt.current[opt.name]
  hero = d3.select(".headline ." + opt.name).selectAll("span").data(opt.current[opt.name])
  hero.enter().append "span"
  hero.exit().transition().style(
    opacity: 0
    "font-size": "0px"
  ).remove()
  hero.text((d) ->
    d
  ).transition().style
    "font-size": (d) ->
      fontSize = (Math.round(20 + (100 / chars))) + "px"  unless fontSize
      fontSize

    opacity: "1"
    color: ->
      color.light

  return false  if opt.skipList
  list = d3.select("ul." + opt.name + "-list")
  item = list.selectAll("li").data(opt.collection)
  item.enter().insert "li"
  item.datum((d, i) ->
    limbo = (if opt.current.tagset.toString() is "find" or opt.current.noun.toString() is "offer" then true else false)
    active = (if _.contains(opt.current[opt.name], d[opt.selector]) then "active" else "inactive")
    d.status = (if limbo and opt.leader then "limbo" else active)
    d
  ).attr("class", (d) ->
    d.status
  ).text (d) ->
    d[opt.selector]

  item.exit().remove()
  limbo = list.selectAll("li.limbo").style(
    background: (d) ->
      color.shiftColor "teal"  if opt.leader
      color.normal

    color: "white"
  )
  active = list.selectAll("li.active").style(
    background: (d) ->
      if opt.leader
        color.shiftColor d.color
        # d3.select("html").transition().style "background", ->
        #   color.sat_dark

      color.normal

    color: "rgba(255, 255, 255, 0.9)"
  )
  inactive = list.selectAll("li.inactive").style(
    background: (d) ->
      if opt.leader
        "transparent"
      else
        color.bright

    color: (d) ->
      if opt.leader
        color.desat
      else
        "rgba(255,255,255, 0.9)"
  )
  [list, hero]


#////////////////////////////////////////////
#  $$  hero
Template.hero.events
  "click .list li": (event, tmpl) ->
    tmpl.handle.stop()
    story = d3.select(event.target).data()[0]
    selector = "current_" + story.collection
    current = Session.get(selector)
    active = event.target.getAttribute("class") is "active"
    output = undefined
    if active
      output = _.without(current, story.name)
      if story.collection is "tagsets"
        nouns = Session.get("current_nouns")
        Session.set "current_nouns", _.without(nouns, story.noun)
    else
      output = current.concat(story.name)  if story.collection is "tags"
      if story.collection is "tagsets"
        output = [story.name]
        Session.set "current_nouns", [story.noun]
        Session.set "current_tags", []
      if story.collection is "sorts"
        output = [story.name]
        Session.set "current_sorts_selector", story.selector
        order = story.order
        if story.name is "nearest"
          loc = Session.get("user_loc")
          order = [loc.lat, loc.long]
        Session.set "current_sorts_order", order
    Session.set selector, output

  "click .headline .tag span": (event, tmpl) ->
    selector = event.target.textContent
    current = Session.get("current_tags")
    out = _.without(current, selector)
    Session.set "current_tags", out

Template.hero.created = ->
  Session.set "heroRendered", false
  self = this
  unless self.handle
    self.handle = Meteor.autorun(->
      getOffer = ->
        out = Offers.findOne()
        out

      gotOffer = getOffer()
      getCollection = ->
        out =
          tagsets: Tagsets.find().fetch()
          tags: Tags.find().fetch()
          sorts: Sorts.find().fetch()

        out

      gotCollection = getCollection()
      if gotOffer and gotCollection
        console.log "got offer and collection", gotOffer, "got collection: ", gotCollection
        getNoun = ->
          out = _.find(gotCollection.tagsets, (d) ->
            d.name is gotOffer.tagset
          )
          console.log out
          out

        gotNoun = getNoun()
        if gotNoun
          Session.set "current_tagsets", [gotOffer.tagset]
          Session.set "current_tags", []
          Session.set "current_sorts", ["latest"]
          Session.set "current_sorts_selector", "updatedAt"
          Session.set "current_sorts_order", "-1"
          Session.set "current_nouns", [gotNoun.noun]
          out = {}
          for key of gotCollection
            out[key] = gotCollection[key]
          as "collection", out
        Session.set "heroDataReady", true
    )
  (renderHero = ->
    updateHero = ->
      ctx = new Meteor.deps.Context()
      ctx.onInvalidate updateHero
      ctx.run ->
        unless Session.get("heroRendered")
          console.log "not rendered"
          return false
        unless Session.get("heroDataReady")
          console.log "no data"
          return false
        current = statCurrent().verbose
        Collection = as("collection")
        collection =
          tagset: Collection.tagsets
          tag: _.filter(Collection.tags, (d) ->
            _.contains current.tagset, d.tagset
          )
          sort: Collection.sorts
          noun: Collection.tagsets

        heroList =
          tagset: new HeroList(
            name: "tagset"
            selector: "name"
            leader: true
            current: current
            collection: collection.tagset
          )
          article: new HeroList(
            name: "article"
            skipItem: true
            current: current
            collection: collection.article
          )
          sort: new HeroList(
            name: "sort"
            selector: "name"
            leader: false
            prepend: "the"
            current: current
            collection: collection.sort
          )
          tag: new HeroList(
            name: "tag"
            selector: "name"
            leader: false
            current: current
            collection: collection.tag
          )
          noun: new HeroList(
            name: "noun"
            selector: "noun"
            leader: true
            current: current
            collection: collection.noun
          )


    updateHero()
    )()

Template.hero.rendered = (tmpl) ->
  Session.set "heroRendered", true  unless Session.get("heroRendered")
  @handle and @handle.stop()  if Session.get("heroDataReady")
