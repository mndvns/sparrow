

Meteor.methods

  upvoteEvent: (offer) ->
    App.Collection.Offers.update offer._id,
      $inc:
        votes_count: 1

  instance_save: ( model, ctx, cb )->

    attributes = ctx.mongoize ctx.attributes
    collection = App.Collection[ model + "s" ]

    if ctx.id
      collection.update ctx.id, { $set: attributes }
    else
      ctx.id = collection.insert attributes

    cb?(null, ctx)
    return ctx

