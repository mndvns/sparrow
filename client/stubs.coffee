

Meteor.methods

  upvoteEvent: (offer) ->
    Offers.update offer._id,
      $inc:
        votes_count: 1

