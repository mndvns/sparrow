

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

    m = App.Model[ model ].new ctx.attributes
    c = App.Collection[ model + "s" ]

    try
      m.validate()

    catch error
      console.log("ERROR", error)
      throw new Meteor.Error( "400", error.message )

    finish = (err, res) ->
      if res
        console.log "SUCCESS"
        m
      else
        console.log "BAD STUFF"
        m

    if ctx.id
      c.update ctx.id, $set: m.attributes, finish
    else
      m.id = c.insert m.attributes, finish


  instance_destroy_mine: ( collection ) ->
    App.Collection[ collection ].remove ownerId: My.userId()
