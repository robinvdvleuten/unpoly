/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.tooltip', function() {

    describe('JavaScript functions', function() {
      
      describe('up.tooltip.attach', function() {
        
        it('opens a tooltip with the given text', function(done) {
          const $link = $fixture('span');
          return up.tooltip.attach($link, {html: 'tooltip text'}).then(function() {
            const $tooltip = $('.up-tooltip');
            expect($tooltip).toHaveText('tooltip text');
            return done();
          });
        });

        it('allows HTML for the tooltip text when contents are given as { html } option', function(done) {
          const $link = $fixture('span');
          return up.tooltip.attach($link, {html: '<b>text</b>'}).then(function() {
            const $tooltip = $('.up-tooltip');
            expect($tooltip.html()).toContain('<b>text</b>');
            return done();
          });
        });

        it('escapes HTML for the tooltip text when contents given as { text } option', function(done) {
          const $link = $fixture('span');
          return up.tooltip.attach($link, {text: '<b>text</b>'}).then(function() {
            const $tooltip = $('.up-tooltip');
            expect($tooltip.html()).toContain('&lt;b&gt;text&lt;/b&gt;');
            return done();
          });
        });

        return describe('positioning', function() {

          beforeEach(function() {
            this.$link = $fixture('span').text('button label');
            return this.$link.css({
              position: 'absolute',
              left: '200px',
              top: '200px',
              width: '50px',
              height: '50px'
            });
          });

          beforeEach(function() {
            return this.restoreBodyHeight = e.setTemporaryStyle(document.body, {minHeight: '3000px'});
          });

          afterEach(function() {
            return this.restoreBodyHeight();
          });
            
          const distanceFromOrigin = 10;

          describe('with { position: "top" }', () => it('centers the tooltip above the given element', function(done) {
            this.linkBox = this.$link.get(0).getBoundingClientRect();
            return up.tooltip.attach(this.$link, {html: 'tooltip text', position: 'top'}).then(() => {
              const $tooltip = $('.up-tooltip');
              const tooltipBox = $tooltip.get(0).getBoundingClientRect();
              expect(tooltipBox.top).toBeAround(this.linkBox.top - tooltipBox.height - distanceFromOrigin, 1);
              expect(tooltipBox.left).toBeAround(this.linkBox.left + (0.5 * (this.linkBox.width - tooltipBox.width)), 1);
              return done();
            });
          }));

          describe('with { position: "right" }', () => it('centers the tooltip at the right side of the given element', function(done) {
            this.linkBox = this.$link.get(0).getBoundingClientRect();
            return up.tooltip.attach(this.$link, {html: 'tooltip text', position: 'right'}).then(() => {
              const $tooltip = $('.up-tooltip');
              const tooltipBox = $tooltip.get(0).getBoundingClientRect();
              expect(tooltipBox.top).toBeAround(this.linkBox.top + (0.5 * (this.linkBox.height - tooltipBox.height)), 1);
              expect(tooltipBox.left).toBeAround(this.linkBox.left + this.linkBox.width + distanceFromOrigin, 1);
              return done();
            });
          }));

          describe('with { position: "bottom" }', () => it('centers the tooltip below the given element', function(done) {
            this.linkBox = this.$link.get(0).getBoundingClientRect();
            return up.tooltip.attach(this.$link, {html: 'tooltip text', position: 'bottom'}).then(() => {
              const $tooltip = $('.up-tooltip');
              const tooltipBox = $tooltip.get(0).getBoundingClientRect();
              expect(tooltipBox.top).toBeAround(this.linkBox.top + this.linkBox.height + distanceFromOrigin, 1);
              expect(tooltipBox.left).toBeAround(this.linkBox.left + (0.5 * (this.linkBox.width - tooltipBox.width)), 1);
              return done();
            });
          }));

          return describe('with { position: "left" }', () => it('centers the tooltip at the left side of the given element', function(done) {
            this.linkBox = this.$link.get(0).getBoundingClientRect();
            return up.tooltip.attach(this.$link, {html: 'tooltip text', position: 'left'}).then(() => {
              const $tooltip = $('.up-tooltip');
              const tooltipBox = $tooltip.get(0).getBoundingClientRect();
              expect(tooltipBox.top).toBeAround(this.linkBox.top + (0.5 * (this.linkBox.height - tooltipBox.height)), 1);
              expect(tooltipBox.left).toBeAround(this.linkBox.left - tooltipBox.width - distanceFromOrigin, 1);
              return done();
            });
          }));
        });
      });

      return describe('up.tooltip.close', () => it('closes an existing tooltip'));
    });
    
    return describe('unobtrusive behavior', function() {
      
      describe('[up-tooltip]', () => it('should have tests'));

      describe('[up-tooltip-html]', () => it('should have tests'));

      return describe('when clicking on the body', function() {

        beforeEach(() => up.motion.config.enabled = false);

        it('closes the tooltip', asyncSpec(function(next) {
          const $link = $fixture('.link');
          up.tooltip.attach($link, {text: 'Tooltip text'});

          next(() => {
            expect(up.tooltip.isOpen()).toBe(true);
            return Trigger.clickSequence($('body'));
          });

          return next(() => {
            return expect(up.tooltip.isOpen()).toBe(false);
          });
        })
        );

        it('closes the tooltip when a an [up-instant] link removes its parent (and thus a click event never bubbles up to the document)', asyncSpec(function(next) {
          const $parent = $fixture('.parent');
          const $parentReplacingLink = $parent.affix('a[href="/foo"][up-target=".parent"][up-instant]');
          const $tooltipOpener = $fixture('.link');
          up.tooltip.attach($tooltipOpener, {text: 'Tooltip text'});

          next(() => {
            expect(up.tooltip.isOpen()).toBe(true);
            return Trigger.clickSequence($parentReplacingLink);
          });

          return next(() => {
            return expect(up.tooltip.isOpen()).toBe(false);
          });
        })
        );

        it('closes a tooltip when the user clicks on an [up-target] link outside the tooltip', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideLink = $fixture('a[href="/foo"][up-target=".target"]');
          const $tooltipOpener = $fixture('.link');
          up.tooltip.attach($tooltipOpener, {text: 'Tooltip text'});

          next(() => {
            expect(up.tooltip.isOpen()).toBe(true);
            return Trigger.clickSequence($outsideLink);
          });

          return next(() => {
            return expect(up.tooltip.isOpen()).toBe(false);
          });
        })
        );

        return it('closes a tooltip when the user clicks on an [up-instant] link outside the tooltip', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideLink = $fixture('a[href="/foo"][up-target=".target"][up-instant]');
          const $tooltipOpener = $fixture('.link');
          up.tooltip.attach($tooltipOpener, {text: 'Tooltip text'});

          next(() => {
            expect(up.tooltip.isOpen()).toBe(true);
            return Trigger.clickSequence($outsideLink);
          });

          return next(() => {
            return expect(up.tooltip.isOpen()).toBe(false);
          });
        })
        );
      });
    });
  });
})();