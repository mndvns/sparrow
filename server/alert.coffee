class Alert
  constructor: (conf)->
    Alerts.insert
      owner: Meteor.userId()
      text: conf.text
      wait: conf.wait or false
