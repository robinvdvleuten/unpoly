function promiseState(promise, callback) {
  var uniqueValue = window['Symbol'] ? Symbol('unique') : Math.random().toString(36)

  function notifyPendingOrResolved(value) {
    if (value === uniqueValue) {
      return callback('pending')
    } else {
      return callback('fulfilled')
    }
  }

  function notifyRejected(reason) {
    return callback('rejected')
  }

  var race = [promise, Promise.resolve(uniqueValue)]
  Promise.race(race).then(notifyPendingOrResolved, notifyRejected)
}
