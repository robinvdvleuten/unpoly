promiseState = (promise, callback) ->

  uniqueString = 'unique-value-z98214983214210941421hidwq21321'
  klass = window['Symbol'] || window['String']
  uniqueValue = klass(uniqueString)

  notifyPendingOrResolved = (value) ->
    if value == uniqueValue
      callback('pending')
    else
      callback('resolved')

  notifyRejected = (value) ->
    callback('rejected')

  Promise.race(promise, Promise.resolve(uniqueValue)).then(notifyPendingOrResolved, notifyRejected)
