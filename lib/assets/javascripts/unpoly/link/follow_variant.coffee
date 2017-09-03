u = up.util

class up.link.FollowVariant

  constructor: (@selector, @handler) ->

  fullHandler: =>
    (event, $link) =>
      if @shouldProcessLinkEvent(event, $link)
        if $link.is('[up-instant]')
          # If the link was already processed on mousedown, we still need
          # to prevent this later click event's chain.
          up.bus.haltEvent(event)
        else
          up.bus.consumeAction(event)
          @followLink($link)
      else
        # For tests
        up.link.allowDefault(event)

  fullSelector: =>
    "a#{@selector}, [up-href]#{@selector}"

  registerEvents: ->
    up.on 'click', @fullSelector(), @fullHandler()

  childClicked: (event, $link) ->
    $target = $(event.target)
    $targetLink = $target.closest('a, [up-href]')
    $targetLink.length && $link.find($targetLink).length

  shouldProcessLinkEvent: (event, $link) =>
    u.isUnmodifiedMouseEvent(event) && !@childClicked(event, $link)

  followLink: ($link, options) =>
    up.feedback.start $link, =>
      @handler($link, options)

  matchesLink: ($link) =>
    $link.is(@fullSelector())
