var type;
type = function(obj){
  var classToType, i$, ref$, len$, name, myClass;
  if (obj == null) {
    return String(obj);
  }
  classToType = new Object;
  for (i$ = 0, len$ = (ref$ = "Boolean Number String Function Array Date RegExp".split(" ")).length; i$ < len$; ++i$) {
    name = ref$[i$];
    classToType["[object " + name + "]"] = name.toLowerCase();
  }
  myClass = Object.prototype.toString.call(obj);
  if (myClass in classToType) {
    return classToType[myClass];
  }
  return "object";
};