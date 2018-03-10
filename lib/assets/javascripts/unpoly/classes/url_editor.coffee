u = up.util

class up.URLEditor

  constructor: (url) ->
    [@pathname, @search] = url.split('?')
    @params = new up.Params(@search)

  appendParams: (newParams) =>
    @params.absorb(newParams)

  toURLString: =>
    @params.asURL(@pathname)
