/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.ScrollMotion', function() {

    beforeEach(function() {
      this.$viewport = $fixture('.viewport').css({
        height: '100px',
        overflowY: 'scroll'
      });

      return this.$content = this.$viewport.affix('.content').css({
        height: '10000px'});
    });

    describe('constructor', () => it('does not start scrolling', function() {
      const motion = new up.ScrollMotion(this.$viewport[0], 530);
      return expect(this.$viewport.scrollTop()).toEqual(0);
    }));

    describe('#start()', function() {

      describe('(without { behavior } option)', () => it('abruptly scrolls the given element to the given y-position', function() {
        const motion = new up.ScrollMotion(this.$viewport[0], 530);

        motion.start();

        return expect(this.$viewport.scrollTop()).toEqual(530);
      }));

      return describe('(with { behavior: "scroll" } option)', function() {

        it('animates the scrolling to the given y-position', asyncSpec(function(next) {
          const motion = new up.ScrollMotion(this.$viewport[0], 2050, { behavior: 'smooth' });

          const scrollDone = motion.start();

          next.after(100, () => {
            expect(this.$viewport.scrollTop()).toBeAround(1, 500);

            return next.await(scrollDone);
          });

          return next(() => {
            return expect(this.$viewport.scrollTop());
          });
        })
        );

        return it("aborts the scrolling animation if the user or another script changes the viewport's scrollTop during the animation");
      });
    });

    return describe('#finish()', () => it('abruptly finishes the scrolling animation by setting the target y-position'));
  });
})();
