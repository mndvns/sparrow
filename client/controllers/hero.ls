
#////////////////////////////////////////////
#  $$ globals and locals


HeroList = (opt) ->
  fontSize = void
  chars = _.flatten(opt.current).toString().length
  opt.current[opt.name] ?= []

  hero = d3.select(".headline ." + opt.name)
    .selectAll("span")
    .data(opt.current[opt.name])

  hero
    .enter!
    .append "span"

  hero
    .exit!
    .transition!
    .style {}=
      "opacity"   : 0
      "font-size" : "0px"
    .remove!

  hero
    .text -> it
    .transition!
    .style {}=
      "opacity": "1"
      "font-size": (d) ->
        fontSize = (Math.round(15 + (200 / chars))) + "px"  unless fontSize
        fontSize

  return false  if opt.skipList

  list = d3.select("ul." + opt.name + "-list")

  item = list.selectAll("li")
    .data(opt.collection)

  item
    .enter!
    .insert "li"

  item
    .datum (d, i) ->
      d.status  = if _.contains opt.current[opt.name], d[opt.selector]
                then "active"
                else "inactive"
      d

    .attr "class", (.status)
    .html (d) ->
      child = ""
      if opt.name is "tag"
        child = "<span class='badge #{d.status}'>#{d.rate}</span>"
      d[opt.selector] + child

  item
    .exit!
    .remove!

  active = list.selectAll("li.active")
    .transition!
    .style {}=
      'font-size': '18px'

  inactive = list.selectAll("li.inactive")
    .transition!
    .style {}=
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
  unless @handle
    @.handle = Meteor.autorun ->

      uloc = Store.get('user_loc')

      tagsets = Tagsets.find!fetch!
      sorts   = Sorts.find!fetch!
      tags    = Tag.rateAll!

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



  Deps.autorun ->
    unless Session.get("heroRendered")
      console.log "not rendered"
      return false
    unless Session.get("heroDataReady")
      console.log "no data"
      return false

    current = statCurrent!verbose
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
  if Session.get("heroDataReady") => @handle and @handle.stop!  

