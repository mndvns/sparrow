
Imgur = new imgur.Api("8b6312842b78297")
# Imgur.getImageInformation "0xR8KIv", (err, response)->
#   if (err)
#     console.log(err)
#   else
#     console.log(response)


onUpload = (err, res)->
  if err
    console.log("ERROR", err)
    @update
      status: "failed"
  else
    console.log("SUCCESS", res)
    @update
      status: "active"
      src: res.data.link
      imgur: true
      deletehash: res.data.deletehash

onDelete = (err, res)->
  if err
    console.log("ERROR", err)
    @remove()
  else
    console.log("SUCCESS", res)
    @remove()

class ImageInstance
  constructor: (@data)->
    @onUpload = onUpload
    @onDelete = onDelete

  update: (conf)->
    Images.update _id: @data._id,
      $set: conf
    ,
      new Alert
        text: "Successfully saved image"

  remove: ->
    Images.remove
      _id: @data._id


  # activate: ->
  #   Images.update
  #     owner: @data.owner
  #     _id:
  #       $nin: [@data._id]
  #   ,
  #     $set:
  #       status: "inactive"
  #   ,
  #     multi: true

  #   Images.update _id: @data._id,
  #     $set:
  #       status: "active"

  deactivate: ->
    Images.update _id: @data._id,
      $set:
        status: "deactivated"
    ,
      new Alert
        text: "Image successfully removed"

Meteor.methods
  imgurActivate: (image) ->
    imageInstance = new ImageInstance(image)
    imageInstance.activate()

  imgurDelete: (image, deletehash) ->
    console.log("DELETING FILE:")
    imageInstance = new ImageInstance(image)
    imageInstance.deactivate()
    if deletehash
      Imgur.delete deletehash, onDelete, imageInstance

  imgurPrepFile: (file) ->
    console.log("PREPPING FILE...")

    imageData = 
      owner: Meteor.userId()
      status: "prepped"
      imgur: false
      type: file.split(",")[0]
      src: file

    imageId = Images.insert imageData,
      new Alert
        text: "Saving image..."
        wait: true

    image = _.extend(imageData, _id: imageId)
    imageInstance = new ImageInstance( image )
    Imgur.uploadUrl imageData.src.split(",")[1], onUpload, imageInstance


  imgurUploadFile: (image) ->
    console.log("SENDING FILE:")

    url = image.src.split(",")[1]
    imageInstance = new ImageInstance(image)

    Imgur.uploadFile url, onUpload, imageInstance

  imgurUploadUrl: (url, ctx)->
    ctx = new syncFilesystem(ctx)
    # console.log(ctx)
    # return
    Imgur.uploadUrl url, ctx.onUpload
