#= require ./record

u = up.util

class up.Response extends up.Record

  fields: ->
    ['method', 'url', 'body', 'status', 'textStatus', 'request', 'xhr']

  constructor: (options) ->
    super(options)

  isSuccess: =>
    @status && (@status[0] == '2')

  isError: =>
    !@isSuccess()

  isMaterialError: =>
    @isError() && u.isBlank(@body)
