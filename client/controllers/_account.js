var as, draw_qrcode, create_qrcode, update_qrcode, permittedKeys, slice$ = [].slice;
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
Template.account_offer.events({
  "click .offer": function(event, tmpl){
    return false;
  },
  "keyup [data-validate], change [data-validate]": function(event, tmpl){
    var target, val, offer;
    target = event.currentTarget;
    val = target.value;
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
  },
  'click #qr-button': function(event, tmpl){
    var offerId, url;
    offerId = this.business;
    url = "http://deffenbaugh.herokuapp.com/offer/";
    return update_qrcode();
  }
});
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
          var canvas;
          canvas = document.createElement("canvas");
          return new thumbnailer(canvas, img, 500, 3, function(){
            return Meteor.call("imgurPrepFile", this.canvas.toDataURL());
          });
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
    Meteor.call("imgurDelete", this, this.deletehash);
    return this.destroy();
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
  'click .create-tag .insert': function(event, tmpl){
    var x$;
    x$ = Tag['new']({
      name: tmpl.find('input').value
    });
    x$.save();
    return x$;
  },
  "click li[data-group='tagset']": function(e, t){
    var x$;
    x$ = Offer.storeGet();
    x$.setStore('tagset', this.name);
    x$.save();
    return x$;
  },
  "click li[data-group='tags']": function(e, t){
    var x$;
    switch (partialize$.apply(_, [_.contains, [void 8, this.name], [0]])(
    My.map("name", "tags"))) {
    case true:
      return this.cloneKill("name");
    default:
      x$ = this.cloneNew();
      x$.save();
      return x$;
    }
  }
});
Template.account_offer_tags.helpers({
  "contains_my_tags": function(it){
    return partialize$.apply(_, [_.contains, [void 8, it], [0]])(
    My.map("name", "tags"));
  }
});
Template.account_messages_feedback.events({
  'click #feedback button': function(event, tmpl){
    var message;
    event.preventDefault();
    message = tmpl.find("textarea").value;
    return Meteor.call("message", message, "toAdmins");
  }
});
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
function partialize$(f, args, where){
  var context = this;
  return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ?
      partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
  };
}