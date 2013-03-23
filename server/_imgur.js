var Imgur;
Imgur = new imgur.Api("8b6312842b78297");
Meteor.methods({
  imgurDelete: function(image, deletehash){
    if (deletehash) {
      console.log("DELETING...");
      return Imgur['delete'](deletehash, image.destroy);
    }
  },
  imgurPrepFile: function(file){
    var pic;
    console.log("PREPPING FILE...");
    pic = Picture['new']({
      status: "prepped",
      imgur: false,
      src: file
    });
    return pic.save();
  },
  imgurUploadFile: function(image){
    var url, pic;
    console.log("SENDING FILE...");
    url = image.src.split(",")[1];
    pic = Picture['new'](image);
    return Imgur.uploadFile(url, pic.onUpload, pic);
  }
});