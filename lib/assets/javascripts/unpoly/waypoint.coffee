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

    When additional waypoints are saved, the oldest waypoint will be [forgotten](/up.waypoint.forget).
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
    options = u.options(options, forget: true)

    if waypoint = lookupUrl(waypointUrl)
      event =
        message: ["Restoring waypoint %s", waypoint.name]
        waypoint:waypoint

      up.bus.whenEmitted('up:waypoint:restore', event).then ->
        forget(waypoint) if options.forget
        visit(waypoints.restoreURL(), restoreScroll: waypoint.scrollTops)
    else
      Promise.reject(new Error("No saved waypoint named \"#{waypointUrl}\""))

  lookupUrl = (waypointUrl) ->
    waypointUrl = new up.URLEditor(waypointUrl)
    waypointName = waypointUrl.pathname

    if waypoint = waypoints.get(waypointName)
      waypoint.inContext(params: waypointUrl.params)

#  manipulateFollowFromRestoredWaypoint = (event, restoreOptions) ->
#    if waypointUrl = u.option(event.followOptions.restoreWaypoint, event.$link.attr('up-restore-waypoint'))
#      if props = restoreWaypointProps(waypointUrl, restoreOptions)
#        u.assign(event.followOptions, props)
#
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

  save = ($waypoint, options) ->
    # Other than with most Unpoly function, we cannot allow the developer to override
    # all attributes through `options`. We need to be able to update the waypoint asynchronously
    # from event handlers later, and at that point all options must either be serialized to the
    # element or they will be lost.
    options = u.options(options)
    name = findName($waypoint)
    $scope = $(u.option($waypoint.attr('up-scope'), $waypoint))
    $forms = u.selectInSubtree($scope, 'form:not([up-save-form="false"])')
    formParams = u.flatMap $forms, (form) -> u.paramsFromForm(form, representation: 'array')
    extraParams = u.option(options.params, [])
    params = formParams.concat(extraParams)
    elementData = up.syntax.data($waypoint)
    extraData = u.options(options.data, {})
    data = u.merge(elementData, extraData)

    waypoint = new up.Waypoint
      name: name
      url: up.history.url()
      scrollTops: up.layout.scrollTops()
      data: data
      params: params
      # options: options

    if up.bus.nobodyPrevents('up:waypoint:save', { waypoint: waypoint })
      waypoints.set(name, waypoint)

  up.compiler '[up-waypoint]', ($waypoint) ->
    # Save the waypoint as soon as it appears in the DOM.
    # This will forget any existing waypoint with the same name.
    forget($waypoint)

    # Also save the waypoint when we lose it from the DOM
    -> save($waypoint)

  ###*
  DOCUMENT ME

  @function up.waypoint.forget
  @param waypoint {string|Element|jQuery|up.Waypoint} waypoint
  @experimental
  ###
  forget = (waypoint) ->
    name = findName(waypoint)
    waypoints.remove(name)

  up.bus.on 'up:link:follow', (event) ->
    saveWaypointBeforeFollow(event)
    console.info("Got event %o", event)
    manipulateFollowFromRestoredWaypoint(event, forget: true)

  up.bus.on 'up:link:preload', (event) ->
    manipulateFollowFromRestoredWaypoint(event, forget: false)

  up.on 'up:framework:reset', reset

  config: config
  save: save
  restore: restore
  forget: forget

)(jQuery)
