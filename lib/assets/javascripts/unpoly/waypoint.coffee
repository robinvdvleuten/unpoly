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
  restore = (waypointUrl, options) ->
    options = u.options(options, discard: true)

    if waypoint = lookupUrl(waypointUrl)
      event =
        message: ["Restoring waypoint %s", waypoint.name]
        waypoint:waypoint

      up.bus.whenEmitted('up:waypoint:restore', event).then ->
        discard(waypoint) if options.discard
        visit(waypoints.restoreURL(), restoreScroll: waypoint.scrollTops)
    else
      Promise.reject(new Error("No saved waypoint named \"#{waypointUrl}\""))

  lookupUrl = (waypointUrl) ->
    waypointUrl = new up.URLEditor(waypointUrl)
    waypointName = waypointUrl.pathname

    if waypoint = waypoints.get(waypointName)
      waypoint.inContext(params: waypointUrl.params)

  manipulateFollowFromRestoredWaypoint = (event, restoreOptions) ->
    if waypointUrl = u.option(event.followOptions.restoreWaypoint, event.$link.attr('up-restore-waypoint'))
      if props = restoreWaypointProps(waypointUrl, restoreOptions)
        u.assign(event.followOptions, props)

#  ###*
#  DOCUMENT ME
#
#  @function up.history.saveWaypoint
#  @experimental
#  ###
#  saveWaypoint = (waypointUrl, options) ->
#    waypointUrl = new up.URLEditor(waypointUrl)
#
#
#
#
#    layer = options.layer || up.dom.topLayer()
#
#    $forms = up.all('form:not([up-save-form="false"])', { layer })
#    formParams = u.flatMap $forms, (form) ->
#      u.paramsFromForm(form, representation: 'array')
#
#    name = waypointUrl.pathname
#
#    waypointState = new up.WaypointState
#      name: name
#      url: currentUrl(),
#      params: u.absorbParams(formParams, waypointUrl.params)
#      data: options.data
#      scrollTops: scrollTops
#
#    if up.bus.nobodyPrevents('up:waypoint:save', { waypoint: waypoint })
#      savedWaypoints.put(name, waypointState)
#
#  saveWaypointBeforeFollow = (event) ->
#    $link = event.$link
#    if waypointUrl = u.option(event.followOptions.saveWaypoint, $link.attr('up-save-waypoint'))
#      layer = up.dom.layerOf($link)
#      saveWaypoint(waypointUrl, {
#        layer: layer,
#        data: up.syntax.data($link, attribute: 'up-waypoint-data')
#      })

  findName = (obj) ->
    if u.isString(obj)
      obj
    else if obj instanceof up.Waypoint
      obj.name
    else if u.isElement(obj) || u.isJQuery(obj)
      $(obj).attr('up-waypoint')
    else
      up.fail('No name given for waypoint %o', obj)

  save = (name, options) ->
    options = u.options(options)

    origin = options.origin
    $origin = $(origin)

    # The user can pass a { root } if she only wants to serialize forms
    # within a root element.
    root = options.root || $origin.attr('up-root')
    if u.isString(root) && origin
      root = up.dom.resolveSelector(root, { origin })

    # If an origin link is given but no root, we only save forms from the link's layer.
    layer = u.option(options.layer, !root && origin && up.dom.layerOf($origin))

    $forms = up.all('form:not([up-save-form="false"])', { root, layer })

    formParams = new up.Params([])
    u.each $forms, (form) ->
      formParams.absorb up.params.fromForm(form, nature: 'array')

    extraParams = u.option(options.params, up.syntax.data(origin, 'up-params'))
    params = formParams.absorb(extraParams)

    data = up.syntax.data(origin)

    waypoint = new up.Waypoint
      name: name
      url: up.history.url()
      scrollTops: up.layout.scrollTops()
      data: data
      params: params.asObject()

    if up.bus.nobodyPrevents('up:waypoint:save', { waypoint: waypoint })
      waypoints.set(name, waypoint)

#  up.compiler '[up-waypoint]', ($waypoint) ->
#    # Save the waypoint as soon as it appears in the DOM.
#    # This will discard any existing waypoint with the same name.
#    discard($waypoint)
#
#    # Also save the waypoint when we lose it from the DOM
#    -> save($waypoint)

  ###*
  DOCUMENT ME

  @function up.waypoint.discard
  @param waypoint {string|Element|jQuery|up.Waypoint} waypoint
  @experimental
  ###
  discard = (waypoint) ->
    name = findName(waypoint)
    if waypoint = waypoints.get(name)
      if up.bus.nobodyPrevents('up:waypoint:discard', { waypoint: waypoint})
        waypoints.remove(name)

#  up.bus.on 'up:link:follow', (event) ->
#    considerDiscardWaypointBeforeFollow(event)
#    considerSaveWaypointBeforeFollow(event)
#    considerRestoreWaypointBeforeFollow(event, discard: true)
#
#  up.bus.on 'up:link:preload', (event) ->
#    considerRestoreWaypointBeforeFollow(event, discard: false)

  up.on 'up:framework:reset', reset

  config: config
  save: save
  restore: restore
  discard: discard

)(jQuery)
