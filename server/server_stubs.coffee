

Meteor.methods
  upvoteEvent: (offer) ->
    @unblock()
    # App.Collection.Offers.update offer._id,
    #   $inc:
    #     votes_count: 1

    App.Collection.Offers.update offer._id,
      $push:
        votes_meta:
          user: @userId
          exp: Time.now()
      $inc:
        votes_count: 1

    Meteor.users.update offer.owner,
      $inc:
        karma: 1

  instance_save: ( model, ctx, cb ) ->
    @unblock()

    m = App.Model[ model ]
    c = App.Collection[ model + "s" ]

    # console.log("MODEL", m )

    i    = m.new ctx.attributes
    i.id = ctx.id

    try
      i.validate()

    catch error
      console.log("ERROR", error)
      throw new Meteor.Error( "400", error.message )

    if ctx.id
      c.update ctx.id,
        $set: i.attributes
    else
      i.id = c.insert i.attributes

    return i


