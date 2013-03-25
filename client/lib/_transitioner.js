(function(){
  var Transitioner;
  Transitioner = (function(){
    Transitioner.displayName = 'Transitioner';
    var prototype = Transitioner.prototype, constructor = Transitioner;
    function Transitioner(){
      this._currentPage = null;
      this._currentPageListeners = new Deps.Dependency();
      this._nextPage = null;
      this._nextPageListeners = new Deps.Dependency();
      this._direction = null;
      this._options = {};
    }
    prototype._transitionEvents = "webkitTransitionEnd.transitioner oTransitionEnd.transitioner transitionEnd.transitioner msTransitionEnd.transitioner transitionend.transitioner";
    prototype._transitionClasses = function(){
      return "transitioning from_" + this._currentPage + " to_" + this._nextPage + " going_" + this._direction;
    };
    prototype.setOptions = function(options){
      return _.extend(this._options, options);
    };
    prototype.currentPage = function(){
      Deps.depend(this._currentPageListeners);
      return this._currentPage;
    };
    prototype._setCurrentPage = function(page){
      this._currentPage = page;
      return this._currentPageListeners.changed();
    };
    prototype.nextPage = function(){
      Deps.depend(this._nextPageListeners);
      return this._nextPage;
    };
    prototype._setNextPage = function(page){
      this._nextPage = page;
      return this._nextPageListeners.changed();
    };
    prototype.listen = function(){
      var self;
      self = this;
      return Deps.autorun(function(){
        return self.transition(Sparrow.shift());
      });
    };
    prototype.transition = function(newPage){
      var self;
      self = this;
      if (!self._currentPage) {
        return self._setCurrentPage(Session.get("shift_current"));
      }
      if (self._nextPage) {
        self.endTransition();
      }
      if (self._currentPage === newPage) {
        return;
      }
      self._setNextPage(newPage);
      return Deps.afterFlush(function(){
        self._options.before && self._options.before();
        self.transitionClasses = self._transitionClasses();
        return $("body").addClass(self.transitionClasses).on(self._transitionEvents, function(e){
          if ($(e.target).is("body")) {
            return self.endTransition();
          }
        });
      });
    };
    prototype.endTransition = function(){
      var self;
      self = this;
      if (!self._nextPage) {
        return;
      }
      self._setCurrentPage(self._nextPage);
      self._setNextPage(null);
      return Deps.afterFlush(function(){
        var classes;
        classes = self.transitionClasses;
        $("body").off(".transitioner").removeClass(classes);
        return self._options.after && self._options.after();
      });
    };
    return Transitioner;
  }());
  Meteor.Transitioner = new Transitioner();
  return Meteor.startup(function(){
    return Meteor.Transitioner.listen();
  });
})();