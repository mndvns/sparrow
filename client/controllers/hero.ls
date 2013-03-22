
#////////////////////////////////////////////
#  $$ globals and locals

heroColor =
  shiftColor: (a) ->

    white     = Color("#fff")
    col       = Color(a)

    @normal   = col.toString()
    @bright   = col.desaturateByAmount 0.1
    @sat_dark = col.darkenByAmount 0.5 .saturateByAmount 0.3
    @hue      = col.getHue()
    @light    = col.setSaturation 0.8 .setLightness 0.7 .toString()
    @desat    = col.desaturateByAmount 0.8 .darkenByAmount 0.2 .toString()
    @dark     = col.setSaturation 1 .setLightness 0.2 .toString()

heroAdjustColors = (d)->

  user = Meteor.user()
  if user and user.colors
    heroColor.shiftColor user.colors.prime.medium
    Session.set "user_colors_set", true

    # else if not $(document.body).hasClass("transitioning")
    #   themeColors = _.find document.styleSheets, (d) ->
    #     d.title is "dynamic-theme"

    #   for rule in themeColors.rules
    #     themeColors.removeRule()

    #   themeColors.insertRule( colorFill ".clr-text.prime", "color", heroColor.normal )
    #   themeColors.insertRule( colorFill "a", "color", heroColor.normal)
    #   themeColors.insertRule( colorFill "a:hover, a.active", "color", heroColor.dark)

    #   themeColors.insertRule( colorFill ".clr-bg", "background", heroColor.normal)
    #   themeColors.insertRule( colorFill ".clr-bg.btn:hover", "background", heroColor.dark)

    #   themeColors.insertRule( colorFill ".clr-bg.light", "background", heroColor.light )
    #   themeColors.insertRule( colorFill ".clr-bg.dark", "background", heroColor.dark)

    #   heroColor.shiftColor d.color

  else

    #   heroColor.shiftColor d.color

    heroColor.shiftColor('hsla(200, 90%, 40%, 1)')

HeroList = (opt) ->
  fontSize = void
  chars = _.flatten(opt.current).toString().length
  opt.current[opt.name] ?= []

  hero = d3.select(".headline ." + opt.name)
    .selectAll("span")
    .data(opt.current[opt.name])

  hero
    .enter()
    .append "span"

  hero
    .exit()
    .transition()
    .style {}=
      opacity: 0
      "font-size": "0px"
    .remove()

  hero
    ..text (d) ->
      d
    ..transition()
    ..style {}=
      "opacity": "1"
      "color": (d) ->
        heroColor.normal
      "font-size": (d) ->
        fontSize = (Math.round(15 + (200 / chars))) + "px"  unless fontSize
        fontSize

  return false  if opt.skipList

  limbo = false

  list = d3.select("ul." + opt.name + "-list")

  item = list.selectAll("li")
    .data(opt.collection)

  item
    .enter()
    .insert "li"

  item
    .datum (d, i) ->
      if limbo and opt.leader
        d.status = "limbo"
      else if _.contains(opt.current[opt.name], d[opt.selector])
        d.status = "active"
      else
        d.status = "inactive"

      d

    .attr "class", (d) ->
      d.status
    .html (d) ->
      child = ""
      if opt.name is "tag"
        child = "<span class='badge #{d.status}'>#{d.rate}</span>"
      d[opt.selector] + child

  item
    .exit()
    .remove()

  active = list.selectAll("li.active")
    ..transition()
    ..style {}=
      'color': (c) ->
        if opt.leader then heroAdjustColors(c)
        heroColor.normal
      'font-size': '18px'

  inactive = list.selectAll("li.inactive")
    ..transition()
    ..style {}=
      'color': (d) ->
        if opt.leader
          "#bbb"
        else
          heroColor.bright
      'font-size': '13px'


  [list, hero]




