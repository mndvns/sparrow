

Meteor.methods

  upvoteEvent: (offer) ->
    App.Collection.Offers.update offer._id,
      $inc:
        votes_count: 1

  instance_destroy_mine: ( collection ) ->
    App.Collection[ collection ].remove ownerId: My.userId()

