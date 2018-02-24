u = up.util

class up.URLEditor

  constructor: (url) ->
    [@pathname, @search] = url.split('?')
    @params = u.requestDataAsArray(@search)

  appendParams: (newParams) =>
    newParams = u.requestDataAsArray(newParams)
    @params = @params.concat(newParams)

  toURLString: =>
    string = @pathname
    if u.isPresent(@params)
      string += "?"
      string += u.requestDataAsQuery(@params)
    string
