

Meteor.methods
  upvoteEvent: (offer) ->
    @unblock()
    # Offers.update offer._id,
    #   $inc:
    #     votes_count: 1

    Offers.update offer._id,
      $push:
        votes_meta:
          user: @userId
          exp: Time.now()
      $inc:
        votes_count: 1

    Meteor.users.update offer.owner,
      $inc:
        karma: 1


