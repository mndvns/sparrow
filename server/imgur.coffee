
Imgur = new imgur.Api("8b6312842b78297")
# Imgur.getImageInformation "0xR8KIv", (err, response)->
#   if (err)
#     console.log(err)
#   else
#     console.log(response)


class syncFilesystem
  constructor: (file) ->
    @_id = file._id

  update: (values) =>
    Filesystem.files.update _id: @_id,
      $set: values

  onUpload: (err, response) =>
    if err
      console.log("CTX", @)
      console.log(err)
    else
      console.log("CTX", @)
      @update 
        imgur: response.data
        imgur_status: response.status

Meteor.methods
  imgurUploadUrl: (url, ctx)->
    ctx = new syncFilesystem(ctx)
    # console.log(ctx)
    # return
    Imgur.uploadUrl url, ctx.onUpload
