Meteor.startup(function(){
  var i, j;
  i = 0;
  j = [" ", " ", "   ____", "  / __/___  ___ _ ____ ____ ___  _    __", " _\\ \\ / _ \\/ _ `// __// __// _ \\| |/|/ /", "/___// .__/\\_,_//_/  /_/   \\___/|__,__/ ", "    /_/", " ", " "];
  while (i < j.length) {
    console.log("         ", j[i]);
    i += 1;
  }
  return Locations._ensureIndex({
    geo: "2d"
  });
});