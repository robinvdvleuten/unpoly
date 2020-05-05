/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
beforeEach(() => jasmine.Ajax.addCustomParamParser({
  test(xhr) {
    return up.util.isFormData(xhr.params);
  },

  parse(params) {
    let array;
    if (up.browser.canInspectFormData()) {
      array = new up.Params(params).toArray();
    } else if (params.originalArray) {
      // In browser that don't support FormData#entries(),
      // up.Params#toArray() stores the original array with the generated
      // FormData object.
      array = params.originalArray;
    } else {
      throw "Cannot parse FormData for inspection in tests";
    }

    const obj = {};

    for (let entry of Array.from(array)) {
      if (!obj[entry.name]) { obj[entry.name] = []; }
      obj[entry.name].push(entry.value);
    }

    return obj;
  }
}));
