/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  let u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.motion', function() {

    u = up.util;
    
    return describe('JavaScript functions', function() {
    
      describe('up.animate', function() {

        it('animates the given element', function(done) {
          const $element = $fixture('.element').text('content');
          up.animate($element, 'fade-in', {duration: 200, easing: 'linear'});

          u.timer(1, () => expect($element).toHaveOpacity(0.0, 0.15));
          u.timer(100, () => expect($element).toHaveOpacity(0.5, 0.3));
          return u.timer(260, function() {
            expect($element).toHaveOpacity(1.0, 0.15);
            return done();
          });
        });

        it('returns a promise that is fulfilled when the animation has completed', function(done) {
          const $element = $fixture('.element').text('content');
          const resolveSpy = jasmine.createSpy('resolve');

          const promise = up.animate($element, 'fade-in', {duration: 100, easing: 'linear'});
          promise.then(resolveSpy);

          return u.timer(50, function() {
            let timingTolerance;
            expect(resolveSpy).not.toHaveBeenCalled();
            return u.timer(50 + (timingTolerance = 120), function() {
              expect(resolveSpy).toHaveBeenCalled();
              return done();
            });
          });
        });

        it('cancels an existing animation on the element by instantly jumping to the last frame', asyncSpec(function(next) {
          const $element = $fixture('.element').text('content');
          up.animate($element, { 'font-size': '40px' }, {duration: 10000, easing: 'linear'});

          next(() => {
            return up.animate($element, { 'fade-in': 'fade-in' }, {duration: 100, easing: 'linear'});
          });

          return next(() => {
            return expect($element.css('font-size')).toEqual('40px');
          });
        })
        );

        it('pauses an existing CSS transitions and restores it once the Unpoly animation is done', asyncSpec(function(next) {
          let tolerance;
          const $element = $fixture('.element').text('content').css({
            backgroundColor: 'yellow',
            fontSize: '10px',
            height: '20px'
          });

          expect(parseFloat($element.css('fontSize'))).toBeAround(10, 0.1);
          expect(parseFloat($element.css('height'))).toBeAround(20, 0.1);

          next.after(10, () => {
            return $element.css({
              transition: 'font-size 500ms linear, height 500ms linear',
              fontSize: '100px',
              height: '200px'
            });
          });

          next.after(250, () => {
            // Original CSS transition should now be ~50% done
            this.fontSizeBeforeAnimate = parseFloat($element.css('fontSize'));
            this.heightBeforeAnimate = parseFloat($element.css('height'));

            expect(this.fontSizeBeforeAnimate).toBeAround(0.5 * (100 - 10), 20);
            expect(this.heightBeforeAnimate).toBeAround(0.5 * (200 - 20), 40);

            return up.animate($element, 'fade-in', {duration: 500, easing: 'linear'});
          });

          next.after(250, () => {
            // Original CSS transition should remain paused at ~50%
            // Unpoly animation should now be ~50% done
            expect(parseFloat($element.css('fontSize'))).toBeAround(this.fontSizeBeforeAnimate, 10);
            expect(parseFloat($element.css('height'))).toBeAround(this.heightBeforeAnimate, 10);
            return expect(parseFloat($element.css('opacity'))).toBeAround(0.5, 0.3);
          });

          next.after(250, () => {
            // Unpoly animation should now be done
            // The original transition resumes. For technical reasons it will take
            // its full duration for the remaining frames of the transition.
            return expect(parseFloat($element.css('opacity'))).toBeAround(1.0, 0.3);
          });

          return next.after((500 + (tolerance = 125)), () => {
            expect(parseFloat($element.css('fontSize'))).toBeAround(100, 20);
            return expect(parseFloat($element.css('height'))).toBeAround(200, 40);
          });
        })
        );


        describe('when up.animate() is called from inside an animation function', function() {

          it('animates', function(done) {
            const $element = $fixture('.element').text('content');

            const animation = function($element, options) {
              e.setStyle($element, {opacity: 0});
              return up.animate($element, { opacity: 1 }, options);
            };

            up.animate($element, animation, {duration: 300, easing: 'linear'});

            u.timer(5, () => expect($element).toHaveOpacity(0.0, 0.25));
            u.timer(150, () => expect($element).toHaveOpacity(0.5, 0.25));
            return u.timer(300, function() {
              expect($element).toHaveOpacity(1.0, 0.25);
              return done();
            });
          });

          return it("finishes animations only once", function(done) {
            const $element = $fixture('.element').text('content');

            const animation = function($element, options) {
              e.setStyle($element, {opacity: 0});
              return up.animate($element, { opacity: 1 }, options);
            };

            up.animate($element, animation, {duration: 200, easing: 'linear'});

            return u.task(() => {
              expect(up.motion.finishCount()).toEqual(1);
              return done();
            });
          });
        });


        describe('with animations disabled globally', function() {

          beforeEach(() => up.motion.config.enabled = false);

          return it("doesn't animate and directly sets the last frame instead", function(done) {
            const $element = $fixture('.element').text('content');
            const callback = jasmine.createSpy('animation done callback');
            const animateDone = up.animate($element, { 'font-size': '40px' }, {duration: 10000, easing: 'linear'});
            animateDone.then(callback);

            return u.timer(5, () => {
              expect($element.css('font-size')).toEqual('40px');
              expect(callback).toHaveBeenCalled();
              return done();
            });
          });
        });

        return [false, null, undefined, 'none', '', {}].forEach(noneAnimation => describe(`when called with a \`${noneAnimation}\` animation`, () => it("doesn't animate and resolves instantly", asyncSpec(function(next) {
          const $element = $fixture('.element').text('content');
          const callback = jasmine.createSpy('animation done callback');
          const animateDone = up.animate($element, noneAnimation, {duration: 10000, easing: 'linear'});
          animateDone.then(callback);
          return next(() => expect(callback).toHaveBeenCalled());
        })
        )));
      });


      describe('up.motion.finish', function() {

        describe('when called with an element or selector', function() {

          it('cancels an existing animation on the given element by instantly jumping to the last frame', asyncSpec(function(next) {
            const $element = $fixture('.element').text('content');
            up.animate($element, { 'font-size': '40px', 'opacity': '0.5' }, {duration: 30000});

            next(() => {
              return up.motion.finish($element);
            });

            return next(() => {
              expect($element.css('font-size')).toEqual('40px');
              return expect($element).toHaveOpacity(0.5, 0.01);
            });
          })
          ); // Safari sometimes has rounding errors

          it('cancels animations on children of the given element', asyncSpec(function(next) {
            const $parent = $fixture('.element');
            const $child = $parent.affix('.child');
            up.animate($child, { 'font-size': '40px' }, {duration: 10000});

            next(() => {
              return up.motion.finish($parent);
            });

            return next(() => {
              return expect($child.css('font-size')).toEqual('40px');
            });
          })
          );

          it('does not cancel animations on other elements', asyncSpec(function(next) {
            const $element1 = $fixture('.element1').text('content1');
            const $element2 = $fixture('.element2').text('content2');
            up.animate($element1, 'fade-in', {duration: 10000});
            up.animate($element2, 'fade-in', {duration: 10000});

            next(() => {
              return up.motion.finish($element1);
            });

            return next(() => {
              expect(Number($element1.css('opacity'))).toEqual(1);
              return expect(Number($element2.css('opacity'))).toBeAround(0, 0.1);
            });
          })
          );

          it('restores CSS transitions from before the Unpoly animation', asyncSpec(function(next) {
            const $element = $fixture('.element').text('content');
            $element.css({'transition': 'font-size 3s ease'});
            const oldTransitionProperty = $element.css('transition-property');
            expect(oldTransitionProperty).toBeDefined();
            expect(oldTransitionProperty).toContain('font-size'); // be paranoid
            up.animate($element, 'fade-in', {duration: 10000});

            next(() => {
              return up.motion.finish($element);
            });

            return next(() => {
              expect($element).toHaveOpacity(1);
              const currentTransitionProperty = $element.css('transition-property');
              expect(currentTransitionProperty).toEqual(oldTransitionProperty);
              expect(currentTransitionProperty).toContain('font-size');
              return expect(currentTransitionProperty).not.toContain('opacity');
            });
          })
          );

          it('cancels an existing transition on the old element by instantly jumping to the last frame', asyncSpec(function(next) {
            const $v1 = $fixture('.element').text('v1');
            const $v2 = $fixture('.element').text('v2');

            up.morph($v1, $v2, 'cross-fade', {duration: 200});

            next(() => {
              expect($v1).toHaveOpacity(1.0, 0.2);
              expect($v2).toHaveOpacity(0.0, 0.2);

              return up.motion.finish($v1);
            });

            return next(() => {
              expect($v1).toBeDetached();
              return expect($v2).toHaveOpacity(1.0, 0.2);
            });
          })
          );

          it('cancels an existing transition on the new element by instantly jumping to the last frame', asyncSpec(function(next) {
            const $v1 = $fixture('.element').text('v1');
            const $v2 = $fixture('.element').text('v2');

            up.morph($v1, $v2, 'cross-fade', {duration: 200});

            next(() => {
              expect($v1).toHaveOpacity(1.0, 0.2);
              expect($v2).toHaveOpacity(0.0, 0.2);

              return up.motion.finish($v2);
            });

            return next(() => {
              expect($v1).toBeDetached();
              return expect($v2).toHaveOpacity(1.0, 0.2);
            });
          })
          );


          it('cancels transitions on children of the given element', asyncSpec(function(next) {
            const $parent = $fixture('.parent');
            const $old = $parent.affix('.old').text('old content');
            const $new = $parent.affix('.new').text('new content');

            up.morph($old, $new, 'cross-fade', {duration: 2000});

            next(() => {
              expect($old).toHaveOpacity(1.0, 0.1);
              expect($new).toHaveOpacity(0.0, 0.1);

              return up.motion.finish($parent);
            });

            return next(() => {
              expect($old).toBeDetached();
              return expect($new).toHaveOpacity(1.0);
            });
          })
          );


          it('does not leave .up-bounds elements in the DOM', asyncSpec(function(next) {
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content');

            up.morph($old, $new, 'cross-fade', {duration: 2000});

            next(() => {
              return up.motion.finish($old);
            });

            return next(() => {
              expect($old).toBeDetached();
              return expect($('.up-bounds').length).toBe(0);
            });
          })
          );


          it('emits an up:motion:finish event on the given animating element, so custom animation functions can react to the finish request', asyncSpec(function(next) {
            const $element = $fixture('.element').text('element text');
            const listener = jasmine.createSpy('finish event listener');
            $element.on('up:motion:finish', listener);

            up.animate($element, 'fade-in');

            next(() => {
              expect(listener).not.toHaveBeenCalled();
              return up.motion.finish();
            });

            return next(() => {
              return expect(listener).toHaveBeenCalled();
            });
          })
          );


          return it('does not emit an up:motion:finish event if no element is animating', asyncSpec(function(next) {
            const listener = jasmine.createSpy('finish event listener');
            up.on('up:motion:finish', listener);
            up.motion.finish();

            return next(() => {
              return expect(listener).not.toHaveBeenCalled();
            });
          })
          );
        });


        return describe('when called without arguments', () => it('cancels all animations on the screen', asyncSpec(function(next) {
          let $element1 = $fixture('.element1').text('content1');
          let $element2 = $fixture('.element2').text('content2');

          up.animate($element1, 'fade-in', {duration: 3000});
          up.animate($element2, 'fade-in', {duration: 3000});

          next(() => {
            expect($element1).toHaveOpacity(0.0, 0.1);
            expect($element2).toHaveOpacity(0.0, 0.1);

            return up.motion.finish();
          });

          return next(() => {
            $element1 = $('.element1');
            $element2 = $('.element2');
            expect($element1).toHaveOpacity(1.0);
            return expect($element2).toHaveOpacity(1.0);
          });
        })
        ));
      });

      describe('up.morph', function() {

        it('transitions between two element by absolutely positioning one element above the other', asyncSpec(function(next) {
          let tolerance;
          const $old = $fixture('.old').text('old content').css({width: '200px', width: '200px'});
          const $new = $fixture('.new').text('new content').css({width: '200px', width: '200px'}).detach();

          const oldDims = $old[0].getBoundingClientRect();

          up.morph($old, $new, 'cross-fade', {duration: 200, easing: 'linear'});

          next(() => {
            expect($old[0].getBoundingClientRect()).toEqual(oldDims);
            expect($new[0].getBoundingClientRect()).toEqual(oldDims);

            expect($old).toHaveOpacity(1.0, 0.25);
            return expect($new).toHaveOpacity(0.0, 0.25);
          });

          next.after(100, () => {
            expect($old).toHaveOpacity(0.5, 0.25);
            return expect($new).toHaveOpacity(0.5, 0.25);
          });

          return next.after((100 + (tolerance = 110)), () => {
            expect($new).toHaveOpacity(1.0, 0.25);
            return expect($old).toBeDetached();
          });
        })
        );

        it('does not change the position of sibling elements (as long as the old and new elements are of equal size)', asyncSpec(function(next) {
          const $container = $fixture('.container');

          const $before = $container.affix('.before').css({margin: '20px'});
          const $old = $container.affix('.old').text('old content').css({width: '200px', width: '200px', margin: '20px'});
          const $new = $container.affix('.new').text('new content').css({width: '200px', width: '200px', margin: '20px'}).detach();
          const $after = $container.affix('.before').css({margin: '20px'});

          const beforeDims = $before[0].getBoundingClientRect();
          const afterDims = $after[0].getBoundingClientRect();

          up.morph($old, $new, 'cross-fade', {duration: 30, easing: 'linear'});

          next(() => {
            expect($before[0].getBoundingClientRect()).toEqual(beforeDims);
            return expect($after[0].getBoundingClientRect()).toEqual(afterDims);
          });

          return next.after(50, () => {
            expect($before[0].getBoundingClientRect()).toEqual(beforeDims);
            return expect($after[0].getBoundingClientRect()).toEqual(afterDims);
          });
        })
        );

        it('transitions between two elements that are already positioned absolutely', asyncSpec(function(next) {
          let timingTolerance;
          const elementStyles = {
            position: 'absolute',
            left: '30px',
            top: '30px',
            width: '200px',
            width: '200px'
          };
          const $old = $fixture('.old').text('old content').css(elementStyles);
          const $new = $fixture('.new').text('new content').css(elementStyles).detach();

          const oldDims = $old[0].getBoundingClientRect();

          up.morph($old, $new, 'cross-fade', {duration: 100, easing: 'linear'});

          next(() => {
            expect($old[0].getBoundingClientRect()).toEqual(oldDims);
            return expect($new[0].getBoundingClientRect()).toEqual(oldDims);
          });

          return next.after((100 + (timingTolerance = 120)), () => {
            expect($old).toBeDetached();
            return expect($new[0].getBoundingClientRect()).toEqual(oldDims);
          });
        })
        );

        it('cancels an existing transition on the new element by instantly jumping to the last frame', asyncSpec(function(next) {
          const $v1 = $fixture('.element').text('v1');
          const $v2 = $fixture('.element').text('v2');
          const $v3 = $fixture('.element').text('v3');

          up.morph($v1, $v2, 'cross-fade', {duration: 200});

          next(() => {
            expect($v1).toHaveOpacity(1.0, 0.2);
            expect($v2).toHaveOpacity(0.0, 0.2);

            return up.morph($v2, $v3, 'cross-fade', {duration: 200});
          });

          return next(() => {
            expect($v1).toBeDetached();
            expect($v2).toHaveOpacity(1.0, 0.2);
            return expect($v3).toHaveOpacity(0.0, 0.2);
          });
        })
        );

        it('detaches the old element in the DOM', function(done) {
          const $v1 = $fixture('.element').text('v1');
          const $v2 = $fixture('.element').text('v2');

          const morphDone = up.morph($v1, $v2, 'cross-fade', {duration: 5});

          return morphDone.then(function() {
            expect($v1).toBeDetached();
            expect($v2).toBeAttached();
            return done();
          });
        });

        it('does not leave .up-bounds elements in the DOM', function(done) {
          const $v1 = $fixture('.element').text('v1');
          const $v2 = $fixture('.element').text('v2');

          const morphDone = up.morph($v1, $v2, 'cross-fade', {duration: 5});

          return morphDone.then(function() {
            expect('.up-bounds').not.toBeAttached();
            return done();
          });
        });


        describe('when up.animate() is called from inside a transition function', function() {

          it('animates', asyncSpec(function(next) {
            let tolerance;
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content').detach();

            const oldDims = $old[0].getBoundingClientRect();

            const transition = function(oldElement, newElement, options) {
              up.animate(oldElement, 'fade-out', options);
              return up.animate(newElement, 'fade-in', options);
            };

            up.morph($old, $new, transition, {duration: 200, easing: 'linear'});

            next(() => {
              expect($old[0].getBoundingClientRect()).toEqual(oldDims);
              expect($new[0].getBoundingClientRect()).toEqual(oldDims);

              expect($old).toHaveOpacity(1.0, 0.25);
              return expect($new).toHaveOpacity(0.0, 0.25);
            });

            next.after(100, () => {
              expect($old).toHaveOpacity(0.5, 0.25);
              return expect($new).toHaveOpacity(0.5, 0.25);
            });

            return next.after((100 + (tolerance = 110)), () => {
              expect($new).toHaveOpacity(1.0, 0.1);
              expect($old).toBeDetached();
              return expect($new).toBeAttached();
            });
          })
          );

          return it('finishes animations only once', asyncSpec(function(next) {
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content').detach();

            const transition = function(oldElement, newElement, options) {
              up.animate(oldElement, 'fade-out', options);
              return up.animate(newElement, 'fade-in', options);
            };

            up.morph($old, $new, transition, {duration: 200, easing: 'linear'});

            return next(() => expect(up.motion.finishCount()).toEqual(1));
          })
          );
        });

        describe('when up.morph() is called from inside a transition function', function() {

          it('morphs', asyncSpec(function(next) {
            let tolerance;
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content').detach();

            const oldDims = $old[0].getBoundingClientRect();

            const transition = (oldElement, newElement, options) => up.morph(oldElement, newElement, 'cross-fade', options);

            up.morph($old, $new, transition, {duration: 400, easing: 'linear'});

            next(() => {
              expect($old[0].getBoundingClientRect()).toEqual(oldDims);
              expect($new[0].getBoundingClientRect()).toEqual(oldDims);

              expect($old).toHaveOpacity(1.0, 0.25);
              return expect($new).toHaveOpacity(0.0, 0.25);
            });

            next.after(200, () => {
              expect($old).toHaveOpacity(0.5, 0.25);
              return expect($new).toHaveOpacity(0.5, 0.25);
            });

            return next.after((200 + (tolerance = 110)), () => {
              expect($new).toHaveOpacity(1.0, 0.25);
              expect($old).toBeDetached();
              return expect($new).toBeAttached();
            });
          })
          );

          return it("finishes animations only once", asyncSpec(function(next) {
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content').detach();

            const transition = (oldElement, newElement, options) => up.morph(oldElement, newElement, 'cross-fade', options);

            up.morph($old, $new, transition, {duration: 50, easing: 'linear'});

            return next(() => expect(up.motion.finishCount()).toEqual(1));
          })
          );
        });


        describe('with { reveal: true } option', () => it('reveals the new element while making the old element within the same viewport appear as if it would keep its scroll position', asyncSpec(function(next) {
          const $container = $fixture('.container[up-viewport]').css({
            'width': '200px',
            'height': '200px',
            'overflow-y': 'scroll',
            'position': 'fixed',
            'left': 0,
            'top': 0
          });
          const $old = $fixture('.old').appendTo($container).css({height: '600px'});
          $container.scrollTop(300);

          expect($container.scrollTop()).toEqual(300);

          const $new = $fixture('.new').css({height: '600px'}).detach();

          up.morph($old, $new, 'cross-fade', {duration: 50, reveal: true});

          return next(() => {
            // Container is scrolled up due to { reveal: true } option.
            // Since $old and $new are sitting in the same viewport with a
            // single shared scrollbar, this will make the ghost for $old jump.
            expect($container.scrollTop()).toEqual(0);

            // See that the ghost for $new is aligned with the top edge
            // of the viewport.
            expect($new.offset().top).toEqual(0);

            // The absolitized $old is shifted upwards to make it looks like it
            // was at the scroll position before we revealed $new.
            return expect($old.offset().top).toEqual(-300);
          });
        })
        ));

        describe('with animations disabled globally', function() {

          beforeEach(() => up.motion.config.enabled = false);

          return it("doesn't animate and detaches the old element instead", asyncSpec(function(next) {
            const $old = $fixture('.old').text('old content');
            const $new = $fixture('.new').text('new content');
            up.morph($old, $new, 'cross-fade', {duration: 1000});

            return next(() => {
              expect($old).toBeDetached();
              expect($new).toBeAttached();
              return expect($new).toHaveOpacity(1.0);
            });
          })
          );
        });


        return [false, null, undefined, 'none', 'none/none', '', [], [undefined, null], ['none', 'none'], ['none', {}]].forEach(noneTransition => describe(`when called with a \`${JSON.stringify(noneTransition)}\` transition`, () => it("doesn't animate and detaches the old element instead", asyncSpec(function(next) {
          const $old = $fixture('.old').text('old content');
          const $new = $fixture('.new').text('new content');
          up.morph($old, $new, noneTransition, {duration: 1000});

          return next(() => {
            expect($old).toBeDetached();
            expect($new).toBeAttached();
            return expect($new).toHaveOpacity(1.0);
          });
        })
        )));
      });


      describe('up.transition', () => it('should have tests'));
        
      return describe('up.animation', () => it('should have tests'));
    });
  });
})();