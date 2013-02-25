

#                                                //
#           ______            _____              //
#          / ____/___  ____  / __(_)___ _        //
#         / /   / __ \/ __ \/ /_/ / __ `/        //
#        / /___/ /_/ / / / / __/ / /_/ /         //
#        \____/\____/_/ /_/_/ /_/\__, /          //
#                               /____/           //
#                                                //


window.App = {}
# window.__dirname = "http://localhost:3000/"

Stripe.setPublishableKey("pk_test_xB8tcSbkx4mwjHjxZtSMuZDf") 
Stripe.client_id = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"

Color = net.brehaut.Color
Store = Meteor.BrowserStore
Store.clear = ->
  for key of Store.keys
    console.log(key)
    Store.set(key, null)

Accounts.ui.config passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"

