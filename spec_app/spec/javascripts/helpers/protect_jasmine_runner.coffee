beforeEach ->
  up.dom.config.fallbacks = ['.fallback-container']
  $element = $('<div class="fallback-container"></div>')
  $element.appendTo(document.body)

afterEach ->
  up.destroy('.fallback-container')
