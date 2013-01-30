


amplify.get = function (a) {
  var p = a.split(".")
  var s = amplify.store()
  var out

  if      (p.length === 1) { out = s[p[0]] }
  else if (p.length === 2) { out = s[p[0]] && s[p[0]][p[1]] }
  else if (p.length === 3) { out = s[p[0]] && s[p[0]][p[1]] && s[p[0]][p[1]][p[2]] }

  return out
}

amplify.set = function (a, b) {
  var p = a.split(".")
  var s = amplify.store()

  if (! s[p[0]]) {
    s[p[0]] = {}
  }

  if (p.length === 1) {
    s[p[0]] = b
  }
  else if (p.length === 2) {
    s[p[0]][p[1]] = b
  }
  else if (p.length === 3) {
    s[p[0]][p[1]][p[2]] = b
  }

  Session.set(p.join("_"), b)

  for (key in s) {
    amplify.store(key, s[key] )
  }
}

amplify.verify = function () {
  if ( amplify.get("user.id") !== Meteor.userId() ) {
    amplify.clear()
    amplify.set("user.id", Meteor.userId())
    console.log("Amplify failed verification; reset user.id")
    return false
  } else {
    console.log("Amplify passed verification")
    return true
  }
}

amplify.clear = function () {
  for (key in as()) {
    as(key, null)
  }
  console.log("Cleared amplify store")
}
