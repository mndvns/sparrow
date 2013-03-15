
$.fn.fitText = function( kompressor, options ) {

  // Setup options
  var compressor = kompressor || 1,
      settings = $.extend({
        'minFontSize' : Number.NEGATIVE_INFINITY,
        'maxFontSize' : Number.POSITIVE_INFINITY
      }, options);

  return this.each(function(){

    // Store the object
    var $this = $(this); 
    // Resizer() resizes items based on the object width divided by the compressor * 10
    var resizer = function () {
      var size = Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize));
      $this.css({
        'font-size': size,
        'line-height': size + "px"
      })
    };

    // Call once to set.
    resizer();

    // Call on resize. Opera debounces their resize by default. 
    $(window).on('resize', resizer);
      
  });

};
