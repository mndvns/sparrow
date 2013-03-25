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
  ms("my_messages");
  ms("my_alerts");
  ms("tagsets");
  ms("sorts");
  ms("votes");
  ms("all_offers");
  return ms("user_data");
})();