/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.viewport', () => describe('JavaScript functions', function() {

    describe('up.reveal', function() {

      beforeEach(() => up.viewport.config.revealSnap = 0);

      describe('when the viewport is the document', function() {

        beforeEach(function() {
          const $body = $('body');

          this.$elements = [];
          this.$container = $('<div class="container">').prependTo($body);
          this.$container.css({opacity: 0.2}); // reduce flashing during test runs

          this.clientHeight = up.viewport.rootHeight();

          const elementPlans = [
            { height: this.clientHeight, backgroundColor: 'yellow' }, // [0]
            { height: '50px',        backgroundColor: 'cyan'   }, // [1]
            { height: '5000px',      backgroundColor: 'orange' }  // [2]
          ];

          return (() => {
            const result = [];
            for (let elementPlan of Array.from(elementPlans)) {
              const $element = $('<div>').css(elementPlan);
              $element.appendTo(this.$container);
              result.push(this.$elements.push($element));
            }
            return result;
          })();
        });

        afterEach(function() {
          return this.$container.remove();
        });

        const $documentViewport = () => $(up.viewport.root());

        it('reveals the given element', asyncSpec(function(next) {
          up.reveal(this.$elements[0]);

          next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // ---------------------
            // [1] ch+0 ...... ch+49
            // [2] ch+50 ... ch+5049
            expect($documentViewport().scrollTop()).toBe(0);

            return up.reveal(this.$elements[1]);
          });

          next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            expect($documentViewport().scrollTop()).toBe(50);

            return up.reveal(this.$elements[2]);
          });

          return next(() => {
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            // ---------------------
            return expect($documentViewport().scrollTop()).toBe(this.clientHeight + 50);
          });
        })
        );

        it("includes the element's top margin in the revealed area", asyncSpec(function(next) {
          this.$elements[1].css({'margin-top': '20px'});
          up.reveal(this.$elements[1]);
          return next(() => expect($(document).scrollTop()).toBe(50 + 20));
        })
        );

        it("includes the element's bottom margin in the revealed area", asyncSpec(function(next) {
          this.$elements[1].css({'margin-bottom': '20px'});
          up.reveal(this.$elements[2]);
          return next(() => expect($(document).scrollTop()).toBe(this.clientHeight + 50 + 20));
        })
        );

        it('snaps to the top if the space above the future-visible area is smaller than the value of config.revealSnap', asyncSpec(function(next) {
          up.viewport.config.revealSnap = 30;

          this.$elements[0].css({height: '20px'});

          up.reveal(this.$elements[2]);

          next(() => {
            // [0] 0 ............ 19
            // [1] 20 ........... 69
            // ---------------------
            // [2] 70 ......... 5069
            // ---------------------
            expect($(document).scrollTop()).toBe(70);

            // Even though we're revealing the second element, the viewport
            // snaps to the top edge.
            return up.reveal(this.$elements[1]);
          });

          return next(() => {
            // ---------------------
            // [0] 0 ............ 19
            // [1] 20 ........... 69
            // ---------------------
            // [2] 70 ......... 5069
            return expect($(document).scrollTop()).toBe(0);
          });
        })
        );

        it('does not snap to the top if it would un-reveal an element at the bottom edge of the screen (bugfix)', asyncSpec(function(next) {
          up.viewport.config.revealSnap = 100;

          up.reveal(this.$elements[1]);

          return next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            return expect($(document).scrollTop()).toBe(50);
          });
        })
        );


        it('scrolls far enough so the element is not obstructed by an element fixed to the top', asyncSpec(function(next) {
          const $topNav = $fixture('[up-fixed=top]').css({
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            height: '100px'
          });

          up.reveal(this.$elements[0]);

          next(() => {
            // ---------------------
            // [F] 0 ............ 99
            // [0] 0 .......... ch-1
            // ---------------------
            // [1] ch+0 ...... ch+49
            // [2] ch+50 ... ch+5049
            expect($(document).scrollTop()).toBe(0); // would need to be -100

            return up.reveal(this.$elements[1]);
          });

          next(() => {
            // ---------------------
            // [F] 0 ............ 99
            // [0] 00000 ...... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            expect($(document).scrollTop()).toBe(50);

            return up.reveal(this.$elements[2]);
          });

          next(() => {
            // [0] 00000 ...... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [F] 0 ............ 99
            // [2] ch+50 ... ch+5049
            // ----------------
            expect($(document).scrollTop()).toBe((this.clientHeight + 50) - 100);

            return up.reveal(this.$elements[1]);
          });

          return next(() => {
            // [0] 00000 ...... ch-1
            // ---------------------
            // [F] 0 ............ 99
            // [1] ch+0 ...... ch+49
            // [2] ch+50 ... ch+5049
            // ----------------
            return expect($(document).scrollTop()).toBe((this.clientHeight + 50) - 100 - 50);
          });
        })
        );

        it('scrolls far enough so the element is not obstructed by an element fixed to the top with margin, padding, border and non-zero top properties', asyncSpec(function(next) {
          const $topNav = $fixture('[up-fixed=top]').css({
            position: 'fixed',
            top: '29px',
            margin: '16px',
            border: '7px solid rgba(0, 0, 0, 0.1)',
            padding: '5px',
            left: '0',
            right: '0',
            height: '100px'
          });

          up.reveal(this.$elements[2], {viewport: this.viewport});

          return next(() => {
            // [0] 00000 ...... ch-1  [F] 0 ...... 99+props
            // [1] ch+0 ...... ch+49
            // ---------------------  ---------------------
            // [2] ch+50 ... ch+5049
            // ---------------------

            return expect($(document).scrollTop()).toBe(
              (this.clientHeight +  // scroll past @$elements[0]
              50)            -  // scroll past @$elements[1]
              100           -  // obstruction height
              29            -  // obstruction's top property
              (1 * 16)      -  // top margin (bottom margin is not a visual obstruction)
              (2 * 7)       -  // obstruction top and bottom borders
              (2 * 5)          // obstruction top and bottom paddings
            );
          });
        })
        );

        it('scrolls far enough so the element is not obstructed by an element fixed to the bottom', asyncSpec(function(next) {
          const $bottomNav = $fixture('[up-fixed=bottom]').css({
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            height: '100px'
          });

          up.reveal(this.$elements[0]);

          next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [F] 0 ............ 99
            // ---------------------
            // [1] ch+0 ...... ch+49
            // [2] ch+50 ... ch+5049
            expect($(document).scrollTop()).toBe(0);

            return up.reveal(this.$elements[1]);
          });

          next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // [F] 0 ............ 99
            // ---------------------
            // [2] ch+50 ... ch+5049
            expect($(document).scrollTop()).toBe(150);

            return up.reveal(this.$elements[2]);
          });

          return next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            // [F] 0 ............ 99
            return expect($(document).scrollTop()).toBe(this.clientHeight + 50);
          });
        })
        );

        it('scrolls far enough so the element is not obstructed by an element fixed to the bottom with margin, padding, border and non-zero bottom properties', asyncSpec(function(next) {
          const $bottomNav = $fixture('[up-fixed=bottom]').css({
            position: 'fixed',
            bottom: '29px',
            margin: '16px',
            border: '7px solid rgba(0, 0, 0, 0.2)',
            padding: '5px',
            left: '0',
            right: '0',
            height: '100px'
          });

          up.reveal(this.$elements[1]);

          return next(() => {
            // ---------------------
            // [0] 0 .......... ch-1
            // [1] ch+0 ...... ch+49
            // ---------------------
            // [2] ch+50 ... ch+5049
            // [F] 0 ...... 99+props
            return expect($(document).scrollTop()).toBe(
              50        +  // height of elements[1]
              100       +  // obstruction height
              29        +  // obstruction's bottom property
              (1 * 16)  +  // bottom margin (top margin is not a visual obstruction)
              (2 * 7)   +  // obstruction top and bottom borders
              (2 * 5)      // obstruction top and bottom paddings
            );
          });
        })
        );

        it('does not crash when called with a CSS selector (bugfix)', function(done) {
          const promise = up.reveal('.container', { behavior: 'instant' });
          return promise.then(function() {
            expect(true).toBe(true);
            return done();
          });
        });

        it('scrolls the viewport to the first row if the element if the element is higher than the viewport', asyncSpec(function(next) {
          this.$elements[0].css({height: '1000px'});
          this.$elements[1].css({height: '3000px'});

          up.reveal(this.$elements[1]);

          return next(() => {
            // [0] 0 ............ 999
            // [1] 1000 ........ 4999
            return expect($(document).scrollTop()).toBe(1000);
          });
        })
        );


        return describe('with { top: true } option', () => it('scrolls the viewport to the first row of the element, even if that element is already fully revealed', asyncSpec(function(next) {
          this.$elements[0].css({height: '20px'});

          up.reveal(this.$elements[1], { top: true, snap: false });

          return next(() => {
            // [0] 0 ............ 19
            // [1] 20 ........... 69
            // ---------------------
            // [2] 70 ......... 5069
            // ---------------------
            return expect($(document).scrollTop()).toBe(20);
          });
        })
        ));
      });


      return describe('when the viewport is a container with overflow-y: scroll', () => it('reveals the given element', asyncSpec(function(next) {
        const $viewport = $fixture('div').css({
          'position': 'absolute',
          'top': '50px',
          'left': '50px',
          'width': '100px',
          'height': '100px',
          'overflow-y': 'scroll'
        });
        const $elements = [];
        u.each([0, 1, 2, 3, 4, 5], function() {
          const $element = $('<div>').css({height: '50px'});
          $element.appendTo($viewport);
          return $elements.push($element);
        });

        // ------------
        // [0] 000..049
        // [1] 050..099
        // ------------
        // [2] 100..149
        // [3] 150..199
        // [4] 200..249
        // [5] 250..399
        expect($viewport.scrollTop()).toBe(0);

        // See that the view only scrolls down as little as possible
        // in order to reveal the element
        up.reveal($elements[3], {viewport: $viewport[0]});

        next(() => {
          // [0] 000..049
          // [1] 050..099
          // ------------
          // [2] 100..149
          // [3] 150..199
          // ------------
          // [4] 200..249
          // [5] 250..299
          expect($viewport.scrollTop()).toBe(100);

          // See that the view doesn't move if the element
          // is already revealed
          return up.reveal($elements[2], {viewport: $viewport[0]});
        });

        next(() => {
          expect($viewport.scrollTop()).toBe(100);

          // See that the view scrolls as far down as it cans
          // to show the bottom element
          return up.reveal($elements[5], {viewport: $viewport[0]});
        });

        next(() => {
          // [0] 000..049
          // [1] 050..099
          // [2] 100..149
          // [3] 150..199
          // ------------
          // [4] 200..249
          // [5] 250..299
          // ------------
          expect($viewport.scrollTop()).toBe(200);

          return up.reveal($elements[1], {viewport: $viewport[0]});
        });

        return next(() => {
          // See that the view only scrolls up as little as possible
          // in order to reveal the element
          // [0] 000..049
          // ------------
          // [1] 050..099
          // [2] 100..149
          // ------------
          // [3] 150..199
          // [4] 200..249
          // [5] 250..299
          return expect($viewport.scrollTop()).toBe(50);
        });
      })
      ));
    });

    describe('up.viewport.revealHash', function() {

      it('reveals an element with an ID matching the given #hash', asyncSpec(function(next) {
        const revealSpy = up.viewport.knife.mock('reveal');
        const $match = $fixture('div#hash');
        up.viewport.revealHash('#hash');
        return next(() => expect(revealSpy).toHaveBeenCalledWith($match[0], {top: true}));
      })
      );

      it('reveals a named anchor matching the given #hash', asyncSpec(function(next) {
        const revealSpy = up.viewport.knife.mock('reveal');
        const $match = $fixture('a[name="hash"]');
        up.viewport.revealHash('#hash');
        return next(() => expect(revealSpy).toHaveBeenCalledWith($match[0], {top: true}));
      })
      );

      it('reveals an element with an [up-id] attribute matching the given #hash', asyncSpec(function(next) {
        const revealSpy = up.viewport.knife.mock('reveal');
        const $match = $fixture('div[up-id="hash"]');
        up.viewport.revealHash('#hash');
        return next(() => expect(revealSpy).toHaveBeenCalledWith($match[0], {top: true}));
      })
      );

      it('does nothing and returns a fulfilled promise if no element or anchor matches the given #hash', function(done) {
        const revealSpy = up.viewport.knife.mock('reveal');
        const promise = up.viewport.revealHash('#hash');
        expect(revealSpy).not.toHaveBeenCalled();
        return promiseState(promise).then(function(result) {
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });

      return it('does nothing and returns a fulfilled promise if no #hash is given', function(done) {
        const revealSpy = up.viewport.knife.mock('reveal');
        const promise = up.viewport.revealHash('');
        expect(revealSpy).not.toHaveBeenCalled();
        return promiseState(promise).then(function(result) {
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });
    });

    describe('up.viewport.all', () => it('returns a list of all viewports on the screen', function() {
      const viewportElement = $fixture('[up-viewport]')[0];
      const results = up.viewport.all();
      return expect(results).toMatchList([viewportElement, up.viewport.root()]);
    }));

    describe('up.viewport.subtree', function() {

      it('returns descendant viewports of the given element', function() {
        const $motherViewport = $fixture('.mother[up-viewport]');
        const $element = $motherViewport.affix('.element');
        const $childViewport = $element.affix('.child[up-viewport]');
        const $grandChildViewport = $childViewport.affix('.grand-child[up-viewport]');
        const actual = up.viewport.subtree($element[0]);
        const expected = $childViewport.add($grandChildViewport);

        return expect(actual).toMatchList(expected);
      });

      return it('returns the given element if it is a viewport', function() {
        const viewportElement = $fixture('[up-viewport]')[0];
        const results = up.viewport.subtree(viewportElement);
        return expect(results).toMatchList([viewportElement]);
      });
    });

    describe('up.viewport.around', () => it('returns viewports that  are either ancestors, descendants, or the given element itself', function() {
      const $motherViewport = $fixture('.mother[up-viewport]');
      const $element = $motherViewport.affix('.element');
      const $childViewport = $element.affix('.child[up-viewport]');
      const $grandChildViewport = $childViewport.affix('.grand-child[up-viewport]');
      const actual = up.viewport.around($element[0]);
      const expected = $motherViewport.add($childViewport).add($grandChildViewport);

      return expect(actual).toMatchList(expected);
    }));

    describe('up.viewport.closest', function() {

      it('seeks upwards from the given element', function() {
        up.viewport.config.viewports = ['.viewport1', '.viewport2'];
        const $viewport1 = $fixture('.viewport1');
        const $viewport2 = $fixture('.viewport2');
        const $element = $fixture('div').appendTo($viewport2);
        return expect(up.viewport.closest($element)).toEqual($viewport2[0]);
      });

      it('returns the given element if it is a configured viewport itself', function() {
        up.viewport.config.viewports = ['.viewport'];
        const $viewport = $fixture('.viewport');
        return expect(up.viewport.closest($viewport)).toEqual($viewport[0]);
      });

      return describe('when no configured viewport matches', function() {

        afterEach(function() {
          if (typeof this.resetBodyCss === 'function') {
            this.resetBodyCss();
          }
          return (typeof this.resetHtmlCss === 'function' ? this.resetHtmlCss() : undefined);
        });

        it('falls back to the scrolling element', function() {
          const $element = $fixture('.element').css({height: '3000px'});
          const $result = up.viewport.closest($element);
          return expect($result).toMatchSelector(up.viewport.rootSelector());
        });

        it('falls back to the scrolling element if <body> is configured to scroll (fix for Edge)', function() {
          const $element = $fixture('.element').css({height: '3000px'});
          this.resetHtmlCss = e.setTemporaryStyle(document.documentElement, {'overflow-y': 'hidden'});
          this.resetBodyCss = e.setTemporaryStyle(document.body, {'overflow-y': 'scroll'});
          const $result = up.viewport.closest($element);
          return expect($result).toMatchSelector(up.viewport.rootSelector());
        });

        return it('falls back to the scrolling element if <html> is configured to scroll (fix for Edge)', function() {
          const $element = $fixture('.element').css({height: '3000px'});
          this.resetHtmlCss = e.setTemporaryStyle(document.documentElement, {'overflow-y': 'scroll'});
          this.resetBodyCss = e.setTemporaryStyle(document.body, {'overflow-y': 'hidden'});
          const $result = up.viewport.closest($element);
          return expect($result).toMatchSelector(up.viewport.rootSelector());
        });
      });
    });

    describe('up.viewport.restoreScroll', function() {

      it("restores a viewport's previously saved scroll position", function(done) {
        const $viewport = $fixture('#viewport[up-viewport]').css({height: '100px', overflowY: 'scroll'});
        const $content = $viewport.affix('.content').css({height: '1000px'});
        up.hello($viewport);
        $viewport.scrollTop(50);
        up.viewport.saveScroll();
        $viewport.scrollTop(70);

        return up.viewport.restoreScroll().then(function() {
          expect($viewport.scrollTop()).toEqual(50);
          return done();
        });
      });

      return it("scrolls a viewport to the top (and does not crash) if no previous scroll position is known", function(done) {
        const $viewport = $fixture('#viewport[up-viewport]').css({height: '100px', overflowY: 'scroll'});
        const $content = $viewport.affix('.content').css({height: '1000px'});
        $viewport.scrollTop(70);

        return up.viewport.restoreScroll().then(function() {
          expect($viewport.scrollTop()).toEqual(0);
          return done();
        });
      });
    });

    describe('up.scroll', () => it('should have tests'));

    describe('up.viewport.rootOverflowElement', function() {

      beforeEach(function() {
        this.body = document.body;
        this.html = document.documentElement;
        this.restoreBodyOverflowY = e.setTemporaryStyle(this.body, {'overflow-y': 'visible'});
        return this.restoreHtmlOverflowY = e.setTemporaryStyle(this.html, {'overflow-y': 'visible'});
      });

      afterEach(function() {
        this.restoreBodyOverflowY();
        return this.restoreHtmlOverflowY();
      });

      it('returns the <html> element if the developer set { overflow-y: scroll } on it', function() {
        this.html.style.overflowY = 'scroll';
        return expect(up.viewport.rootOverflowElement()).toBe(this.html);
      });

      it('returns the <html> element if the developer set { overflow-y: auto } on it', function() {
        this.html.style.overflowY = 'auto';
        return expect(up.viewport.rootOverflowElement()).toBe(this.html);
      });

      it('returns the <body> element if the developer set { overflow-y: scroll } on it', function() {
        this.body.style.overflowY = 'scroll';
        return expect(up.viewport.rootOverflowElement()).toBe(this.body);
      });

      it('returns the <body> element if the developer set { overflow-y: auto } on it', function() {
        this.body.style.overflowY = 'auto';
        return expect(up.viewport.rootOverflowElement()).toBe(this.body);
      });

      return it('returns the scrolling element if the developer set { overflow-y: visible } on both <html> and <body>', function() {
        this.html.style.overflowY = 'visible';
        this.body.style.overflowY = 'visible';
        return expect(up.viewport.rootOverflowElement()).toBe(up.viewport.root());
      });
    });

    return describe('up.viewport.absolutize', function() {

      afterEach(() => $('.up-bounds, .fixture').remove());

      it('absolutely positions the element, preserving visual position and size', function() {
        const $element = $fixture('.element').text('element text').css({paddingTop: '20px', paddingLeft: '20px'});

        expect($element.css('position')).toEqual('static');
        const previousDims = $element[0].getBoundingClientRect();

        up.viewport.absolutize($element);

        expect($element.closest('.up-bounds').css('position')).toEqual('absolute');

        const newDims = $element[0].getBoundingClientRect();
        return expect(newDims).toEqual(previousDims);
      });

      it('accurately positions the ghost over an element with margins', function() {
        const $element = $fixture('.element').css({margin: '40px'});
        const previousDims = $element[0].getBoundingClientRect();

        up.viewport.absolutize($element);

        const newDims = $element[0].getBoundingClientRect();
        return expect(newDims).toEqual(previousDims);
      });

      it("doesn't change the position of a child whose margins no longer collapse", function() {
        const $element = $fixture('.element');
        const $child = $('<div class="child">child text</div>').css({margin: '40px'}).appendTo($element);
        const previousChildDims = $child[0].getBoundingClientRect();

        up.viewport.absolutize($element);

        const newChildDims = $child[0].getBoundingClientRect();
        return expect(newChildDims).toEqual(previousChildDims);
      });

      it('correctly positions an element within a scrolled body', function() {
        const $body = $('body');
        const $element1 = $('<div class="fixture"></div>').css({height: '75px'}).prependTo($body);
        const $element2 = $('<div class="fixture"></div>').css({height: '100px'}).insertAfter($element1);
        $body.scrollTop(33);

        const previousDims = $element2[0].getBoundingClientRect();

        up.viewport.absolutize($element2);

        const newDims = $element2[0].getBoundingClientRect();
        return expect(newDims).toEqual(previousDims);
      });

      it('correctly positions an element within a scrolled parent element (that has overflow-y: scroll)', function() {
        const $viewport = $fixture('div').css({
          overflowY: 'scroll',
          height: '50px'
        });

        const $element1 = $('<div class="fixture"></div>').css({height: '75px'}).prependTo($viewport);
        const $element2 = $('<div class="fixture"></div>').css({height: '100px'}).insertAfter($element1);
        $viewport.scrollTop(33);

        const previousDims = $element2[0].getBoundingClientRect();

        up.viewport.absolutize($element2);

        const newDims = $element2[0].getBoundingClientRect();
        return expect(newDims).toEqual(previousDims);
      });

      it('converts fixed elements within the copies to absolutely positioning (relative to the closest offset parent)', function() {
        const $element = $fixture('.element').css({
          position: 'absolute',
          top: '50px',
          left: '50px'
        });
        const $fixedChild = $('<div class="fixed-child" up-fixed></div>').css({
          position: 'fixed',
          left: '77px',
          top: '77px'
        });
        $fixedChild.appendTo($element);
        up.viewport.absolutize($element);

        return expect($fixedChild.css(['position', 'left', 'top'])).toEqual({
          position: 'absolute',
          left: '27px',
          top: '27px'
        });
      });

      return it("does not convert fixed elements outside the element's subtree (bugfix)", function() {
        const $element = $fixture('.element').css({position: 'absolute'});
        const $fixedChild = $('<div class="fixed-child" up-fixed></div>').css({position: 'fixed'});
        $fixedChild.appendTo($element);
        const $fixedSibling = $fixture('[up-fixed]').css({position: 'fixed'});

        up.viewport.absolutize($element);

        expect($fixedChild.css('position')).toEqual('absolute');
        return expect($fixedSibling.css('position')).toEqual('fixed');
      });
    });
  }));
})();