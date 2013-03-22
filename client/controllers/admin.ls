
#////////////////////////////////////////////
#  $$ helpers

Handlebars.registerHelper "nab", ->
  nab       = Store.get("nab")
  nab_query = Store.get("nab_query")
  nab_sort  = Store.get("nab_sort")
  nab_pick1 = Store.get("nab_pick1")
  nab_pick2 = Store.get("nab_pick2")

  result = window[ nab ]?.find(
    nab_query,
    nab_sort
  ).map (d)->
    if d[nab_pick1] or d[nab_pick2]
      pick = _.pick(d, nab_pick1, nab_pick2)
      id   = _.pick(d, '_id')
      d    = _.extend(pick, id)
    d

  result

Template.editor.events {}=
  'click .save': (event, tmpl) ->
    event.preventDefault()

    save_type  = event.currentTarget.getAttribute "data-save-type"
    collection = Store.get("nab").toProperCase()
    rawtext    = $(tmpl.find( "[data-text-type*=#{save_type}]" ))?.val()
    text       = textarea? JSON.parse(textarea)

    switch save_type
    | "update"    => window[collection].update @_id, { $set   : text }
    | "insert"    => window[collection].insert text
    | "remove"    => window[collection].remove @_id
    | "unset"     => window[collection].update @_id, { $unset : text }
    | "unset-all" => window[collection].update {}  , { $unset : text }, multi: true
    | "set"       => window[collection].update @_id, { $set   : text }
    | "set-all"   => window[collection].update {}  , { $set   : text }, multi: true

Template.admin_section.events {}=
  'keyup .selector': (event, tmpl) ->
    target   = $(event.currentTarget)
    text     = target.val()
    selector = target.attr("id")
    type     = target.attr("data-selector-type")
    status   = target.siblings()

    switch type
      when "mongo"
        unless text
          out = {}
        else
          try
            out = JSON.parse(text)
          catch error
            status.addClass("error")
            return false
      when "underscore"
        unless text
          out = false
        else
          # console.log(text)
          out = text

    status.removeClass "error"
    Store.set( "nab_#{selector}", out )

Template.mocha.rendered = ->
  if Session.get "rendered_wrapper"
    if window.mochaPhantomJS
      expect = chai.expect
      mochaPhantomJS.run()
    else
      cb = ->
        # $("body").scrollTop 0
      mocha.run(cb)

Template.mocha.events {}=
  'change input': (event, tmpl) ->
    tar = $(event.currentTarget)
    type= tar.attr "data-type"

    Store.set "test_#{type}", tar.val()

Template.stats.helpers {}=
  "myOffers": (event, tmpl) ->
    Offer?.mine().count()
  "myLocations": (event, tmpl) ->
    Location?.mine().count()


