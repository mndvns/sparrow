var as, draw_qrcode, create_qrcode, update_qrcode, permittedKeys, ref$;
as = amplify.store;
draw_qrcode = function(text, typeNumber, errorCorrectLevel){
  return document.write(create_qrcode(text, typeNumber, errorCorrectLevel));
};
create_qrcode = function(text, typeNumber, errorCorrectLevel, table){
  var qr;
  qr = qrcode(typeNumber || 4, errorCorrectLevel || "M");
  qr.addData(text);
  qr.make();
  return qr.createTableTag();
};
update_qrcode = function(){
  return $(qrCode + "").html(create_qrcode(url + offerId)).find("td").css({
    width: "10px",
    height: "10px"
  });
};
permittedKeys = [8, 37, 38, 39, 40, 46, 9, 91, 93];
Handlebars.registerHelper("charMax", function(a){
  return Offer._schema[a].max;
});
Handlebars.registerHelper("charLeft", function(a){
  var ref$;
  return Offer._schema[a].max - ((ref$ = this[a]) != null ? ref$.length : void 8);
});
Handlebars.registerHelper("getEmail", function(a){
  var user;
  user = Meteor.user();
  return (user != null ? user.emails : void 8) && user.emails[0];
});
Template.account_offer.events((ref$ = {
  "click .offer": function(event, tmpl){
    return false;
  },
  "keyup [data-validate], change [data-validate]": function(event, tmpl){
    var target, val, offer;
    target = event.currentTarget;
    val = target.value.toString();
    offer = Offer.storeGet();
    offer[target.id] = val;
    return Offer['new'](offer).storeSet();
  },
  'keydown [data-validate]#price': function(e, t){
    var isNumberKey;
    isNumberKey = function(evt){
      var charCode;
      charCode = evt.which
        ? evt.which
        : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    };
    if (!isNumberKey(e)) {
      return false;
    }
  }
}, ref$["click " + qrButton] = function(event, tmpl){
  var offerId, url;
  offerId = this.business;
  url = "http://deffenbaugh.herokuapp.com/offer/";
  return update_qrcode();
}, ref$));
Template.account_offer.created = function(){
  if (!Store.get("show_account_offer")) {
    Store.set("show_account_offer", "account_offer_info");
  }
  return Offer.loadStore();
};
Template.account_profile_colors.rendered = function(){
  var this$ = this;
  return $(this.find("input.color")).spectrum({
    showButtons: true,
    flat: true,
    showInput: true,
    showPallette: true,
    showSelectionPallette: true,
    pallette: [],
    localStorageKey: "color.pallete",
    color: offer.color,
    change: function(color){
      return Meteor.call("updateUserColor", color.toHexString());
    },
    move: function(color){
      return $(this$.find(".color-bucket")).css("background", color.toHexString());
    }
  });
};
Template.account_offer_images.events({
  'click .select-file': function(e, t){
    var target;
    target = $(e.currentTarget);
    $("section.image div").attr("class", "").css("background-image", "url(" + this.src + ")");
    as("image", this.src);
    return Store.set("offer_active_image", this.src);
  },
  'click .save-file': function(e, t){
    return Meteor.call("imgurUploadFile", this);
  },
  'click .file-input .proxy': function(e, t){
    return $(e.currentTarget).siblings("input").trigger('click');
  },
  "change .file-uploader": function(e, t){
    var file, ref$, reader;
    file = (ref$ = e.target.files) != null ? ref$[0] : void 8;
    Meteor.Alert.set({
      text: "Compressing image...",
      wait: true
    });
    if (file) {
      reader = new FileReader();
      reader.onloadend = function(e){
        var img;
        img = new Image();
        img.onload = function(){
          return Meteor.call("imgurPrepFile", reader.result);
        };
        return img.src = reader.result;
      };
      return reader.readAsDataURL(file);
    }
  },
  'click .file': function(e, t){
    return console.log(this);
  },
  'click .delete-file': function(e, t){
    return Meteor.call("imgurDelete", this, this.deletehash);
  }
});
Template.account_offer_images.rendered = function(){
  var adjustFileInput, this$ = this;
  adjustFileInput = function(){
    var file_input, width, proxy, proxy_height;
    file_input = $(this$.find(".file-input"));
    width = file_input.width();
    file_input.height(width);
    proxy = $(this$.find(".proxy span"));
    proxy_height = width / 2 - proxy.height() / 2;
    return proxy.css("top", proxy_height + "px");
  };
  adjustFileInput();
  return $(window).on("resize", function(){
    return _.throttle(adjustFileInput(), 100);
  });
};
Template.account_offer_tags.events({
  'dblclick li[data-group="tags"]': function(event, tmpl){
    return Tags.remove({
      name: $(event.currentTarget).attr("data-name")
    });
  },
  'click .create-tag .insert': function(event, tmpl){
    var target, text, tagset;
    target = $(event.currentTarget);
    text = target.next("span").children("input").val();
    if (!text) {
      return Meteor.Alert.set({
        text: "You must enter a name in order to add a tag"
      });
    } else {
      tagset = target.parent("li").attr("data-tagset");
      return Meteor.call("insertTag", {
        name: text,
        tagset: tagset,
        involves: [],
        collection: "tags"
      }, function(err, res){
        var userLoc, store;
        if (err) {
          return Meteor.Alert.set({
            text: err.reason
          });
        } else {
          userLoc = Store.get("user_loc");
          store = Store.get("tag_selection");
          store.tags == null && (store.tags = []);
          store.tags.push({
            name: text,
            tagset: tagset,
            active: true
          });
          console.log(res);
          amplify.store("tagset", store.tagset);
          Store.set("tag_selection", store);
          return Meteor.flush();
        }
      });
    }
  },
  "click li[data-group='tags'], click li[data-group='tagset']": function(event, tmpl){
    var group, store, self, existing, ref$;
    group = $(event.currentTarget).attr("data-group");
    store = Store.get("tag_selection") || {};
    self = this;
    console.log(self);
    store[group] == null && (store[group] = []);
    if (group === "tagset") {
      store.tags = [];
      store.tagset = [];
    }
    existing = _.find(store[group], function(g){
      return g.name === self.name;
    });
    if (existing) {
      store[group].splice(store[group].indexOf(existing), 1);
    } else {
      store[group].push({
        name: self.name,
        disabled: false,
        active: true
      });
    }
    Store.set("tag_selection", store);
    amplify.store("tags_meta", store.tags, "name");
    amplify.store("tags", _.pluck(store.tags, "name"));
    return amplify.store("tagset", (ref$ = _.pluck(store.tagset, "name")) != null ? ref$[0] : void 8);
  }
});
Template.account_messages_feedback.events((ref$ = {}, ref$["click " + feedback + " button"] = function(event, tmpl){
  var message;
  event.preventDefault();
  message = tmpl.find("textarea").value;
  return Meteor.call("message", message, "toAdmins");
}, ref$));
Template.account_messages.rendered = function(){
  Store.set("page_account", "account_messages");
  return Store.set("page_account_messages", "account_messages_inbox");
};
Template.account_message.events({
  "click .send": function(event, tmpl){
    var textarea;
    textarea = $(tmpl.find("textarea"));
    console.log(tmpl.data);
    return Meteor.call("message", textarea.val(), "reply", tmpl.data._id);
  }
});
Template.account_earnings.rendered = function(){
  Store.set("page_account", "account_earnings");
  return Store.set("page_account_earnings", "account_earnings_dashboard");
};
Template.account_earnings_dashboard.events({
  'click a.stripe-connect': function(event, tmpl){
    Meteor.Alert.set({
      text: "Connecting to Stripe...",
      wait: true
    });
    return window.open("https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + Stripe.client_id);
  }
});