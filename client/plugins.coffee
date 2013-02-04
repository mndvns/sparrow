(($) ->
  $.fn.toggleAttr = (attr, val1, val2) ->
    
    #/<summary>Toggles an attribute between having one of two possible states</summary>
    #/<param name="attr">Attribute name</param>
    #/<param name="val1">First value</param>
    #/<param name="val2">Second value</param>
    @each ->
      $this = $(this)
      if $this.attr(attr) is val1
        $this.attr attr, val2
      else
        $this.attr attr, val1


  top = "-5px"
  $.fn.slipShow = (speed) ->
    $(this)
      .css
        top: top
        position: "relative"
      .slideDown speed, ->
        $(this).animate
          opacity: 1
          top: 0

  $.fn.slipHide = (speed) ->
    $(this)
      .css
        position: "relative"
        top: 0
      .animate
        opacity: 0
        top: top
      .slideUp speed



) jQuery
