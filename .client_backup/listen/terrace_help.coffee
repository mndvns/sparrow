
class Help extends Listener
  init: =>
    @name = "help"
    @rallyPoint = "terrace_help"

  set: (args)=>
    if @_active > 0 then return

    @_selector = "data-help-block"
    @_blockClass = "help-active"
    @_wrapperClass = "help-mode clr-bg light"
    @paneContent = """
        <h1>#{@_title}</h1>
        <p>#{@_summary}</p>
        """
    @toggle =
      el: $("[data-toggle-mode='help']")

    @_title = helpBlocks[args?.title] or helpBlocks.default_text.title
    @_summary = helpBlocks[args?.summary] or helpBlocks.default_text.summary
    @prep()


  prep: =>
    @blocks = $("[#{@_selector}]")
    @wrapper = $(".wrapper")

    @blocks.attr @_selector, true
    @wrapper.addClass @_wrapperClass

    @trigger()

  ready : =>
  aim   : =>
  fire  : =>

  cleanUp: =>
    @blocks.attr @_selector, false
    @wrapper.removeClass @_wrapperClass
    @finish()
