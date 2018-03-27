u = up.util

class up.ExtractPlan

  constructor: (selector, options) ->
    @reveal = options.reveal
    @origin = options.origin
    @originalSelector = up.dom.resolveSelector(selector, @origin)
    @transition = options.transition
    @response = options.response
    @oldLayer = options.layer
    @parseSteps()

  findOld: =>
    u.each @steps, (step) =>
      step.$old = up.dom.first(step.selector, layer: @oldLayer)

  findNew: =>
    u.each @steps, (step) =>
      # The response has no layers. It's always just the page.
      step.$new = @response.first(step.selector)

  oldExists: =>
    @findOld()
    u.all @steps, (step) -> step.$old

  newExists: =>
    @findNew()
    u.all @steps, (step) -> step.$new

  matchExists: =>
    @oldExists() && @newExists()

  addSteps: (steps) =>
    @steps = @steps.concat(steps)
    
  compressedSteps: =>
    if @steps.length > 1

#      candidates = u.copy(@steps)
#      compressed = []
#
#      while candidates.length
#        candidate = candidates.shift()
#        safe = u.all candidates, (other) ->
#          !candidate.pseudoClass || candidate.$old.closest(other.$old).length == 0
#        if safe
#          compressed.push(candidate)

      containers = u.map @steps, (step) ->
        unless step.pseudoClass
          step.$old.get(0)
      containers = u.compact(containers)
      $containers = $(containers)
      $containers.addClass('up-step')
      compressed = u.select @steps, (step) ->
        $element = step.$old
        $parent = $element.parents('.up-step')
      $containers.removeClass('up-step')

      if @steps[0].reveal
        compressed[0].reveal = @steps[0].selector
      console.info("Compressed steps are %o", compressed)
      compressed
    else
      @steps

  compressedSelector: =>
    u.map(@compressedSteps(), 'expression').join(', ')

  ###*
  Example:

      parseSelector('foo, bar:before', transition: 'cross-fade')

      [
        { selector: 'foo', pseudoClass: undefined, transition: 'cross-fade' },
        { selector: 'bar', pseudoClass: 'before', transition: 'cross-fade' }
      ]
  ###
  parseSteps: =>
    comma = /\ *,\ */

    @steps = []

    disjunction = @originalSelector.split(comma)

    u.each disjunction, (expression, i) =>
      expressionParts = expression.match(/^(.+?)(?:\:(before|after))?$/)
      expressionParts or up.fail('Could not parse selector literal "%s"', expression)
      selector = expressionParts[1]
      if selector == 'html'
        # If someone really asked us to replace the <html> root, the best
        # we can do is replace the <body>.
        selector = 'body'

      pseudoClass = expressionParts[2]

      # When extracting multiple selectors, we only want to reveal the first element.
      # So we set the { reveal } option to false for the next iteration.
      doReveal = if i == 0 then @reveal else false

      @steps.push
        expression: expression
        selector: selector
        pseudoClass: pseudoClass
        transition: @transition
        origin: @origin
        reveal: doReveal
