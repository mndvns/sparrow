Meteor.startup(function(){
  var i, j;
  i = 0;
  j = [" ", " ", "   ____", "  / __/___  ___ _ ____ ____ ___  _    __", " _\\ \\ / _ \\/ _ `// __// __// _ \\| |/|/ /", "/___// .__/\\_,_//_/  /_/   \\___/|__,__/ ", "    /_/", " ", " "];
  while (i < j.length) {
    console.log("         ", j[i]);
    i += 1;
  }
  App.Collection.Locations._ensureIndex({
    geo: "2d"
  });
  Meteor.Future = {};
  Meteor.Future.create = function(target, apply, pipeline, cb){
    var future;
    future = new Future();
    target[apply[0]][apply[1]](pipeline.query, function(err, res){
      var e, ref$, r;
      e = err != null ? (ref$ = err.response) != null ? ref$.error : void 8 : void 8;
      r = res;
      cb(e, r);
      return future['return']([e, !e ? r[pipeline.keep] || "OK" : void 8]);
    });
    return future.wait();
  };
  Meteor.Future.update = function(target, apply, query, update, cb){
    var future;
    future = new Future();
    target[apply[0]][apply[1]](query, update, function(err, res){
      cb(err, res);
      return future['return']([err != null ? err.response.error : void 8, !err ? "OK" : void 8]);
    });
    return future.wait();
  };
  return App.Collection.Tags.aggregate = function(pipline){
    var self, future, result;
    self = this;
    future = new Future();
    self.find()._mongo.db.createCollection(self._name, function(err, collection){
      if (err) {
        future['throw'](err);
        return;
      }
      return collection.aggregate(pipline, function(err, result){
        if (err) {
          future['throw'](err);
          return;
        }
        return future.ret([true, result]);
      });
    });
    result = future.wait();
    if (!result[0]) {
      throw result[1];
    }
    return result[1];
  };
});