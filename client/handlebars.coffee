
Handlebars.registerHelper "styleDate", (date) ->
  if date
    moment(date).fromNow()
  else
    moment().fromNow()

Handlebars.registerHelper "getStore", (a) ->
  if Meteor.BrowserStore.get a
    return Store.get a

Handlebars.registerHelper "storeEquals", (a, b) ->
  console.log(a)
  return true if Meteor.BrowserStore.get(a) is b

# {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
Handlebars.registerHelper "key_value", (obj, fn) ->
  buffer = ""
  key = undefined
  for key of obj
    if obj.hasOwnProperty(key)
      buffer += fn(
        key: key
        value: obj[key]
      )
  buffer


# {{#each_with_key container key="myKey"}}...{{/each_with_key}}
Handlebars.registerHelper "each_with_key", (obj, fn) ->
  context = undefined
  buffer = ""
  key = undefined
  keyName = fn.hash.key
  for key of obj
    if obj.hasOwnProperty(key)
      context = obj[key]
      context[keyName] = key  if keyName
      buffer += fn(context)
  buffer
Handlebars.registerHelper "equal", (a,b) ->
  return true if a is b
  return false

Handlebars.registerHelper "dropDecimal", (a) ->
  a?.toString().split(".")[0]
