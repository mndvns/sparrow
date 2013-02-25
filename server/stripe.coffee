
stripeClientId = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt"
stripeClientSecret = "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"
stripeUrl = "https://connect.stripe.com/oauth/token"

stripe = StripeAPI "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"

Meteor.methods
  stripeTokenCreate: (customerId, access_token)->
    stripe_user_api = StripeApi "sk_test_AAKXLw2R4kozgEqCoMFu9ufH"
    Meteor.Future.create stripe_user_api, ["token", "create"],
      query:
        customer: customerId
    , (err, res) ->
      if Meteor.isServer
        if err
          console.log("ERR", err)
        else
          console.log("RES", res)

  stripeChargeCreate: (fields)->
    Meteor.Future.create stripe, ["charges", "create"],
      query:
        amount: fields.amount
        currency: "USD"
        customer: fields.user.stripe_customer_id
    , (err, res)->
      if Meteor.isServer
        if err
          console.log("ERR", err)
        else
          console.log("RES", res)


  stripeCustomerCreate: (token) ->
    Meteor.Future.create stripe, ["customers", "create"],
      query:
        card: token
        description: "A happy customer"
      keep: "id"
    , (err, res)->
      if err
        console.log("ERR", err)
      else
        console.log("RES", res)

  stripeSaveCustomerId: (customerId) ->
    Meteor.Future.update Meteor, ["users", "update"],
        _id: @userId
      , $set:
          stripe_customer_id: customerId
      , (err, res) ->
          return err or res


  stripeOauth: (code) ->
    Meteor.http.call "POST",
      "https://connect.stripe.com/oauth/token",
      data:
        client_secret: stripeClientSecret
        code: code
        grant_type: "authorization_code"
      , (err, res) =>
        if err
          console.log("ERROR", err)
          new Alert
            text: "Failed to connect to Stripe"
        console.log("SUCCESS", res)
        Meteor.users.update @userId,
          $set:
            stripe:
              access_token           : res.data.access_token
              refresh_token          : res.data.refresh_token
              stripe_publishable_key : res.data.stripe_publishable_key
              stripe_user_id         : res.data.stripe_user_id
          , =>
            new Alert
              text: "Successfully connected to Stripe"

  stripeGetAccessToken: (owner) ->
    @unblock()
    user = Meteor.users.findOne _id: owner
    token = user.stripe.access_token
    console.log(token)
    Meteor.call("derp")
    return token
  derp: ->
    console.log("DEEEERP")
