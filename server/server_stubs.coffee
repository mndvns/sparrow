

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

  instance_destroy_mine: ( collection ) ->
    App.Collection[ collection ].remove ownerId: My.userId()
