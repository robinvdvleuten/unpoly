beforeEach ->
  up.dom.config.fallbacks = ['.default-fallback']
  up.history.config.popTargets = ['.default-fallback']
  $element = $('<div class="default-fallback"></div>')
  $element.appendTo(document.body)

afterEach ->
  console.debug("--- destroying default fallback ---")
  up.destroy('.default-fallback', log: false)

