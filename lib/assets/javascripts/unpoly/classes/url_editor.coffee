u = up.util

class up.URLEditor

  constructor: (url) ->
    [@pathname, @search] = url.split('?')
    @params = u.paramsAsArray(@search)

  appendParams: (newParams) =>
    newParams = u.paramsAsArray(newParams)
    @params = @params.concat(newParams)

  toURLString: =>
    string = @pathname
    if u.isPresent(@params)
      string += "?"
      string += u.paramsAsQuery(@params)
    string
