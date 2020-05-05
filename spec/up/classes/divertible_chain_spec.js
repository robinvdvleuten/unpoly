/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;

  describe('up.DivertibleChain', () => describe('#asap', () => it("cancels all unstarted tasks, waits for the current task and starts the given task", function(done) {
    const chain = new up.DivertibleChain();

    const timer1Spy = jasmine.createSpy('timer1');
    const timer1 = function() {
      timer1Spy();
      return up.specUtil.promiseTimer(100); // delay execution of next timer
    };

    const timer2Spy = jasmine.createSpy('timer2');
    const timer2 = function() {
      timer2Spy();
      return up.specUtil.promiseTimer(100); // delay execution of next timer
    };

    const timer3Spy = jasmine.createSpy('timer3');
    const timer3 = function() {
      timer3Spy();
      return up.specUtil.promiseTimer(100); // delay execution of next timer
    };

    const timer4Spy = jasmine.createSpy('timer4');
    const timer4 = function() {
      timer4Spy();
      return up.specUtil.promiseTimer(100); // delay execution of next timer
    };

    chain.asap(timer1);
    return u.task(function() {
      expect(timer1Spy).toHaveBeenCalled();
      chain.asap(timer2);
      return u.task(function() {
        // timer2 is still waiting for timer1 to finish
        expect(timer2Spy).not.toHaveBeenCalled();
        // Override the (2..n)th tasks. This unschedules timer2.
        chain.asap(timer3, timer4);
        return u.timer(150, function() {
          expect(timer2Spy).not.toHaveBeenCalled(); // Has been canceled
          expect(timer3Spy).toHaveBeenCalled(); // timer3 overrode timer2
          expect(timer4Spy).not.toHaveBeenCalled();
          return u.timer(150, function() {
            expect(timer4Spy).toHaveBeenCalled();
            return done();
          });
        });
      });
    });
  })));
})();