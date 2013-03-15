(($) ->
  $.fn.toggleAttr = (attr, val1, val2) ->
    
    #/<summary>Toggles an attribute between having one of two possible states</summary>
    #/<param name="attr">Attribute name</param>
    #/<param name="val1">First value</param>
    #/<param name="val2">Second value</param>
    @each ->

      $this = $(this)

      if $this.attr(attr) is val2 then $this.attr(attr, val1)
      else $this.attr(attr, val2)

      # if not val1 and not valthis.setAttribute(attr)

      # if $this.attr(attr) is val1
      #   $this.attr attr, val2

      # else
      #   $this.attr attr, val1


  top = "-5px"
  $.fn.slipShow = (opt, cb) ->
    @each ->
      self = $(this)
      if self.attr("data-slip-show") is "true" then return
      self
        .css
          top: unless opt.top then top
          position: "relative"
        .slideDown( opt.speed * 2 )

      self.animate
        opacity: 1
        top: 0,
        ( opt.speed / opt.haste ), ->
          $(this).attr("data-slip-show", true)
          if cb and typeof cb is "function" then cb()

  $.fn.slipHide = ( opt, cb ) ->
    self = $(this)

    self.animate
      opacity: 0
      top: unless opt.top then top
      ( opt.speed )

    self
      .css
        position: "relative"
        top: 0
      .slideUp(( opt.speed * 2 ), ->
        $(this).attr("data-slip-show", false)
        $(this).attr "style", ""
        if cb and typeof cb is "function" then cb()
      )


) jQuery
