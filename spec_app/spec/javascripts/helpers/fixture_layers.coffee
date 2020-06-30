u = up.util

window.makeLayers = (stackPlans) ->

  if u.isNumber(stackPlans)
    count = stackPlans
    stackPlans = u.map [1..count], -> {}

  stackPlans.forEach (stackPlan, i) ->
    stackPlan.target ||= '.element'

    if !stackPlan.content && !stackPlan.html && !stackPlan.url
      stackPlan.content = "text #{i}"

    if i == 0
      stackPlan.layer = 'root'
    else
      stackPlan.layer = 'new'
      stackPlan.openAnimation = false
      stackPlan.closeAnimation = false

  # Make sure the root layer has an element to change
  fixture(stackPlans[0].target)

  promise = Promise.resolve()
  stackPlans.forEach (stackPlan) ->
    promise = promise.then -> up.change(stackPlan)

  return promise