###*
Waypoints
=========

@class up.waypoint
###
up.waypoint = (($) ->

  u = up.util

  ###*
  Configures behavior for waypoints.

  @property up.waypoint.config
  @param {number} [config.cacheSize=10]
    The maximum number of saved waypoints.

    When additional waypoints are saved, the oldest waypoint will be [forgotten](/up.waypoint.discard).
  @stable
  ###
  config = u.config
    cacheSize: 10

  waypoints = new up.Cache
    size: -> config.cacheSize

  reset = ->
    config.reset()
    waypoints.clear()

  ###*
  DOCUMENT ME

  @function up.waypoint.restore
  @return Promise
  @experimental
  ###
  restore = (name, options) ->
    options = u.options(options, discard: true)

    if waypoint = waypoints.get(name)
      $origin = $(options.origin)

      # We let the user pass additional { params } and { data } options
      # for this particular waypoint restoration. Values will be merged
      # with the originally saved { params } and { data }.
      context =
        params: options.params || up.syntax.data($origin, 'up-params')
        data: options.data || up.syntax.data($origin)

      waypoint = waypoint.inContext(context)

      restoreEvent =
        message: ["Restoring waypoint %s", waypoint.name]
        waypoint: waypoint
        # Give custom restoration handlers a chance to do something
        # else when we're only preloading.
        preload: options.preload

      up.bus.whenEmitted('up:waypoint:restore', restoreEvent).then ->
        discard(waypoint) if options.discard
        visit(waypoints.restoreURL(), restoreScroll: waypoint.scrollTops).then ->
          up.bus.emit 'up:waypoint:restored',
            message: ["Restored waypoint %s", waypoint.name]
            waypoint: waypoint

    else
      Promise.reject(new Error("No saved waypoint named \"#{waypointUrl}\""))

  save = (name, options) ->
    options = u.options(options)

    $origin = $(options.origin)

    # The user can pass a { root } if she only wants to serialize forms
    # within a root element.
    root = options.root || $origin.attr('up-root')
    if u.isString(root)
      root = up.dom.resolveSelector(root, { origin: $origin })

    # If an origin link is given but no root, we only save forms from the link's layer.
    defaultLayer = up.dom.layerOf($origin) if !root && up.isPresent(origin)
    formLayer = u.option(options.layer, defaultLayer)
    # Gather params from all forms
    $forms = up.all('form:not([up-save-form="false"])', { root, formLayer })
    formParams = u.flatMap $forms, (form) -> up.params.fromForm(form, nature: 'array')
    # We want to represent params as a (nested) object for convenient programmatic access
    formParams = up.params.toObject(formParams)
    # Users can pass additional params
    extraParams = u.option(options.params, up.syntax.data($origin, 'up-params'))
    params = up.params.merge(formParams, extraParams)

    # User can also set a { data } hash for custom restore logic in JavaScript.
    # The { data } hash will not be sent to the server, but will be made available
    # to listeners of up:waypoint events.
    data = options.data || up.syntax.data(origin)

    waypoint = new up.Waypoint
      name: name
      url: up.history.url()
      scrollTops: up.layout.scrollTops()
      data: data
      params: params

    event =
      message: ['Saving waypoint %s', name]
      waypoint: waypoint

    if up.bus.nobodyPrevents('up:waypoint:save', event)
      waypoints.set(name, waypoint)

  ###*
  DOCUMENT ME

  @function up.waypoint.discard
  @param waypoint {string|Element|jQuery|up.Waypoint} waypoint
  @experimental
  ###
  discard = (name) ->
    if waypoint = waypoints.get(name)
      event =
        message: ['Discarding waypoint %s', name]
        waypoint: waypoint

      if up.bus.nobodyPrevents('up:waypoint:discard', event)
        waypoints.remove(name)

  considerSaveBeforeFollow = ($link) ->
    if name = $link.attr('up-save-waypoint')
      save(name, origin: $link)

  considerRestoreBeforeFollow = ($link, options) ->
    if name = $link.attr('up-restore-waypoint')
      restore(name, u.merge(options, origin: $link))

  considerDiscardBeforeFollow = ($link) ->
    if name = $link.attr('up-discard-waypoint')
      discard(name)

  up.on 'up:link:follow', (event) ->
    $link = event.$link
    considerDiscardBeforeFollow($link)
    considerSaveBeforeFollow($link)
    considerRestoreBeforeFollow($link, discard: true)

  up.on 'up:link:preload', (event) ->
    considerRestoreBeforeFollow(event.$link, discard: false, preload: true)

  up.on 'up:framework:reset', reset

  config: config
  save: save
  restore: restore
  discard: discard

)(jQuery)
