
#                                            //
#         ______                             //
#        / ____/________  ____               //
#       / /   / ___/ __ \/ __ \              //
#      / /___/ /  / /_/ / / / /              //
#      \____/_/   \____/_/ /_/               //
#                                            //
#                                            //

tab = "  "

watch = (arg) ->
  console.log tab, arg.title.toUpperCase()
  for field of arg.fields
    if _.isEmpty(arg.fields[field])
      key = field
      value = arg.selector[field]
    else
      key = arg.fields[field].name
      value = arg.fields[field].value()
    console.log tab, tab, key + ": ", value
  console.log(" ")



cronSeconds = 360
Meteor.setInterval (->
  console.log("RAN CRON")

  u = Meteor.users.findOne( "username": "mikey" )
  watch
    selector: u
    title: u.username
    fields:
      karma: {}
      activeTags:
        name: "active tags"
        value: ->
          _.filter( u.stint.tags, (s)->
            s.active ).length

  t = Tags.findOne( "name" : "vegan" )
  watch
    selector: t
    title: "TAG (VEGAN)"
    fields:
      inv:
        name: "involves"
        value: ->
          _.filter( t.involves, (i) ->
            i.user = u._id ).length


  Meteor.users.find( "stint.tags": $exists: true ).forEach (user)->
    if user.karma <= 0 then return

    decreaseKarma = 0
    adjustedTags = []

    for tag in user.stint.tags
      if tag.active
        decreaseKarma += tag.ratio

        if decreaseKarma > user.karma
          tagsDisabled = true

        else
          tagsDisabled = false
          adjustedTags.push(tag.name)

    adjustedKarma = ((user.karma - (decreaseKarma / (60 / cronSeconds)))*100)/100
    # adjustedKarma = 2

    Meteor.users.update user._id,
      $set:
        karma: adjustedKarma

    Offers.update
      owner: user._id
    ,
      $set:
        tags: adjustedTags

    userOffer = Offers.findOne(owner: user._id)

    if userOffer
      Tags.update
        "involves.user": user._id
      ,
        $set:
          "involves.$.disabled": tagsDisabled
          "involves.$.votes_count": userOffer.votes_count
      ,
        multi: true

), cronSeconds * 1000


