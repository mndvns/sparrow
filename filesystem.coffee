
Filesystem = new CollectionFS "filesystem"

Filesystem.allow
  insert: (userId, myFile) ->
    userId and myFile.owner is userId

  update: (userId, files, fields, modifier) ->
    return true
    _.all files, (myFile) ->
      userId is myFile.owner


  #EO interate through files
  remove: (userId, files) ->
    true

Filesystem.fileHandlers
  default1: (options) -> #Options contains blob and fileRecord - same is expected in return if should be saved on filesytem, can be modified
    console.log "I am handling 1: " + options.fileRecord.filename
    blob: options.blob #if no blob then save result in fileURL (added createdAt)
    fileRecord: options.fileRecord

  default2: (options) ->
    #Save som space, only make cache if less than 1Mb
    return null  if options.fileRecord.length > 5000000 or options.fileRecord.contentType isnt "image/jpeg" #Not an error as if returning false, false would be tried again later...
    console.log "I am handling 2: " + options.fileRecord.filename
    blob: options.blob
    fileRecord: options.fileRecord

  default3: (options) ->
    return null  if options.fileRecord.length > 5000000 or options.fileRecord.contentType isnt "image/jpeg"
    console.log "I am handling 2: " + options.fileRecord.filename
    blob: options.blob
    fileRecord: options.fileRecord

  default4: (options) ->
    return null  if options.fileRecord.length > 5000000 or options.fileRecord.contentType isnt "image/jpeg"
    console.log "I am handling 2: " + options.fileRecord.filename
    blob: options.blob
    fileRecord: options.fileRecord

  default5: (options) ->
    return null  if options.fileRecord.length > 5000000 or options.fileRecord.contentType isnt "image/jpeg"
    console.log "I am handling 2: " + options.fileRecord.filename
    blob: options.blob
    fileRecord: options.fileRecord

  size40x40: (options) ->
    return null
    
    #var im = __meteor_bootstrap__.require('imagemagick');
    #		im.resize({
    #                srcData: options.blob,
    #                width: 40
    #           });
    console.log "I am handling: " + options.fileRecord.filename + " to..."
    extension: "bmp" #or just 'options'...
    blob: options.blob
    fileRecord: options.fileRecord
