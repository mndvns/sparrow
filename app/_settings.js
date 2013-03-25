var distance, Color, Time, Stopwatch;
distance = function(lat1, lon1, lat2, lon2, unit){
  var radlat1, radlat2, radlon1, radlon2, theta, radtheta, dist;
  radlat1 = Math.PI * lat1 / 180;
  radlat2 = Math.PI * lat2 / 180;
  radlon1 = Math.PI * lon1 / 180;
  radlon2 = Math.PI * lon2 / 180;
  theta = lon1 - lon2;
  radtheta = Math.PI * theta / 180;
  dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === "K") {
    dist = dist * 1.609344;
  }
  if (unit === "N") {
    dist = dist * 0.8684;
  }
  return dist;
};
Color = net.brehaut.Color;
Time = {
  now: function(){
    return Date.now();
  },
  addMinutes: function(time, min){
    return moment(time).add('minutes', min).unix() * 1000;
  }
};
Stopwatch = (function(){
  Stopwatch.displayName = 'Stopwatch';
  var prototype = Stopwatch.prototype, constructor = Stopwatch;
  prototype.constructor = function(name){
    window[name] = this;
    this.countKeeper = 1;
    return this.start = Time.now();
  };
  prototype.click = function(){
    this.start = Time.now();
    return this.clicked = true;
  };
  prototype.stop = function(){
    var stopValue;
    switch (this.clicked) {
    case false:
      console.log("    redundant...");
      return this.clicked = null;
    case null:
      break;
    case true:
      switch (this.countKeeper) {
      case this.count:
        stopValue = numberWithCommas(Time.now() - this.start) + " milliseconds";
        console.log(stopValue, " for ", this.count, " items");
        return this.clicked = false;
      default:
        return this.countKeeper += 1;
      }
    }
  };
  prototype.setCount = function(count){
    this.count = count;
    return this.countKeeper = 1;
  };
  function Stopwatch(){
    this.setCount = bind$(this, 'setCount', prototype);
    this.stop = bind$(this, 'stop', prototype);
    this.click = bind$(this, 'click', prototype);
  }
  return Stopwatch;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}