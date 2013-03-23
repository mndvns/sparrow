var checkHelpMode, Sparrow, statCurrent, statRange, slipElements, colorFill, Conf;
checkHelpMode = function(){
  return $(".wrapper").hasClass("help-mode");
};
Sparrow = {};
Sparrow.shift = function(){
  return Session.get("shift_area");
};
statCurrent = function(){
  var out, ref$, article;
  out = {
    query: {
      tagset: Store.get("current_tagsets"),
      tag: Store.get("current_tags"),
      sort: {
        verbose: Store.get("current_sorts"),
        specifier: Store.get("current_sorts_specifier"),
        selector: Store.get("current_sorts_selector"),
        order: Store.get("current_sorts_order")
      }
    },
    verbose: {
      tagset: Store.get("current_tagsets"),
      tag: Store.get("current_tags"),
      sort: Store.get("current_sorts"),
      sort_selector: Store.get("current_sorts_selector"),
      noun: Store.get("current_nouns")
    }
  };
  out.verbose.tagset = (ref$ = out.verbose.tagset) != null && ref$.length
    ? out.verbose.tagset
    : ["find"];
  out.verbose.noun = (ref$ = out.verbose.noun) != null && ref$.length
    ? out.verbose.noun
    : ["offer"];
  out.verbose.article = (ref$ = out.verbose.sort) != null && ref$.length
    ? ["the"]
    : ["some"];
  if (out.verbose.sort_selector === "$natural") {
    out.verbose.sort_selector = "distance";
  }
  if (out.verbose.tagset.toString() === "shop") {
    article = out.verbose.article.toString();
    out.verbose.article = ["for " + article];
  }
  return out;
};
statRange = function(){
  var out;
  out = {
    max: {
      updatedAt: amplify.store("max_updatedAt"),
      distance: amplify.store("max_distance"),
      votes_count: amplify.store("max_votes_count"),
      price: amplify.store("max_price")
    },
    min: {
      updatedAt: amplify.store("min_updatedAt"),
      distance: amplify.store("min_distance"),
      votes_count: amplify.store("min_votes_count"),
      price: amplify.store("min_price")
    }
  };
  return out;
};
Template.wrapper.rendered = function(){
  return Session.setDefault("rendered_wrapper", true);
};
Template.wrapper.events({
  "click a[data-toggle-mode='sign-in']": function(event, tmpl){
    var speed, selector, rival, target, sign;
    speed = 300;
    selector = $(event.currentTarget);
    rival = $(".toggler-group.left");
    target = $(tmpl.find(".terrace"));
    sign = $('#sign-in');
    selector.toggleClass("active");
    if (selector.is(".active")) {
      rival.animate({
        opacity: 0
      }, "fast");
      sign.show();
      return target.slipShow({
        speed: speed,
        haste: 1
      });
    } else {
      target.slipHide({
        speed: speed,
        haste: 1
      }, function(){
        return sign.hide();
      });
      rival.show();
      return rival.animate({
        opacity: 1
      }, "fast");
    }
  },
  "click a[data-toggle-mode='help']": function(event, tmpl){
    return Meteor.Help.set();
  },
  "click .help-mode [data-help-block='true']": function(event, tmpl){
    var $target, selector, oldB, newB;
    event.stopPropagation();
    $target = $(event.currentTarget);
    selector = $target.attr("data-help-selector");
    oldB = tmpl.findAll("[help-active='true']");
    newB = tmpl.findAll("[data-help-selector='" + selector + "']");
    console.log(oldB, newB);
    $(oldB).attr("help-active", "false");
    $(newB).attr("help-active", "true");
    tmpl.find(help + " p").textContent = helpBlocks[selector].summary;
    return false;
  },
  "mouseenter .help-mode [data-help-block='true']": function(event, tmpl){
    var selector, help, text;
    selector = event.currentTarget.getAttribute("data-help-selector");
    help = tmpl.find(help + "");
    return text = function(cb){
      help.querySelector("h4").innerHTML = helpBlocks[selector] && helpBlocks[selector].title;
      help.querySelector("p").innerHTML = helpBlocks[selector] && helpBlocks[selector].summary;
      if (cb && typeof cb === "function") {
        return cb();
      }
    };
  },
  "mouseleave .help-mode [data-help-block='true']": function(event, tmpl){
    var help;
    help = tmpl.find(help + "");
    return $(help).fadeOut('fast');
  },
  "click .shift": function(event, tmpl){
    var dir, area, page, current, store_area, store_sub_area, sub_area;
    if (checkHelpMode()) {
      return;
    }
    if (event.currentTarget.hasAttribute("disabled")) {
      return;
    }
    dir = event.currentTarget.getAttribute("data-shift-direction");
    area = event.currentTarget.getAttribute("data-shift-area");
    page = Meteor.Router.page();
    current = page.split("_")[0];
    store_area = Store.get("page_" + area) || area;
    store_sub_area = Store.get("page_" + store_area);
    sub_area = store_sub_area || store_area;
    Session.set("shift_direction", dir);
    Session.set("shift_area", area);
    Session.set("shift_sub_area", sub_area);
    return Session.set("shift_current", current);
  }
});
slipElements = function(opt){
  if ($select.hasClass("active")) {
    $mode.show();
    $rival.fadeOut('fast');
    $target.slipShow({
      speed: $speed,
      haste: 1
    });
    return $target.slipHide([
      {
        speed: $speed,
        haste: 1
      }, function(){
        $mode.hide();
        return $rival.fadeIn('fast');
      }
    ]);
  }
};
Template.ceiling.events({
  "click .navigation a": function(event, tmpl){
    var target, active, selectEl, data, hide, res$, i$, ref$, len$, h, show, s, speed, type, text, button;
    target = event.currentTarget;
    active = target.getAttribute("class");
    if (active === "active") {
      return;
    }
    selectEl = $(target);
    selectEl.addClass("active");
    selectEl.siblings().removeClass("active");
    data = selectEl.data()["accountData"];
    res$ = [];
    for (i$ = 0, len$ = (ref$ = data.hide).length; i$ < len$; ++i$) {
      h = ref$[i$];
      res$.push(tmpl.find("[data-account='" + h + "']"));
    }
    hide = res$;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = data.show).length; i$ < len$; ++i$) {
      s = ref$[i$];
      res$.push(tmpl.find("[data-account='" + s + "']"));
    }
    show = res$;
    speed = 150;
    $(hide).slipHide([
      {
        speed: speed,
        haste: 1
      }, function(){
        return $(show).slipShow({
          speed: speed,
          haste: 1
        });
      }
    ]);
    type = data.type;
    text = target.textContent;
    button = tmpl.find("button[type='submit']");
    button.setAttribute("data-account-submit-type", data.type);
    return button.textContent = data.text;
  },
  "click button[type='submit']": function(event, tmpl){
    var username, password, email, password2, forgotEmail, type, handleResponse, errors;
    event.preventDefault();
    username = tmpl.find('input#username').value;
    password = tmpl.find('input#password').value;
    email = tmpl.find('input#email').value;
    password2 = tmpl.find('input#password2').value;
    forgotEmail = tmpl.find('input#forgot-email').value;
    type = event.currentTarget.getAttribute("data-account-submit-type");
    handleResponse = function(err, res){
      if (err) {
        return $(tmpl.find(".alert")).text(err.reason).addClass("in");
      }
    };
    if (type === "sign" || type === "create") {
      errors = [];
      if (!username) {
        errors.push("username");
      }
      if (!password) {
        errors.push("password");
      }
      if (errors.length) {
        handleResponse({
          reason: "Must enter a " + errors.join(" and ")
        });
        return;
      }
      switch (type) {
      case "create":
        errors = [];
        if (username.length < 5) {
          errors.push("username");
        }
        if (password.length < 5) {
          errors.push("password");
        }
        if (errors.length) {
          handleResponse({
            reason: errors.join(" and ") + " must be at least five characters"
          });
          return;
        }
        if (password !== password2) {
          handleResponse({
            reason: "Passwords do not match"
          });
          return;
        }
        if (email && !validateEmail(email)) {
          handleResponse({
            reason: "Invalid email"
          });
          return;
        }
        return Accounts.createUser([
          {
            username: username,
            email: email,
            password: password
          }, function(err){
            return handleResponse(err, "Account made");
          }
        ]);
      case "sign":
        return Meteor.loginWithPassword(username, password, function(err){
          return handleResponse(err, "You've logged in");
        });
      }
    } else if (type === "forgot") {
      if (!forgotEmail) {
        handleResponse({
          reason: "Must enter an email address"
        });
        return;
      }
      if (forgotEmail && !validateEmail(forgotEmail)) {
        handleResponse({
          reason: "Invalid email"
        });
        return;
      }
      handleResponse({
        reason: "A message has been sent"
      });
      console.log(forgotEmail);
    }
  },
  "click .logout": function(event, tmpl){
    return Meteor.logout(function(){
      return Store.clear();
    });
  }
});
Template.ceiling.rendered = function(){
  return $(this.findAll("[data-toggle='tooltip']")).tooltip();
};
Template.content.rendered = function(){
  var this$ = this;
  if (Meteor.Router.page() === "home") {
    return;
  }
  if (!this.activateLinks) {
    this.activateLinks = function(){
      return Deps.autorun(function(){
        var href, page, page_split, page_area, page_links, page_sublinks, show_sublinks, ref$, hrefs, format_hrefs;
        href = function(link){
          if (link) {
            return '[href="/' + link.join('/') + '"]';
          }
        };
        page = Meteor.Router.page();
        page_split = page.split("_");
        page_area = page_split.splice(0, 1);
        page_links = page_split.splice(0, 2);
        page_sublinks = page_split;
        show_sublinks = (ref$ = Store.get("show_" + page)) != null ? ref$.split("_") : void 8;
        hrefs = [href(page_links), href(page_sublinks), href(show_sublinks)];
        format_hrefs = _.compact(hrefs).toString();
        $(this$.findAll("ul.links a, ul.sublinks a")).removeClass("active").addClass("inactive").filter(format_hrefs).removeClass("inactive").addClass("active");
        if (page_area !== "account") {
          if (!$(this$.find("[data-validate]")).is(":focus")) {
            if (!this$.page_sublinks === page_sublinks.toString()) {
              this$.page_sublinks = page_sublinks.toString();
              return $(this$.findAll("[data-validate]")).jqBootstrapValidation();
            }
          }
        }
      });
    };
  }
  return this.activateLinks();
};
Template.content.events({
  'click .links a': function(event, tmpl){
    var href, area;
    href = event.currentTarget.getAttribute("href");
    area = href.slice(1).split("/");
    return Store.set("page_" + area[0], area.join("_"));
  },
  'click .sublinks a': function(event, tmpl){
    var tar, type, href, area;
    tar = $(event.currentTarget);
    type = tar.attr("data-type");
    if (type === "show") {
      event.preventDefault();
    }
    href = tar.attr("href");
    area = href.slice(1).split("/");
    return Store.set(type + "_" + area[0] + "_" + area[1], area.join("_"));
  },
  'click .sublinks.account_offer a': function(event, tmpl){
    return Session.set("currentOffer", as());
  },
  "click .sublinks.account_profile a.save": function(event, tmpl){
    var sub_area, form, newEmail, newUsername, adminCode;
    sub_area = Store.get("page_account_profile");
    if (!sub_area) {
      Meteor.Alert.set({
        text: "An error occurred..."
      });
      console.log("sub_area not defined...which area are we in?");
      return;
    }
    form = $(tmpl.find("form"));
    switch (sub_area) {
    case "account_profile_edit":
      newEmail = form.find('#email').val();
      newUsername = form.find('#username').val();
      if (newEmail) {
        if (!validateEmail(newEmail)) {
          Meteor.Alert.set({
            text: "Invalid email"
          });
          return;
        }
      }
      return Meteor.call("updateUser", newEmail, newUsername, function(err){
        if (err) {
          return Meteor.Alert.set({
            text: err.reason
          });
        }
      });
    case "account_profile_colors":
      return Meteor.Alert.set({
        text: "Profile successfully saved"
      });
    case "account_profile_settings":
      adminCode = form.find('#admin');
      if (adminCode.is(":disabled") === false) {
        return Meteor.call("activateAdmin", adminCode.val(), function(err){
          if (err) {
            return Meteor.Alert.set({
              text: err.reason
            });
          }
        });
      } else {
        return Meteor.Alert.set({
          text: "Profile saved successfully"
        });
      }
    }
  },
  "click .sublinks.account_offer a.save": function(event, tmpl){
    var x$;
    x$ = Offer.storeGet();
    x$.save();
    return x$;
  },
  'click .accord header': function(event, tmpl){
    if (!$(event.target).hasClass("active")) {
      $(event.currentTarget).siblings().slideDown();
    } else {
      $(event.currentTarget).siblings().slideUp();
    }
    return $(event.target).toggleClass("active");
  },
  'mouseenter [data-gray]': function(e, t){
    var tar, ref$;
    tar = $(e.currentTarget);
    if ((ref$ = t.find("[data-gray='true']")) != null) {
      ref$.setAttribute("data-gray", false);
    }
    return tar.attr("data-gray", true);
  },
  'click [data-gray]': function(e, t){
    return Store.set("gray", e.currentTarget.getAttribute("class"));
  }
});
colorFill = function(el, selector, value){
  return el + " { " + selector + " : " + value + " }";
};
Conf = (function(){
  Conf.displayName = 'Conf';
  var prototype = Conf.prototype, constructor = Conf;
  prototype.constructor = function(current){
    var ref$;
    this.sort = {};
    if ((ref$ = current.sort.verbose) != null && ref$.length) {
      this.sort[current.sort.specifier] = {};
      this.sort[current.sort.specifier][current.sort.selector] = current.sort.order;
    } else {
      this.sort_empty = true;
    }
    this.query = {};
    if ((ref$ = current.tagset) != null && ref$.length) {
      this.query.tagset = current.tagset.toString();
      if ((ref$ = current.tag) != null && ref$.length) {
        return this.query.tags = {
          $in: current.tag
        };
      }
    }
  };
  function Conf(){}
  return Conf;
}());
Template.home.helpers({
  getOffers: function(){
    var current, ref$, myLoc, conf, ranges, notes;
    current = (ref$ = statCurrent()) != null ? ref$.query : void 8;
    myLoc = Store.get("user_loc");
    conf = new Conf(current);
    ranges = {
      updatedAt: [],
      distance: [],
      votes_count: [],
      price: []
    };
    notes = {
      count: 0,
      votes: 0
    };
    return result;
  },
  styleDate: function(date){
    return moment(date).fromNow();
  }
});
Template.intro.events({
  'click #getLocation': function(event, tmpl){
    var noLocation, foundLocation;
    Meteor.Alert.set({
      text: "One moment while we charge the lasers...",
      wait: true
    });
    noLocation = function(){
      return Meteor.Alert.set({
        text: "Uh oh... something went wrong"
      });
    };
    foundLocation = function(location){
      Meteor.Alert.set({
        text: "Booya! Lasers charged!"
      });
      return Store.set("user_loc", {
        lat: location.coords.latitude,
        long: location.coords.longitude
      });
    };
    return navigator.geolocation.getCurrentPosition(foundLocation, noLocation);
  },
  'click .geolocate': function(event, tmpl){
    var location, geo;
    location = tmpl.find("input").value;
    if (!location) {
      Meteor.Alert.set({
        text: "No location entered"
      });
      return;
    }
    Meteor.Alert.set({
      text: "One moment...",
      wait: true
    });
    geo = new google.maps.Geocoder();
    return geo.geocode({
      address: location
    }, function(results, status){
      var loc, userLoc, key;
      if (status !== "OK") {
        return Meteor.Alert.set({
          text: "We couldn't seem to find your location. Did you enter your address correctly?"
        });
      } else {
        Meteor.Alert.set({
          text: "Found ya!"
        });
        loc = results[0].geometry.location;
        userLoc = [];
        for (key in loc) {
          if (typeof loc[key] !== 'number') {
            break;
          }
          userLoc.push(loc[key]);
        }
        console.log("USERLOC", userLoc);
        return Store.set("user_loc", {
          lat: userLoc[0],
          long: userLoc[1]
        });
      }
    });
  }
});
Template.intro.rendered = function(){
  var window_height, intro, intro_height;
  window_height = $(".current").height() / 2;
  intro = $(this.find('#intro'));
  intro_height = intro.outerHeight() * 0.75;
  return intro.css({
    'margin-top': window_height - intro_height
  });
};