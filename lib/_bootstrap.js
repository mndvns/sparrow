var A, App, log, require, path, basepath, ref$, arrayRepeat, numberWithCommas;
A = App = Meteor.App = {};
log = function(){
  return console.log(arguments);
};
if (Meteor.isServer) {
  require = __meteor_bootstrap__.require;
  path = require("path");
  basepath = path.resolve('.');
}
ref$ = String.prototype;
ref$.toProperCase = function(){
  return this.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
ref$.repeat = function(it){
  return new Array(it + 1).join("");
};
arrayRepeat = function(value, len){
  var out;
  len += 1;
  out = [];
  while (len -= 1) {
    out.push(value);
  }
  return out;
};
numberWithCommas = function(x){
  return x != null ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : void 8;
};