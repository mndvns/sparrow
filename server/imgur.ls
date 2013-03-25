

Imgur = new imgur.Api("8b6312842b78297")
# Imgur.getImageInformation "0xR8KIv", (err, response)->
#   if (err)
#     console.log(err)
#   else
#     console.log(response)


Meteor.methods {}=
  imgur-delete: (image, deletehash) ->
    if deletehash
      console.log "DELETING..."
      Imgur.delete deletehash, image.destroy

  imgur-prep-file: (file) ->
    console.log("PREPPING FILE...")

    pic = Picture.new {}=
      status: "prepped"
      imgur: false
      src: file

    pic.save!

    Imgur.upload-url pic.src.split(",")[1], pic.on-upload, pic


  imgur-upload-file: (image) ->
    console.log("SENDING FILE...")

    url = image.src.split(",")[1]
    pic = Picture.new image

    Imgur.uploadFile url, pic.on-upload, pic



