amplify.get = (a) ->
  p = a.split(".")
  s = amplify.store()
  out = undefined
  if p.length is 1
    out = s[p[0]]
  else if p.length is 2
    out = s[p[0]] and s[p[0]][p[1]]
  else out = s[p[0]] and s[p[0]][p[1]] and s[p[0]][p[1]][p[2]]  if p.length is 3
  out

amplify.set = (a, b) ->
  p = a.split(".")
  s = amplify.store()
  s[p[0]] = {}  unless s[p[0]]
  if p.length is 1
    s[p[0]] = b
  else if p.length is 2
    s[p[0]][p[1]] = b
  else s[p[0]][p[1]][p[2]] = b  if p.length is 3
  Session.set p.join("_"), b
  for key of s
    amplify.store key, s[key]

amplify.verify = ->
  if amplify.get("user.id") isnt Meteor.userId()
    amplify.clear()
    amplify.set "user.id", Meteor.userId()
    console.log "Amplify failed verification; reset user.id"
    false
  else
    console.log "Amplify passed verification"
    true

amplify.clear = ->
  for key of as()
    as key, null
  console.log "Cleared amplify store"
