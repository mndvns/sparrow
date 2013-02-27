#////////////////////////////////////////////
#  $$ helpers

Handlebars.registerHelper "nab", () ->
  nab       = Store.get("nab")
  nab_query = Store.get("nab_query")
  nab_sort  = Store.get("nab_sort")
  nab_pick1  = Store.get("nab_pick1")
  nab_pick2  = Store.get("nab_pick2")

  result = window[ nab ]?.find(
    nab_query,
    nab_sort
  ).map (d)->
    if d[nab_pick1] or d[nab_pick2]
      pick = _.pick(d, nab_pick1, nab_pick2)
      id   = _.pick(d, '_id')
      d    = _.extend(pick, id)
    # d.shuffle = Store.get("current_sorts_order") * d.rand
    # d.shuffle = parseInt( d.shuffle.toString().slice(1,4) )
    d

  result

Template.editor.events
  'click .save': (event, tmpl) ->
    event.preventDefault()

    save_type = event.currentTarget.getAttribute "data-save-type"
    collection = Store.get("nab").toProperCase()
    text = JSON.parse $(tmpl.find( "[data-text-type*=#{save_type}]" )).val()

    switch save_type
      when "update"
        window[collection].update _id: @_id,
          $set: text

      when "insert"
        window[collection].insert text

      when "unset"
        window[collection].update _id: @_id,
          $unset: text

      when "unset-all"
        window[collection].update {},
          $unset: text
        ,
          multi: true

      when "set"
        window[collection].update _id: @_id,
          $set: text

      when "set-all"
        window[collection].update {},
          $set: text
        ,
          multi: true

Template.admin_section.events
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
          console.log(text)
          out = text

    status.removeClass "error"
    Store.set( "nab_#{selector}", out )

