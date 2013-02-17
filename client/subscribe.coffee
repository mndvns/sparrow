
Meteor.subscribe "offers", Store.get("user_loc")
Meteor.subscribe "tagsets"
Meteor.subscribe "tags", Store.get("user_loc")

Meteor.subscribe "sorts"
Meteor.subscribe "images"
Meteor.subscribe "userData"
Meteor.subscribe "messages"
Meteor.subscribe "alerts"
