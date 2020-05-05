/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
beforeEach(() => jasmine.Ajax.install());

afterEach(done => up.util.task(function() {
  jasmine.Ajax.uninstall();
  return done();
}));

