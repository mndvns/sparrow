

stripe-client-id     = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"
stripe-client-secret = "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"
stripe-url           = "https://connect.stripe.com/oauth/token"

stripe    =    StripeAPI "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"
my-stripe = -> StripeAPI "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"

Future = require "fibers/future"

Meteor.methods {}=

  stripe_charges_create: ( offer, cust_or_token, access-token )->
    f = new Future!

    switch typeof! cust_or_token
    | "String"  => out = { customer : cust_or_token }
    | _         => out = { card     : cust_or_token }

    out.amount          = do -> parse-int(offer.price) * 100
    out.application_fee = do -> out.amount * 5
    out.currency        = "USD"

    stripe = StripeAPI access-token
    stripe.charges.create out, (err, res)->
      if err
        console.log("ERR in CHARGE CREATE", err)
        f.return [ res, 0 ]
      else
        console.log("RES in CHARGE CREATE", res)
        f.return [ 0, res ]
    f.wait!


  stripe_token_create : ( cust-id, access-token ) ->
    f = new Future!

    stripe = StripeAPI access-token
    stripe.token.create { customer: cust-id }, (err, res)->
    # my-stripe!token.create { customer: cust-id }, (err, res)->
      if err
        console.log("ERR in TOKEN CREATE", err)
        f.return [ res, 0 ]
      else
        console.log("RES in TOKEN CREATE", res)
        f.return [ 0, res ]
    f.wait!


  stripe_customers_create: ( card ) ->
    f = new Future!

    out =
      card        : card
      description : do -> My.user!username

    my-stripe!customers.create out, (err, res) ->
      if err
        console.log("ERR in CUSTOMER CREATE", err)
        f.return [ res, 0,  ]
      else
        console.log("RES in CUSTOMER CREATE", res)
        f.return [ 0, res ]
    f.wait!

  stripe_customers_save: ( customer ) ->
    f = new Future!

    my-cust = My.customer?!

    if my-cust
      console.log "CUSTOMER ALREADY... UPDATING..."
      my-cust.update customer, (err, res) ->
        if err
          console.log("ERR in CUSTOMER UPDATE", err)
          f.return [ res, 0 ]
        else
          console.log("RES in CUSTOMER UPDATE", res)
          f.return [ 0, res ]
    else
      console.log "NO CUSTOMER... SAVING..."
      Customer.new customer .save (err, res) ->
        if err
          console.log("ERR in CUSTOMER SAVE", err)
          f.return [ res, 0 ]
        else
          console.log("RES in CUSTOMER SAVE", res)
          f.return [ 0, res ]
    f.wait!

  stripe_get_access_token: (owner) ->
    @unblock()
    user = Meteor.users.find-one _id: owner
    token = user.stripe.access_token
    console.log(token)
    Meteor.call("derp")
    return token
  derp: ->
    console.log("DEEEERP")
