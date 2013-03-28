var stripeClientId, stripeClientSecret, stripeUrl, stripe, myStripe, Future, toString$ = {}.toString;
stripeClientId = "ca_131FztgqheXRmq6vudxED4qdTPtZTjNt";
stripeClientSecret = "sk_test_z8wvHnKAjHoxRzyKnK2uvoxE";
stripeUrl = "https://connect.stripe.com/oauth/token";
stripe = StripeAPI("sk_test_z8wvHnKAjHoxRzyKnK2uvoxE");
myStripe = function(){
  return StripeAPI("sk_test_z8wvHnKAjHoxRzyKnK2uvoxE");
};
Future = require("fibers/future");
Meteor.methods({
  stripe_charges_create: function(offer, cust_or_token, accessToken){
    var f, out, stripe;
    f = new Future();
    switch (toString$.call(cust_or_token).slice(8, -1)) {
    case "String":
      out = {
        customer: cust_or_token
      };
      break;
    default:
      out = {
        card: cust_or_token
      };
    }
    out.amount = function(){
      return parseInt(offer.price) * 100;
    }();
    out.application_fee = function(){
      return out.amount * 5;
    }();
    out.currency = "USD";
    stripe = StripeAPI(accessToken);
    stripe.charges.create(out, function(err, res){
      if (err) {
        console.log("ERR in CHARGE CREATE", err);
        return f['return']([res, 0]);
      } else {
        console.log("RES in CHARGE CREATE", res);
        return f['return']([0, res]);
      }
    });
    return f.wait();
  },
  stripe_token_create: function(custId, accessToken){
    var f, stripe;
    f = new Future();
    stripe = StripeAPI(accessToken);
    stripe.token.create({
      customer: custId
    }, function(err, res){
      if (err) {
        console.log("ERR in TOKEN CREATE", err);
        return f['return']([res, 0]);
      } else {
        console.log("RES in TOKEN CREATE", res);
        return f['return']([0, res]);
      }
    });
    return f.wait();
  },
  stripe_customers_create: function(card){
    var f, out;
    f = new Future();
    out = {
      card: card,
      description: function(){
        return My.user().username;
      }()
    };
    myStripe().customers.create(out, function(err, res){
      if (err) {
        console.log("ERR in CUSTOMER CREATE", err);
        return f['return']([res, 0]);
      } else {
        console.log("RES in CUSTOMER CREATE", res);
        return f['return']([0, res]);
      }
    });
    return f.wait();
  },
  stripe_customers_save: function(customer){
    var f, myCust;
    f = new Future();
    myCust = typeof My.customer === 'function' ? My.customer() : void 8;
    if (myCust) {
      console.log("CUSTOMER ALREADY... UPDATING...");
      myCust.update(customer, function(err, res){
        if (err) {
          console.log("ERR in CUSTOMER UPDATE", err);
          return f['return']([res, 0]);
        } else {
          console.log("RES in CUSTOMER UPDATE", res);
          return f['return']([0, res]);
        }
      });
    } else {
      console.log("NO CUSTOMER... SAVING...");
      Customer['new'](customer).save(function(err, res){
        if (err) {
          console.log("ERR in CUSTOMER SAVE", err);
          return f['return']([res, 0]);
        } else {
          console.log("RES in CUSTOMER SAVE", res);
          return f['return']([0, res]);
        }
      });
    }
    return f.wait();
  },
  stripe_get_access_token: function(owner){
    var user, token;
    this.unblock();
    user = Meteor.users.findOne({
      _id: owner
    });
    token = user.stripe.access_token;
    console.log(token);
    Meteor.call("derp");
    return token;
  },
  derp: function(){
    return console.log("DEEEERP");
  }
});