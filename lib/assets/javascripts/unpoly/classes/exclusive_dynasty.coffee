u = up.util

class up.ExclusiveDynasty

  constructor: (@name) ->
    @selector = ".#{@name}"

  ###*
  @method claim
  @param {Function(jQuery): FinishablePromise}
  @return {Promise} A promise that will be fulfilled when the animation ends
  ###
  claim: ($element, animator) =>
    finish($element).then =>
      finishablePromise = animator($element)
      @markElement($element, finishablePromise)
      finishablePromise.then => @unmarkElement($element)
      finishablePromise

  finishAll: ($elements) =>
    $elements ||= $(@selector)
    allFinished = u.map($elements, @finishElement)
    return Promise.all(allFinished)

  finishDynasty: ($element) =>
    @finishAll u.selectInDynasty($element, @selector)

  finishElement: (element) =>
    $element = $(element)
    finishablePromise = $element.data(@name)
    @unmarkElement()
    if finishablePromise
      # Finisher function is expected to return a promise
      return finishablePromise.finish()
    else
      # There are some cases related to element ghosting where an element
      # has the class, but not the data value. In that case simply return
      # a resolved promise.
      return Promise.resolve()

  markElement: ($element, finishablePromise) =>
    $element.addClass(@name)
    $element.data(@name, finishablePromise)

  unmarkElement: ($element) =>
    $element.removeClass(@name)
    $element.removeData(@name)
