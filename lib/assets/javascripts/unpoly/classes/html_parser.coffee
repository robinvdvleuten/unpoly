u = up.util

class up.HtmlParser

  constructor: (@html) ->
    @findCustomElements()
    @wrapNoscriptInHtml()
    @parsedDoc = u.createElementFromHtml(@html)

  title: ->
    @parsedDoc.querySelector("head title")?.textContent

  first: (selector) ->
    # Although we cannot have a jQuery collection from an entire HTML document,
    # we can use jQuery's Sizzle engine to grep through a DOM tree.
    # jQuery.find is the Sizzle function (https://github.com/jquery/sizzle/wiki#public-api)
    # which gives us non-standard CSS selectors such as `:has`.
    # It returns an array of DOM elements, not a jQuery collection.
    if match = $.find(selector, @parsedDoc)[0]
      return $(match)

  prepareForInsertion: ($element) ->
    element = $element[0]
    @unwrapNoscriptInElement(element)
    element = @activateCustomElements(element)
    $(element)

  findCustomElements: ->
    return unless up.browser.canCustomElements()
    tags = []
    # Custom elements must contain a dash in their tag name.
    customElementPattern = /<(\w+-[\w\-]+)/g
    while match = customElementPattern.exec(@html)
      tags.push(match[1])
    @customElementsSelector = tags.join(',')

  wrapNoscriptInHtml: ->
    # We wrap <noscript> tags into a <div> for two reasons:
    #
    # (1) IE11 and Edge cannot find <noscript> tags with jQuery or querySelector() or
    #     getElementsByTagName() when the tag was created by DOMParser. This is a bug.
    #     https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12453464/
    #
    # (2) The children of a <nonscript> tag are expected to be a verbatim text node
    #     in a scripting-capable browser. However, due to rules in the DOMParser spec,
    #     the children are parsed into actual DOM nodes. This confuses libraries that
    #     work with <noscript> tags, such as lazysizes.
    #     http://w3c.github.io/DOM-Parsing/#dom-domparser-parsefromstring
    #
    # We will unwrap the wrapped <noscript> tags when a fragment is requested with
    # #first(), and only in the requested fragment.
    noscriptPattern = /<noscript[^>]*>((.|\s)*?)<\/noscript>/i
    @html = @html.replace noscriptPattern, (match, content) =>
      @didWrapNoscript = true
      '<div class="up-noscript" data-html="' + u.escapeHtml(content) + '"></div>'

  unwrapNoscriptInElement: (element) ->
    return unless @didWrapNoscript
    wrappedNoscripts = element.querySelectorAll('.up-noscript')
    for wrappedNoscript in wrappedNoscripts
      wrappedContent = wrappedNoscript.getAttribute('data-html')
      noscript = document.createElement('noscript')
      noscript.textContent = wrappedContent
      wrappedNoscript.parentNode.replaceChild(noscript, wrappedNoscript)

  activateCustomElements: (element) ->
    return element
    # importNode() creates a deep copy of the given element in the context of our document
    # and upgrades custom elements in the process. This is a very expensive operation
    # and we only do it when the element contains a custom element, or when  the element
    # is itself a custom element.
    if @customElementsSelector && (element.querySelector(@customElementsSelector) || element.tagName.indexOf('-') != -1)
      document.importNode(element, true)
    else
      element
