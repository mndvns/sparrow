
Meteor.startup ->
  # unless Meteor.SignIn
  #   Meteor.SignIn = new SignIn()
  #   Meteor.SignIn.rally()

  unless Meteor.Links
    Meteor.Links = new Links()
    Meteor.Links.rally()

  # unless Meteor.Help
  #   Meteor.Help = new Help()
  #   Meteor.Help.rally()

  unless Meteor.Alert
    Meteor.Alert = new Alert()
    Meteor.Alert.rally()

    Alerts.remove owner: Meteor.userId(),
      multi: true

    Meteor.autorun ->
      newServerPane = Alerts.findOne()
      if newServerPane
        Meteor.Alert.set newServerPane
        Session.set Meteor.Alert.rallyPoint, newServerPane._id

