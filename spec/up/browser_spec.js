/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.browser', () => describe('JavaScript functions', function() {

    describe('up.browser.navigate', function() {

      afterEach(() => // We're preventing the form to be submitted during tests,
      // so we need to remove it manually after each example.
      $('form.up-page-loader').remove());

      describe("for GET requests", function() {

        it("creates a GET form, adds all { params } as hidden fields and submits the form", function() {
          const submitForm = spyOn(up.browser, 'submitForm');
          up.browser.navigate('/foo', {method: 'GET', params: { param1: 'param1 value', param2: 'param2 value' }});
          expect(submitForm).toHaveBeenCalled();

          const $form = $('form.up-page-loader');

          expect($form).toBeAttached();
          // GET forms cannot have an URL with a query section in their [action] attribute.
          // The query section would be overridden by the serialized input values on submission.
          expect($form.attr('action')).toMatchUrl('/foo');

          expect($form.find('input[name="param1"][value="param1 value"]')).toBeAttached();
          return expect($form.find('input[name="param2"][value="param2 value"]')).toBeAttached();
        });

        return it('merges params from the given URL and the { params } option', function() {
          const submitForm = spyOn(up.browser, 'submitForm');
          up.browser.navigate('/foo?param1=param1%20value', {method: 'GET', params: { param2: 'param2 value' }});
          expect(submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          expect($form).toBeAttached();
          // GET forms cannot have an URL with a query section in their [action] attribute.
          // The query section would be overridden by the serialized input values on submission.
          expect($form.attr('action')).toMatchUrl('/foo');
          expect($form.find('input[name="param1"][value="param1 value"]')).toBeAttached();
          return expect($form.find('input[name="param2"][value="param2 value"]')).toBeAttached();
        });
      });

      describe("for POST requests", function() {

        it("creates a POST form, adds all { params } params as hidden fields and submits the form", function() {
          const submitForm = spyOn(up.browser, 'submitForm');
          up.browser.navigate('/foo', {method: 'POST', params: { param1: 'param1 value', param2: 'param2 value' }});
          expect(submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          expect($form).toBeAttached();
          expect($form.attr('action')).toMatchUrl('/foo');
          expect($form.attr('method')).toEqual('POST');
          expect($form.find('input[name="param1"][value="param1 value"]')).toBeAttached();
          return expect($form.find('input[name="param2"][value="param2 value"]')).toBeAttached();
        });

        return it('merges params from the given URL and the { params } option', function() {
          const submitForm = spyOn(up.browser, 'submitForm');
          up.browser.navigate('/foo?param1=param1%20value', {method: 'POST', params: { param2: 'param2 value' }});
          expect(submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          expect($form).toBeAttached();
          expect($form.attr('action')).toMatchUrl('/foo');
          expect($form.attr('method')).toEqual('POST');
          expect($form.find('input[name="param1"][value="param1 value"]')).toBeAttached();
          return expect($form.find('input[name="param2"][value="param2 value"]')).toBeAttached();
        });
      });

      u.each(['PUT', 'PATCH', 'DELETE'], method => describe(`for ${method} requests`, () => it("uses a POST form and sends the actual method as a { _method } param", function() {
        const submitForm = spyOn(up.browser, 'submitForm');
        up.browser.navigate('/foo', {method});
        expect(submitForm).toHaveBeenCalled();
        const $form = $('form.up-page-loader');
        expect($form).toBeAttached();
        expect($form.attr('method')).toEqual('POST');
        return expect($form.find('input[name="_method"]').val()).toEqual(method);
      })));

      return describe('CSRF', function() {

        beforeEach(function() {
          up.protocol.config.csrfToken = () => 'csrf-token';
          up.protocol.config.csrfParam = () => 'csrf-param';
          return this.submitForm = spyOn(up.browser, 'submitForm');
        });

        it('submits an CSRF token as another hidden field', function() {
          up.browser.navigate('/foo', {method: 'post'});
          expect(this.submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          const $tokenInput = $form.find('input[name="csrf-param"]');
          expect($tokenInput).toBeAttached();
          return expect($tokenInput.val()).toEqual('csrf-token');
        });

        it('does not add a CSRF token if there is none', function() {
          up.protocol.config.csrfToken = () => '';
          up.browser.navigate('/foo', {method: 'post'});
          expect(this.submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          const $tokenInput = $form.find('input[name="csrf-param"]');
          return expect($tokenInput).not.toBeAttached();
        });

        it('does not add a CSRF token for GET requests', function() {
          up.browser.navigate('/foo', {method: 'get'});
          expect(this.submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          const $tokenInput = $form.find('input[name="csrf-param"]');
          return expect($tokenInput).not.toBeAttached();
        });

        return it('does not add a CSRF token when loading content from another domain', function() {
          up.browser.navigate('http://other-domain.tld/foo', {method: 'get'});
          expect(this.submitForm).toHaveBeenCalled();
          const $form = $('form.up-page-loader');
          const $tokenInput = $form.find('input[name="csrf-param"]');
          return expect($tokenInput).not.toBeAttached();
        });
      });
    });

    return describe('up.browser.whenConfirmed', function() {

      it('shows a confirmation dialog with the given message and fulfills when the user presses OK', function(done) {
        spyOn(window, 'confirm').and.returnValue(true);
        const promise = up.browser.whenConfirmed({confirm: 'Do action?'});
        return promiseState(promise).then(function(result) {
          expect(window.confirm).toHaveBeenCalledWith('Do action?');
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });

      it('emits the event and rejects the returned promise when any listener calls event.preventDefault()', function(done) {
        spyOn(window, 'confirm').and.returnValue(false);
        const promise = up.browser.whenConfirmed({confirm: 'Do action?'});
        return promiseState(promise).then(function(result) {
          expect(window.confirm).toHaveBeenCalledWith('Do action?');
          expect(result.state).toEqual('rejected');
          return done();
        });
      });

      it('does now show a conformation dialog and fulfills if no { confirm } option is given', function(done) {
        spyOn(window, 'confirm');
        const promise = up.browser.whenConfirmed({});
        return promiseState(promise).then(function(result) {
          expect(window.confirm).not.toHaveBeenCalled();
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });

      return it("does now show a conformation dialog and fulfills if a { confirm } option is given but we're also preloading", function(done) {
        spyOn(window, 'confirm');
        const promise = up.browser.whenConfirmed({confirm: 'Do action?', preload: true});
        return promiseState(promise).then(function(result) {
          expect(window.confirm).not.toHaveBeenCalled();
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });
    });
  }));
})();