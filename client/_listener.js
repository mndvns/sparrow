var Listener, Alert;
Listener = (function(){
  Listener.displayName = 'Listener';
  var prototype = Listener.prototype, constructor = Listener;
  prototype.rally = function(){
    var this$ = this;
    return Deps.autorun(function(){
      var newPane;
      newPane = Session.get(this$.rallyOoint);
      if (!newPane) {
        return;
      }
      this$._ready(newPane);
      this$.rallyPoint = '#terrace-alert';
      this$.$rally = $('#terrace-alert');
      this$.$king = $('.ceiling');
      return typeof this$.ready === 'function' ? this$.ready() : void 8;
    });
  };
  prototype.trigger = function(){
    var x$, ref$, this$ = this;
    x$ = this.toggle.removeClass("off");
    x$.addClass("on");
    x$.on("click", function(){
      return this$.cleanUp();
    });
    this._active = Time.now();
    if ((ref$ = this.$king) != null) {
      ref$.attr("data-rally", this.name);
    }
    return Session.set(this.rallyPoint, Random.id());
  };
  prototype._ready = function(newPane){
    var ref$;
    if ((ref$ = this.$rally) != null) {
      ref$.find(".rally-out").remove();
    }
    this._aim(newPane);
    return this.aim();
  };
  prototype._aim = function(newPane){
    this._fire(newPane);
    return this.fire();
  };
  prototype._fire = function(newPane){
    if (this.currentPane === newPane) {
      return;
    }
    this.currentPane = this.newPane;
    this.exitCurrentPane(this.currentPane);
    this.newPane = newPane;
    if (!this._text) {
      return;
    }
    return this.enterNewPane();
  };
  prototype.enterNewPane = function(){
    var ref$;
    return (ref$ = this.$rally) != null ? ref$.append("<div data-pane-id=" + this.newPane + " class='terrace-" + this.name + "-pane rally-in'>\n  " + this.paneContent + "\n</div>") : void 8;
  };
  prototype.exitCurrentPane = function(currentPane){
    var ref$;
    return (ref$ = this.$rally) != null ? ref$.find("[data-pane-id=" + currentPane + "]").addClass("rally-out").removeClass("rally-in") : void 8;
  };
  prototype.killToggle = function(){
    var x$;
    x$ = this.toggle.removeClass("on");
    x$.addClass("off");
    x$.off();
    return x$;
  };
  prototype.finish = function(){
    if (this.toggle.is(".on")) {
      this.killToggle();
    }
    this._active = 0;
    this.$rally.attr("style", "");
    this.$rally.css({
      display: "none"
    });
    this.$king.attr("data-rally", "");
    return Session.set(this.rallyPoint, null);
  };
  Listener['new'] = function(){
    return new this;
  };
  function Listener(){
    this.finish = bind$(this, 'finish', prototype);
    this.killToggle = bind$(this, 'killToggle', prototype);
    this.exitCurrentPane = bind$(this, 'exitCurrentPane', prototype);
    this.enterNewPane = bind$(this, 'enterNewPane', prototype);
    this._fire = bind$(this, '_fire', prototype);
    this._aim = bind$(this, '_aim', prototype);
    this._ready = bind$(this, '_ready', prototype);
    this.trigger = bind$(this, 'trigger', prototype);
    this.rally = bind$(this, 'rally', prototype);
  }
  return Listener;
}());
Alert = (function(superclass){
  var prototype = extend$((import$(Alert, superclass).displayName = 'Alert', Alert), superclass).prototype, constructor = Alert;
  prototype.set = function(args){
    var wait, this$ = this;
    this.name = "alert";
    this._text = args.text || "Lorem ipsum";
    this._el = args.el || "p";
    this._time = args.time || 5000;
    this._wait = args.wait || false;
    this._speed = 400;
    this.paneContent = "<" + this._el + ">" + this._text + "</" + this._el + ">";
    this.toggle = $('#dimmer');
    if (args.owner) {
      Alerts.remove({
        owner: args.owner
      });
    }
    if (this._active) {
      wait = Time.now() - this._active;
      console.log("STILL ACTIVE", wait);
      if (wait < 1000) {
        Meteor.setTimeout(function(){
          return this$.prep();
        }, 1000);
      } else {
        this.prep();
      }
    } else {
      this.prep();
    }
    return void 8;
  };
  prototype.prep = function(){
    if (this.timoutId != null) {
      this.clearTimeout();
    }
    if (this._wait === false) {
      this.setTimeout();
    }
    return this.trigger();
  };
  prototype.setTimeout = function(){
    var ref$, this$ = this;
    this.timeoutId = Meteor.setTimeout(function(){
      return this$.cleanUp();
    }, this._time);
    if ((ref$ = this.$rally) != null) {
      ref$.on("mouseenter", function(){
        return this$.clearTimeout();
      });
    }
    return (ref$ = this.$rally) != null ? ref$.on("mouseleave", function(){
      return this$.setTimeout();
    }) : void 8;
  };
  prototype.clearTimeout = function(){
    return Meteor.clearTimeout(this.timeoutId);
  };
  prototype.ready = function(){
    var ref$;
    return (ref$ = this.$rally) != null ? ref$.slideDown().fadeIn() : void 8;
  };
  prototype.aim = function(){};
  prototype.fire = function(){};
  prototype.cleanUp = function(){
    var ref$, this$ = this;
    this.killToggle();
    if ((ref$ = this.$rally) != null) {
      ref$.animate({
        opacity: 0
      }, this.speed * 10);
    }
    return this.$rally.animate({
      height: 0,
      marginTop: -15
    }, this.speed, function(){
      this$.clearTimeout();
      return this$.finish();
    });
  };
  function Alert(){
    this.cleanUp = bind$(this, 'cleanUp', prototype);
    this.fire = bind$(this, 'fire', prototype);
    this.aim = bind$(this, 'aim', prototype);
    this.ready = bind$(this, 'ready', prototype);
    this.clearTimeout = bind$(this, 'clearTimeout', prototype);
    this.setTimeout = bind$(this, 'setTimeout', prototype);
    Alert.superclass.apply(this, arguments);
  }
  return Alert;
}(Listener));
Meteor.startup(function(){
  var alert;
  if (!Meteor.Alert) {
    Meteor.Alert = new Alert();
    Meteor.Alert.rally();
    alert = My.alert();
    if (alert != null) {
      Alerts.remove(alert);
    }
    return Meteor.autorun(function(){
      var newServerPane;
      newServerPane = Alerts.findOne();
      if (newServerPane) {
        if (Alert != null) {
          if (typeof Alert.set === 'function') {
            Alert.set(newServerPane);
          }
        }
        return Session.set(Alert.rallyPoint, newServerPane._id);
      }
    });
  }
});
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}