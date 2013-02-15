
stripe = StripeAPI "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE"

Meteor.methods
  stripeChargeCreate: (fields)->
    Meteor.Future.create stripe, ["charges", "create"],
      query:
        amount: fields.amount
        currency: "USD"
        customer: fields.user.stripe
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
          stripe: customerId
      , (err, res) ->
          return err or res
