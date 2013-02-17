
Meteor.startup ->
  unless Meteor.Help
    Meteor.Help = new Help()
    Meteor.Help.rally()

  unless Meteor.Alert
    Meteor.Alert = new Alert()
    Meteor.Alert.rally()

    Meteor.autorun ->
      newServerPane = Alerts.findOne()
      if newServerPane
        Meteor.Alert.set newServerPane
        Session.set Meteor.Alert.rallyPoint, newServerPane._id

