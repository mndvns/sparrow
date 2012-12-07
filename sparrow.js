if (Meteor.isClient) {

  Template.hello.events({
    'click input' : function () {
      Accounts.createUser({
        username: $('#inputUsername').val(),
        password: $('#inputPassword').val(),
        type: 'admin'
      })
      console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