#////////////////////////////////////////////
#  $$  hero
Template.hero.events {}=
  "click .list li": (event, tmpl) ->
    # watchOffer.click()

    tmpl.handle.stop()

    story = d3.select(event.currentTarget).data()[0]

    current  = Store.get("current_#{story.collection}")
    active   = $(event.currentTarget).is ".active"
    output   = void

    # console.log(story)

    if active
      output = _.without(current, story.name)
      if story.collection is "tagsets"
        nouns = Store.get("current_nouns")
        Store.set "current_nouns", _.without(nouns, story.noun)
    else
      switch story.collection
        when "tags"
          output = current.concat(story.name) 
          # console.log(output)
        when "tagsets"
          output = [story.name]
          Store.set "current_nouns", [story.noun]
          Store.set "current_tags", []
        when "sorts"

          output = [story.name]
          switch story.selector
            when "random"
              output = []
              story.order = _.random(1, 100)
            when "$near"
              loc = Store.get("user_loc")
              story.order = [loc.lat, loc.long]

          Store.set "current_sorts_specifier", story.specifier
          Store.set "current_sorts_selector", story.selector
          Store.set "current_sorts_order", story.order

    Session.set "current_changed", story.collection
    Store.set "current_#{story.collection}", output

  "click .headline .tag span": (event, tmpl) ->
    selector = event.target.textContent
    current = Store.get("current_tags")
    out = _.without(current, selector)
    Store.set "current_tags", out









Template.hero.created = ->
  Session.set "heroRendered", false
  Session.set "current_changed", null
  self = this
  unless self.handle
    self.handle = Meteor.autorun(->

      uloc = Store.get('user_loc')

      tagsets = Tagsets.find().fetch()
      sorts   = Sorts.find().fetch()
      tags = Tag.rateAll()

      # tags    = Tags.find().map (d)->

      #   count = d.involves and d.involves.length
      #   if not count then return false

      #   ctx =
      #     updatedAt   : 0
      #     votes_count : 0
      #     price       : 0
      #     distance    : 0

      #   for inv in d.involves
      #     for c of ctx
      #       if c is "distance"
      #         ctx[c] += distance(inv.loc.lat,inv.loc.long,uloc.lat,uloc.long)
      #       else
      #         ctx[c] += parseInt(inv[c])

      #   for c of ctx
      #     ctx[c] = (ctx[c] / count)
      #     d[c] = ctx[c]

      #   d.count = count
      #   d

      if tags and tags.length

        unless Store.get "current_tagsets"
          Store.set "current_tagsets", ["eat"]
          Store.set "current_tags", []
          Store.set "current_sorts", ["latest"]
          Store.set "current_sorts_specifier", "sort"
          Store.set "current_sorts_selector", "updatedAt"
          Store.set "current_sorts_order", "-1"
          Store.set "current_nouns", ["food"]

        out = 
          tagsets: tagsets
          tags: tags
          sorts: sorts

        as "collection", out

        Session.set "heroDataReady", true
    )

  Deps.autorun ->
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
      tag   : _.filter( Collection.tags , (d) ->
        _.contains current.tagset, d.tagset
      )
      sort  : Collection.sorts
      noun  : Collection.tagsets

    tagList = $(".tag-list")

    if Session.get("current_changed") is "tagsets"
      tagList.data("jsp")?.destroy()

    heroList =
      tagset: new HeroList {}=
        name: "tagset"
        selector: "name"
        leader: true
        current: current
        collection: collection.tagset

      article: new HeroList {}=
        name: "article"
        skipItem: true
        current: current
        collection: collection.article

      sort: new HeroList {}=
        name: "sort"
        selector: "name"
        leader: false
        current: current
        collection: collection.sort

      tag: new HeroList {}=
        name: "tag"
        selector: "name"
        leader: false
        current: current
        collection: collection.tag

      noun: new HeroList {}=
        name: "noun"
        selector: "noun"
        leader: true
        current: current
        collection: collection.noun

    if Session.get("current_changed") isnt "tags"
      tagList.jScrollPane {}=
        horizontalGutter: 100
        verticalGutter: 100
        hideFocus: true

      tagDrag = tagList.find(".jspDrag")
      tagDrag.css('display', 'none')
      tagList.mouseenter ->
        tagDrag.stop(true, true).fadeIn('fast')

      tagList.mouseleave ->
        tagDrag.stop(true, true).fadeOut('fast')

  Session.set("heroUpdated", true)



Template.hero.rendered = (tmpl) ->
  Session.set "heroRendered", true  unless Session.get("heroRendered")
  @handle and @handle.stop()  if Session.get("heroDataReady")
  # if Meteor.Isotope
  #   Meteor.Isotope.reload()

