/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;

  beforeEach(() => jasmine.addMatchers({
    toMatchList(util, customEqualityTesters) {
      return {
        compare(actualList, expectedList) {
          if (actualList) { actualList = u.toArray(actualList); }
          if (expectedList) { expectedList = u.toArray(expectedList); }

          return {
            pass:
              actualList &&
                expectedList &&
                (actualList.length === expectedList.length) &&
                u.every(expectedList, elem => u.contains(actualList, elem))
          };
        }
      };
    }
  }));
})();