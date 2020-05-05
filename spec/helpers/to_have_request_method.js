/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveRequestMethod(util, customEqualityTesters) {
      return {
        compare(request, expectedMethod) {
          let wrappedMethod, wrappedMethodMatches;
          const realMethodMatches = (request.method === expectedMethod);
          const formData = request.data();
          if (u.isFormData(formData)) {
            wrappedMethod = formData.get('_method');
            wrappedMethodMatches = (wrappedMethod === expectedMethod);
          } else {
            wrappedMethod = formData['_method'];
            wrappedMethodMatches = util.equals(wrappedMethod, [expectedMethod], customEqualityTesters);
          }
          return {pass: realMethodMatches || wrappedMethodMatches};
        }
      };
    }
  }));
})();
