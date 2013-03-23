(function(){
  var ms;
  ms = Meteor.subscribe;
  ms("relations", typeof My != 'undefined' && My !== null ? My.userLoc() : void 8, function(){
    console.log("SUBSCRIBE READY");
    return Session.set("subscribe_ready", true);
  });
  ms("my_offer");
  ms("my_tags");
  ms("my_pictures");
  ms("tagsets");
  ms("tags");
  ms("sorts");
  ms("userData");
  ms("messages");
  ms("alerts");
  ms("locations");
  ms("all_offers");
  return ms("tests");
})();