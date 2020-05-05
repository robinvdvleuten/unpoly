/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.element', function() {

    describe('up.element.get()', function() {

      it('returns the given element', function() {
        const element = fixture('.element');
        return expect(up.element.get(element)).toBe(element);
      });

      it('returns the first element in the given jQuery collection', function() {
        const $element = $fixture('.element');
        return expect(up.element.get($element)).toBe($element[0]);
      });

      it('throws an error if passed a jQuery collection with multiple elements', function() {
        const $element1 = $fixture('.element');
        const $element2 = $fixture('.element');
        const $list = $element1.add($element2);
        const get = () => up.element.get($list);
        return expect(get).toThrowError(/cannot cast/i);
      });

      it('returns the first element matching the given CSS selector string', function() {
        const match = fixture('.match');
        return expect(up.element.get('.match')).toBe(match);
      });

      it('returns the given document object', () => expect(up.element.get(document)).toBe(document));

      it('returns the given window object', () => expect(up.element.get(window)).toBe(window));

      it('returns undefined for undefined', () => expect(up.element.get(undefined)).toBeUndefined());

      return it('returns null for null', () => expect(up.element.get(null)).toBeNull());
    });

    describe('up.element.first()', function() {

      it('returns the first element matching the given selector', function() {
        const match = fixture('.match');
        const otherMatch = fixture('.match');
        const noMatch = fixture('.no-match');
        const result = up.element.first('.match');
        return expect(result).toBe(match);
      });

      it('supports the custom :has() selector', function() {
        const match = fixture('.match');
        const otherMatch = fixture('.match');
        const otherMatchChild = up.element.affix(otherMatch, '.child');

        const result = up.element.first('.match:has(.child)');
        return expect(result).toBe(otherMatch);
      });

      return describe('when given a root element for the search', function() {

        it('returns the first descendant of the given root that matches the given selector', function() {
          const $element = $fixture('.element');
          const $matchingChild = $element.affix('.child.match');
          const $matchingGrandChild = $matchingChild.affix('.grand-child.match');
          const $otherChild = $element.affix('.child');
          const $otherGrandChild = $otherChild.affix('.grand-child');
          const result = up.element.first($element[0], '.match');
          return expect(result).toEqual($matchingChild[0]);
      });

        it('returns missing if no descendant matches', function() {
          const $element = $fixture('.element');
          const $child = $element.affix('.child');
          const $grandChild = $child.affix('.grand-child');
          const result = up.element.first($element[0], '.match');
          return expect(result).toBeMissing();
        });

        it('does not return the root itself, even if it matches', function() {
          const $element = $fixture('.element.match');
          const result = up.element.first($element[0], '.match');
          return expect(result).toBeMissing();
        });

        it('does not return an ancestor of the root, even if it matches', function() {
          const $parent = $fixture('.parent.match');
          const $element = $parent.affix('.element');
          const result = up.element.first($element[0], '.match');
          return expect(result).toBeMissing();
        });

        it('supports the custom :has() selector', function() {
          const $element = $fixture('.element');
          const $childWithSelectorWithChild = $element.affix('.selector');
          $childWithSelectorWithChild.affix('.match');
          const $childWithSelectorWithoutChild = $element.affix('.selector');
          const $childWithoutSelectorWithChild = $element.affix('.other-selector');
          $childWithoutSelectorWithChild.affix('.match');
          const $childWithoutSelectorWithoutChild = $fixture('.other-selector');

          const result = up.element.first($element[0], '.selector:has(.match)');
          return expect(result).toBe($childWithSelectorWithChild[0]);
      });

        return it('supports the custom :has() selector when a previous sibling only matches its own selector, but not the descendant selector (bugfix)', function() {
          const $element = $fixture('.element');
          const $childWithSelectorWithoutChild = $element.affix('.selector');
          const $childWithSelectorWithChild = $element.affix('.selector');
          $childWithSelectorWithChild.affix('.match');

          const result = up.element.first($element[0], '.selector:has(.match)');
          return expect(result).toBe($childWithSelectorWithChild[0]);
      });
    });
  });

    describe('up.element.all()', function() {

      it('returns all elements matching the given selector', function() {
        const match = fixture('.match');
        const otherMatch = fixture('.match');
        const noMatch = fixture('.no-match');
        const result = up.element.all('.match');
        return expect(result).toMatchList([match, otherMatch]);
    });

      it('supports the custom :has() selector');

      return describe('when given a root element for the search', function() {

        it('returns all descendants of the given root matching the given selector', function() {
          const $element = $fixture('.element');
          const $matchingChild = $element.affix('.child.match');
          const $matchingGrandChild = $matchingChild.affix('.grand-child.match');
          const $otherChild = $element.affix('.child');
          const $otherGrandChild = $otherChild.affix('.grand-child');
          const results = up.element.all($element[0], '.match');
          return expect(results).toEqual([$matchingChild[0], $matchingGrandChild[0]]);
      });

        it('returns an empty list if no descendant matches', function() {
          const $element = $fixture('.element');
          const $child = $element.affix('.child');
          const $grandChild = $child.affix('.grand-child');
          const results = up.element.all($element[0], '.match');
          return expect(results).toEqual([]);
      });

        it('does not return the root itself, even if it matches', function() {
          const $element = $fixture('.element.match');
          const results = up.element.all($element[0], '.match');
          return expect(results).toEqual([]);
      });

        it('does not return ancestors of the root, even if they match', function() {
          const $parent = $fixture('.parent.match');
          const $element = $parent.affix('.element');
          const results = up.element.all($element[0], '.match');
          return expect(results).toEqual([]);
      });

        return it('supports the custom :has() selector', function() {
          const $element = $fixture('.element');
          const $childWithSelectorWithChild = $element.affix('.selector');
          $childWithSelectorWithChild.affix('.match');
          const $childWithSelectorWithoutChild = $element.affix('.selector');
          const $childWithoutSelectorWithChild = $element.affix('.other-selector');
          $childWithoutSelectorWithChild.affix('.match');
          const $childWithoutSelectorWithoutChild = $fixture('.other-selector');

          const results = up.element.all($element[0], '.selector:has(.match)');
          return expect(results).toEqual([$childWithSelectorWithChild[0]]);
      });
    });
  });

    describe('up.element.list()', function() {

      it('returns the given array of elements', function() {
        const array = [document.body];
        const result = up.element.list(array);
        return expect(result).toEqual(array);
      });

      it('returns an empty list for undefined', function() {
        const result = up.element.list(undefined);
        return expect(result).toEqual([]);
    });

      it('returns an empty list for null', function() {
        const result = up.element.list(null);
        return expect(result).toEqual([]);
    });

      it('converts a NodeList to an array', function() {
        const nodeList = document.querySelectorAll('body');
        const result = up.element.list(nodeList);
        expect(u.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        return expect(result[0]).toBe(document.body);
      });

      it('returns a concatenated array from multiple lists and elements', function() {
        const div0 = $fixture('div.div0')[0];
        const div1 = $fixture('div.div1')[0];
        const div2 = $fixture('div.div2')[0];
        const div3 = $fixture('div.div3')[0];

        const result = up.element.list(div0, [div1, div2], div3);
        expect(u.isArray(result)).toBe(true);
        return expect(result).toEqual([div0, div1, div2, div3]);
    });

      return it('ignores missing values when concatenating arrays', function() {
        const div0 = $fixture('div.div0')[0];
        const div1 = $fixture('div.div1')[0];
        const div2 = $fixture('div.div2')[0];
        const div3 = $fixture('div.div3')[0];

        const result = up.element.list(null, div0, [div1, div2], undefined, div3);
        expect(u.isArray(result)).toBe(true);
        return expect(result).toEqual([div0, div1, div2, div3]);
    });
  });

    describe('up.element.subtree()', function() {

      it('returns all descendants of the given root matching the given selector', function() {
        const $element = $fixture('.element');
        const $matchingChild = $element.affix('.child.match');
        const $matchingGrandChild = $matchingChild.affix('.grand-child.match');
        const $otherChild = $element.affix('.child');
        const $otherGrandChild = $otherChild.affix('.grand-child');
        const results = up.element.subtree($element[0], '.match');
        return expect(results).toEqual([$matchingChild[0], $matchingGrandChild[0]]);
    });

      it('includes the given root if it matches the selector', function() {
        const $element = $fixture('.element.match');
        const $matchingChild = $element.affix('.child.match');
        const $matchingGrandChild = $matchingChild.affix('.grand-child.match');
        const $otherChild = $element.affix('.child');
        const $otherGrandChild = $otherChild.affix('.grand-child');
        const results = up.element.subtree($element[0], '.match');
        return expect(results).toEqual([$element[0], $matchingChild[0], $matchingGrandChild[0]]);
    });

      it('does not return ancestors of the root, even if they match', function() {
        const $parent = $fixture('.parent.match');
        const $element = $parent.affix('.element');
        const results = up.element.subtree($element[0], '.match');
        return expect(results).toEqual([]);
    });

      it('returns an empty list if neither root nor any descendant matches', function() {
        const $element = $fixture('.element');
        const $child = $element.affix('.child');
        const results = up.element.subtree($element[0], '.match');
        return expect(results).toEqual([]);
    });

      return it('supports the custom :has() selector', function() {
        const $element = $fixture('.selector');
        const $childWithSelectorWithChild = $element.affix('.selector');
        $childWithSelectorWithChild.affix('.match');
        const $childWithSelectorWithoutChild = $element.affix('.selector');
        const $childWithoutSelectorWithChild = $element.affix('.other-selector');
        $childWithoutSelectorWithChild.affix('.match');
        const $childWithoutSelectorWithoutChild = $fixture('.other-selector');

        const results = up.element.subtree($element[0], '.selector:has(.match)');
        return expect(results).toEqual([$element[0], $childWithSelectorWithChild[0]]);
    });
  });

    describe('up.element.closest()', function() {

      it('returns the closest ancestor of the given root that matches the given selector', function() {
        const $grandGrandMother = $fixture('.match');
        const $grandMother = $fixture('.match');
        const $mother = $grandMother.affix('.no-match');
        const $element = $mother.affix('.element');

        const result = up.element.closest($element[0], '.match');
        return expect(result).toBe($grandMother[0]);
      });

      it('returns the given root if it matches', function() {
        const $mother = $fixture('.match');
        const $element = $mother.affix('.match');

        const result = up.element.closest($element[0], '.match');
        return expect(result).toBe($element[0]);
      });

      it('does not return descendants of the root, even if they match', function() {
        const $element = $fixture('.element');
        const $child = $element.affix('.match');

        const result = up.element.closest($element[0], '.match');
        return expect(result).toBeMissing();
      });

      return it('returns missing if neither root nor ancestor matches', function() {
        const $mother = $fixture('.no-match');
        const $element = $mother.affix('.no-match');

        const result = up.element.closest($element[0], '.match');
        return expect(result).toBeMissing();
      });
    });

    describe('up.element.ancestor()', function() {

      it('returns the closest ancestor of the given root that matches the given selector', function() {
        const $grandGrandMother = $fixture('.match');
        const $grandMother = $fixture('.match');
        const $mother = $grandMother.affix('.no-match');
        const $element = $mother.affix('.element');

        const result = up.element.ancestor($element[0], '.match');
        return expect(result).toBe($grandMother[0]);
      });

      it('does not return the given root, even if it matches', function() {
        const $element = $fixture('.match');

        const result = up.element.ancestor($element[0], '.match');
        return expect(result).toBeMissing();
      });

      it('does not return descendants of the root, even if they match', function() {
        const $element = $fixture('.element');
        const $child = $element.affix('.match');

        const result = up.element.ancestor($element[0], '.match');
        return expect(result).toBeMissing();
      });

      return it('returns missing if no ancestor matches', function() {
        const $mother = $fixture('.no-match');
        const $element = $mother.affix('.no-match');

        const result = up.element.ancestor($element[0], '.match');
        return expect(result).toBeMissing();
      });
    });

    describe('up.element.emit()', function() {});

    describe('up.element.remove()', () => it('removes the given element from the DOM', function() {
      const element = fixture('.element');
      expect(element).toBeAttached();
      up.element.remove(element);
      return expect(element).toBeDetached();
    }));

    describe('up.element.toggle()', function() {

      it('hides the given element if it is visible', function() {
        const element = fixture('.element');
        up.element.toggle(element);
        return expect(element).toBeHidden();
      });

      it('shows the given element if it is hidden', function() {
        const element = fixture('.element', {style: { display: 'none' }});
        up.element.toggle(element);
        return expect(element).toBeVisible();
      });

      it('hides the given element if the second argument is false', function() {
        const element = fixture('.element');
        expect(element).toBeVisible();
        up.element.toggle(element, false);
        return expect(element).toBeHidden();
      });

      return it('shows the given element if the second argument is true', function() {
        const element = fixture('.element');
        element.style.display = 'none';
        expect(element).toBeHidden();
        up.element.toggle(element, true);
        return expect(element).toBeVisible();
      });
    });

    describe('up.element.toggleClass()', function() {

      it('removes a class from an element that has that class', function() {
        const element = fixture('.klass');
        up.element.toggleClass(element, 'klass');
        return expect(element).not.toHaveClass('klass');
      });

      it('adds a class to an element that does not have that class', function() {
        const element = fixture('div');
        up.element.toggleClass(element, 'klass');
        return expect(element).toHaveClass('klass');
      });

      it('removes a class from the an element if the second argument is false', function() {
        const element = fixture('.klass');
        up.element.toggleClass(element, 'klass', false);
        return expect(element).not.toHaveClass('klass');
      });

      return it('adds a class to an element if the second argument is true', function() {
        const element = fixture('div');
        up.element.toggleClass(element, 'klass', true);
        return expect(element).toHaveClass('klass');
      });
    });

    describe('up.element.createFromSelector()', function() {

      it('creates an element with a given tag', function() {
        const element = up.element.createFromSelector('table');
        expect(element).toBeElement();
        return expect(element.tagName).toEqual('TABLE');
      });

      it('creates a custom element with a dash-separated tag name', function() {
        const element = up.element.createFromSelector('ta-belle');
        expect(element).toBeElement();
        return expect(element.tagName).toEqual('TA-BELLE');
      });

      it('creates an element with a given tag and class', function() {
        const element = up.element.createFromSelector('table.foo');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('TABLE');
        return expect(element.className).toEqual('foo');
      });

      it('creates an element with multiple classes', function() {
        const element = up.element.createFromSelector('table.foo.bar');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('TABLE');
        return expect(element.className).toEqual('foo bar');
      });

      it('creates an element with a given tag and ID', function() {
        const element = up.element.createFromSelector('table#foo');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('TABLE');
        return expect(element.id).toEqual('foo');
      });

      it('creates a <div> if no tag is given', function() {
        const element = up.element.createFromSelector('.foo');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('DIV');
        return expect(element.className).toEqual('foo');
      });

      it('creates a hierarchy of elements for a descendant selector, and returns the root element', function() {
        const parent = up.element.createFromSelector('ul.foo li.bar');
        expect(parent).toBeElement();
        expect(parent.tagName).toEqual('UL');
        expect(parent.className).toEqual('foo');
        expect(parent.children.length).toBe(1);
        expect(parent.firstChild.tagName).toEqual('LI');
        return expect(parent.firstChild.className).toEqual('bar');
      });

      it('creates a hierarchy of elements for a child selector, and returns the root element', function() {
        const parent = up.element.createFromSelector('ul.foo > li.bar');
        expect(parent).toBeElement();
        expect(parent.tagName).toEqual('UL');
        expect(parent.className).toEqual('foo');
        expect(parent.children.length).toBe(1);
        expect(parent.firstChild.tagName).toEqual('LI');
        return expect(parent.firstChild.className).toEqual('bar');
      });

      it('creates an element with an attribute', function() {
        const element = up.element.createFromSelector('ul[foo=bar]');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('UL');
        return expect(element.getAttribute('foo')).toEqual('bar');
      });

      it('creates an element with a value-less attribute', function() {
        const element = up.element.createFromSelector('ul[foo]');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('UL');
        return expect(element.getAttribute('foo')).toEqual('');
      });

      it('creates an element with multiple attributes', function() {
        const element = up.element.createFromSelector('ul[foo=bar][baz=bam]');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('UL');
        expect(element.getAttribute('foo')).toEqual('bar');
        return expect(element.getAttribute('baz')).toEqual('bam');
      });

      it('allows to quote attribute values with double quotes', function() {
        const element = up.element.createFromSelector('ul[foo="bar baz"]');
        expect(element).toBeElement();
        expect(element.tagName).toEqual('UL');
        return expect(element.getAttribute('foo')).toEqual('bar baz');
      });

      it('allows to quote attribute values with single quotes', function() {
        const element = up.element.createFromSelector("ul[foo='bar baz']");
        expect(element).toBeElement();
        expect(element.tagName).toEqual('UL');
        return expect(element.getAttribute('foo')).toEqual('bar baz');
      });

      it('throws an error when encountering an unknown selector', function() {
        const parse = () => up.element.createFromSelector("ul~baz");
        return expect(parse).toThrowError('Cannot parse selector: ul~baz');
      });

      it('sets attributes from a second argument', function() {
        const element = up.element.createFromSelector('div', {foo: 'one', bar: 'two'});
        expect(element.getAttribute('foo')).toEqual('one');
        return expect(element.getAttribute('bar')).toEqual('two');
      });

      it('sets inline styles from a { style } option', function() {
        const element = up.element.createFromSelector('div', {style: { fontSize: '100px', marginTop: '200px' }});
        expect(element.style.fontSize).toEqual('100px');
        return expect(element.style.marginTop).toEqual('200px');
      });

      it('adds an addition class from a { class } option', function() {
        const element = up.element.createFromSelector('.foo', {class: 'bar'});
        expect(element).toHaveClass('foo');
        return expect(element).toHaveClass('bar');
      });

      it('sets the element text from a { text } option', function() {
        const element = up.element.createFromSelector('.foo', {text: 'text'});
        return expect(element).toHaveText('text');
      });

      return it('escapes HTML from a { text } option', function() {
        const element = up.element.createFromSelector('.foo', {text: '<script>alert("foo")</script>'});
        return expect(element).toHaveText('<script>alert("foo")</script>');
      });
    });

    describe('up.element.affix', () => it('creates an element from the given selector and attaches it to the given container', function() {
      const container = fixture('.container');
      const element = up.element.affix(container, 'span');
      expect(element.tagName).toEqual('SPAN');
      return expect(element.parentElement).toBe(container);
    }));

    describe('up.element.toSelector', function() {

      it("prefers using the element's 'up-id' attribute to using the element's ID", function() {
        const $element = $fixture('div[up-id=up-id-value]#id-value');
        return expect(up.element.toSelector($element)).toBe('[up-id="up-id-value"]');
      });

      it("prefers using the element's ID to using the element's name", function() {
        const $element = $fixture('div#id-value[name=name-value]');
        return expect(up.element.toSelector($element)).toBe("#id-value");
      });

      it("selects the ID with an attribute selector if the ID contains a slash", function() {
        const $element = $fixture('div').attr({id: 'foo/bar'});
        return expect(up.element.toSelector($element)).toBe('[id="foo/bar"]');
      });

      it("selects the ID with an attribute selector if the ID contains a space", function() {
        const $element = $fixture('div').attr({id: 'foo bar'});
        return expect(up.element.toSelector($element)).toBe('[id="foo bar"]');
      });

      it("selects the ID with an attribute selector if the ID contains a dot", function() {
        const $element = $fixture('div').attr({id: 'foo.bar'});
        return expect(up.element.toSelector($element)).toBe('[id="foo.bar"]');
      });

      it("selects the ID with an attribute selector if the ID contains a quote", function() {
        const $element = $fixture('div').attr({id: 'foo"bar'});
        return expect(up.element.toSelector($element)).toBe('[id="foo\\"bar"]');
      });

      it("prefers using the element's tagName + [name] to using the element's classes", function() {
        const $element = $fixture('input[name=name-value].class1.class2');
        return expect(up.element.toSelector($element)).toBe('input[name="name-value"]');
      });

      it("prefers using the element's classes to using the element's ARIA label", function() {
        const $element = $fixture('div.class1.class2[aria-label="ARIA label value"]');
        return expect(up.element.toSelector($element)).toBe(".class1.class2");
      });

      it('does not use Unpoly classes to compose a class selector', function() {
        const $element = $fixture('div.class1.up-current.class2');
        return expect(up.element.toSelector($element)).toBe(".class1.class2");
      });

      it("prefers using the element's ARIA label to using the element's tag name", function() {
        const $element = $fixture('div[aria-label="ARIA label value"]');
        return expect(up.element.toSelector($element)).toBe('[aria-label="ARIA label value"]');
      });

      it("uses the element's tag name if no better description is available", function() {
        const $element = $fixture('div');
        return expect(up.element.toSelector($element)).toBe("div");
      });

      return it('escapes quotes in attribute selector values', function() {
        const $element = $fixture('div');
        $element.attr('aria-label', 'foo"bar');
        return expect(up.element.toSelector($element)).toBe('[aria-label="foo\\"bar"]');
      });
    });

    describe('up.element.createDocumentFromHtml', function() {

      it('parses a string that contains a serialized HTML document', function() {
        const string = `\
  <html lang="foo">
    <head>
      <title>document title</title>
    </head>
    <body data-env='production'>
      <div>line 1</div>
      <div>line 2</div>
    </body>
  </html>\
  `;

        const element = up.element.createDocumentFromHtml(string);

        expect(element.querySelector('head title').textContent).toEqual('document title');
        expect(element.querySelector('body').getAttribute('data-env')).toEqual('production');
        expect(element.querySelectorAll('body div').length).toBe(2);
        expect(element.querySelectorAll('body div')[0].textContent).toEqual('line 1');
        return expect(element.querySelectorAll('body div')[1].textContent).toEqual('line 2');
      });

      it('parses a string that contains carriage returns (bugfix)', function() {
        const string = `\
  <html>\r
    <body>\r
      <div>line</div>\r
    </body>\r
  </html>\r\
  `;

        const $element = up.element.createDocumentFromHtml(string);
        expect($element.querySelector('body')).toBeGiven();
        return expect($element.querySelector('body div').textContent).toEqual('line');
      });

      it('does not run forever if a page has a <head> without a <title> (bugfix)', function() {
        const html = `\
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
  <meta name="format-detection" content="telephone=no">
  <link href='/images/favicon.png' rel='shortcut icon' type='image/png'>
  <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1'>

      <base href="/examples/update-fragment/" />
      <link href='http://fonts.googleapis.com/css?family=Orbitron:400|Ubuntu+Mono:400,700|Source+Sans+Pro:300,400,700,400italic,700italic' rel='stylesheet' type='text/css'>
  <link href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
      <link href="/stylesheets/example/all.css" rel="stylesheet" />
      <script src="/javascripts/example.js"></script>
    </head>
    <body>
      <div class="page">
        <div class="story">

    <h1>Full story</h1>
    <p>Lorem ipsum dolor sit amet.</p>

    <a href="preview.html" up-target=".story">
      Read summary
    </a>
  </div>

      </div>
    </body>
  </html>\
  `;
        const element = up.element.createDocumentFromHtml(html);
        expect(element.querySelector("title")).toBeMissing();
        return expect(element.querySelector("h1").textContent).toEqual('Full story');
      });

      it('can parse HTML without a <head>', function() {
        const html = `\
  <html>
    <body>
      <h1>Full story</h1>
    </body>
  </html>\
  `;
        const element = up.element.createDocumentFromHtml(html);
        expect(element.querySelector("title")).toBeMissing();
        return expect(element.querySelector("h1").textContent).toEqual('Full story');
      });

      return it('can parse a HTML fragment without a <body>', function() {
        const html = `\
  <h1>Full story</h1>\
  `;
        const element = up.element.createDocumentFromHtml(html);
        expect(element.querySelector("title")).toBeMissing();
        return expect(element.querySelector("h1").textContent).toEqual('Full story');
      });
    });

    describe('up.element.createFromHtml', () => it('creates an element from the given HTML fragment', function() {
      const html = `\
  <h1>Full story</h1>\
  `;
      const element = up.element.createFromHtml(html);
      expect(element.tagName).toEqual('H1');
      return expect(element.textContent).toEqual('Full story');
    }));

    describe('up.element.fixedToAbsolute', function() {

      it("changes the given element's position from fixed to absolute, without changing its rendered position", function() {
        const $container = $fixture('.container').css({
          position: 'absolute',
          left: '100px',
          top: '100px',
          backgroundColor: 'yellow'
        });

        const $element = $container.affix('.element').text('element').css({
          position: 'fixed',
          left: '70px',
          top: '30px',
          backgroundColor: 'red'
        });

        const oldRect = up.Rect.fromElement($element[0]);

        up.element.fixedToAbsolute($element[0]);

        expect($element.css('position')).toEqual('absolute');
        const newRect = up.Rect.fromElement($element[0]);
        return expect(newRect).toEqual(oldRect);
      });

      it('correctly positions an element with margins', function() {
        const $container = $fixture('.container').css({
          position: 'absolute',
          left: '20px',
          top: '20px',
          backgroundColor: 'yellow'
        });

        const $element = $container.affix('.element').text('element').css({
          position: 'fixed',
          left: '40px',
          top: '60px',
          backgroundColor: 'red',
          margin: '15px'
        });

        const oldRect = up.Rect.fromElement($element[0]);

        up.element.fixedToAbsolute($element[0]);

        expect($element.css('position')).toEqual('absolute');
        const newRect = up.Rect.fromElement($element[0]);
        return expect(newRect).toEqual(oldRect);
      });

      it('correctly positions an element when its new offset parent has margins', function() {
        const $container = $fixture('.container').css({
          position: 'absolute',
          left: '100px',
          top: '100px',
          margin: '15px',
          backgroundColor: 'yellow'
        });

        const $element = $container.affix('.element').text('element').css({
          position: 'fixed',
          left: '70px',
          top: '30px',
          backgroundColor: 'red'
        });

        const oldRect = up.Rect.fromElement($element[0]);

        up.element.fixedToAbsolute($element[0]);

        expect($element.css('position')).toEqual('absolute');
        const newRect = up.Rect.fromElement($element[0]);
        return expect(newRect).toEqual(oldRect);
      });

      return it('correctly positions an element when the new offset parent is scrolled', function() {
        const $container = $fixture('.container').css({
          position: 'absolute',
          left: '100px',
          top: '100px',
          margin: '15px',
          backgroundColor: 'yellow',
          overflowY: 'scroll'
        });

        const $staticContainerContent = $container.affix('.content').css({height: '3000px'}).scrollTop(100);

        const $element = $container.affix('.element').text('element').css({
          position: 'fixed',
          left: '70px',
          top: '30px',
          backgroundColor: 'red'
        });

        const oldRect = up.Rect.fromElement($element[0]);

        up.element.fixedToAbsolute($element[0]);

        expect($element.css('position')).toEqual('absolute');
        const newRect = up.Rect.fromElement($element[0]);
        return expect(newRect).toEqual(oldRect);
      });
    });

    describe('up.element.booleanAttr', function() {
      
      it('returns true if the attribute value is the string "true"', function() {
        const element = fixture('div[foo=true]');
        return expect(up.element.booleanAttr(element, 'foo')).toBe(true);
      });

      it('returns true if the attribute value is the name of the attribute', function() {
        const element = fixture('div[foo=foo]');
        return expect(up.element.booleanAttr(element, 'foo')).toBe(true);
      });

      it('returns false if the attribute value is the string "false"', function() {
        const element = fixture('div[foo=false]');
        return expect(up.element.booleanAttr(element, 'foo')).toBe(false);
      });

      it('returns a missing value if the element has no such attribute', function() {
        const element = fixture('div');
        return expect(up.element.booleanAttr(element, 'foo')).toBeMissing();
      });

      return it('returns undefined if the attribute value cannot be cast to a boolean', function() {
        const element = fixture('div[foo="some text"]');
        return expect(up.element.booleanAttr(element, 'foo')).toBeUndefined();
      });
    });

    describe('up.element.setTemporaryStyle', function() {

      it("sets the given inline styles and returns a function that will restore the previous inline styles", function() {
        const div = fixture('div[style="color: red"]');
        const restore = up.element.setTemporaryStyle(div, { color: 'blue' });
        expect(div.getAttribute('style')).toContain('color: blue');
        expect(div.getAttribute('style')).not.toContain('color: red');
        restore();
        expect(div.getAttribute('style')).not.toContain('color: blue');
        return expect(div.getAttribute('style')).toContain('color: red');
      });

      return it("does not restore inherited styles", function() {
        const div = fixture('div[class="red-background"]');
        const restore = up.element.setTemporaryStyle(div, { backgroundColor: 'blue' });
        expect(div.getAttribute('style')).toContain('background-color: blue');
        restore();
        return expect(div.getAttribute('style')).not.toContain('background-color');
      });
    });

    describe('up.element.inlineStyle', function() {

      describe('with a string as second argument', function() {

        it('returns a CSS value string from an inline [style] attribute', function() {
          const div = $fixture('div').attr('style', 'background-color: #ff0000')[0];
          const style = up.element.inlineStyle(div, 'backgroundColor');
          // Browsers convert colors to rgb() values, even IE11
          return expect(style).toEqual('rgb(255, 0, 0)');
        });

        it('returns a blank value if the element does not have the given property in the [style] attribute', function() {
          const div = $fixture('div').attr('style', 'background-color: red')[0];
          const style = up.element.inlineStyle(div, 'color');
          return expect(style).toBeBlank();
        });

        return it('returns a blank value the given property is a computed property, but not in the [style] attribute', function() {
          const div = $fixture('div[class="red-background"]')[0];
          const inlineStyle = up.element.inlineStyle(div, 'backgroundColor');
          const computedStyle = up.element.style(div, 'backgroundColor');
          expect(computedStyle).toEqual('rgb(255, 0, 0)');
          return expect(inlineStyle).toBeBlank();
        });
      });

      return describe('with an array as second argument', function() {

        it('returns an object with the given inline [style] properties', function() {
          const div = $fixture('div').attr('style', 'background-color: #ff0000; color: #0000ff')[0];
          const style = up.element.inlineStyle(div, ['backgroundColor', 'color']);
          return expect(style).toEqual({
            backgroundColor: 'rgb(255, 0, 0)',
            color: 'rgb(0, 0, 255)'
          });
        });

        it('returns blank keys if the element does not have the given property in the [style] attribute', function() {
          const div = $fixture('div').attr('style', 'background-color: #ff0000')[0];
          const style = up.element.inlineStyle(div, ['backgroundColor', 'color']);
          expect(style).toHaveOwnProperty('color');
          return expect(style.color).toBeBlank();
        });

        return it('returns a blank value the given property is a computed property, but not in the [style] attribute', function() {
          const div = fixture('div[class="red-background"]');
          const inlineStyleHash = up.element.inlineStyle(div, ['backgroundColor']);
          const computedBackground = up.element.style(div, 'backgroundColor');
          expect(computedBackground).toEqual('rgb(255, 0, 0)');
          expect(inlineStyleHash).toHaveOwnProperty('backgroundColor');
          return expect(inlineStyleHash.backgroundColor).toBeBlank();
        });
      });
    });

    describe('up.element.setStyle', function() {

      it("sets the given style properties as the given element's [style] attribute", function() {
        const div = fixture('div');
        up.element.setStyle(div, { color: 'red', 'background-color': 'blue' });
        const style = div.getAttribute('style');
        expect(style).toContain('color: red');
        return expect(style).toContain('background-color: blue');
      });

      it("merges the given style properties into the given element's existing [style] value", function() {
        const div = fixture('div[style="color: red"]');
        up.element.setStyle(div, { 'background-color': 'blue' });
        const style = div.getAttribute('style');
        expect(style).toContain('color: red');
        return expect(style).toContain('background-color: blue');
      });

      it("converts the values of known length properties to px values automatically (with kebab-case)", function() {
        const div = fixture('div');
        up.element.setStyle(div, { 'padding-top': 100 });
        const style = div.getAttribute('style');
        return expect(style).toContain('padding-top: 100px');
      });

      it("converts the values of known length properties to px values automatically (with camelCase)", function() {
        const div = fixture('div');
        up.element.setStyle(div, { 'paddingTop': 100 });
        const style = div.getAttribute('style');
        return expect(style).toContain('padding-top: 100px');
      });

      return it("accepts CSS property names in camelCase", function() {
        const div = fixture('div');
        up.element.setStyle(div, { 'backgroundColor': 'blue' });
        const style = div.getAttribute('style');
        return expect(style).toContain('background-color: blue');
      });
    });

    describe('up.element.style', function() {

      it('returns the computed style for the given CSS property in kebab-case', function() {
        const div = fixture('div');
        div.style.paddingTop = '10px';
        const value = up.element.style(div, 'padding-top');
        return expect(value).toEqual('10px');
      });

      it('returns the computed style for the given CSS property in camelCase', function() {
        const div = fixture('div');
        div.style.paddingTop = '10px';
        const value = up.element.style(div, 'paddingTop');
        return expect(value).toEqual('10px');
      });

      it('returns the computed style for multiple CSS properties in kebab-case', function() {
        const div = fixture('div');
        div.style.paddingTop = '10px';
        div.style.paddingBottom = '20px';
        const value = up.element.style(div, ['padding-top', 'padding-bottom']);
        return expect(value).toEqual({ 'padding-top': '10px', 'padding-bottom': '20px' });
    });

      return it('returns the computed style for multiple CSS properties in camelCase', function() {
        const div = fixture('div');
        div.style.paddingTop = '10px';
        div.style.paddingBottom = '20px';
        const value = up.element.style(div, ['paddingTop', 'paddingBottom']);
        return expect(value).toEqual({ 'paddingTop': '10px', 'paddingBottom': '20px' });
    });
  });

    return describe('up.element.isVisible', function() {

      it('returns true for an attached element', function() {
        const element = fixture('.element', {text: 'content'});
        return expect(up.element.isVisible(element)).toBe(true);
      });

      it('returns true for an attached block element without content', function() {
        const element = fixture('div.element');
        return expect(up.element.isVisible(element)).toBe(true);
      });

      it('returns true for an attached inline element without content', function() {
        const element = fixture('span.element');
        return expect(up.element.isVisible(element)).toBe(true);
      });

      it('returns false for a detached element', function() {
        const element = document.createElement('text');
        element.innerText = 'content';
        return expect(up.element.isVisible(element)).toBe(false);
      });

      return it('returns false for an attached element with { display: none }', function() {
        const element = fixture('.element', {text: 'content', style: { display: 'none' }});
        return expect(up.element.isVisible(element)).toBe(false);
      });
    });
  });
})();