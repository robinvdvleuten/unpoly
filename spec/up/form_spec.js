/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.form', function() {

    describe('JavaScript functions', function() {

      describe('up.form.fields', function() {

        it('returns a list of form fields within the given element', function() {
          const form = fixture('form');
          const textField = e.affix(form, 'input[type=text]');
          const select = e.affix(form, 'select');
          const results = up.form.fields(form);
          return expect(results).toMatchList([textField, select]);
        });

        it('returns an empty list if the given element contains no form fields', function() {
          const form = fixture('form');
          const results = up.form.fields(form);
          return expect(results).toMatchList([]);
        });

        it('returns a list of the given element if the element is itself a form field', function() {
          const textArea = fixture('textarea');
          const results = up.form.fields(textArea);
          return expect(results).toMatchList([textArea]);
        });

        it('ignores fields outside the given form', function() {
          const form1 = fixture('form');
          const form1Field = e.affix(form1, 'input[type=text]');
          const form2 = fixture('form');
          const form2Field = e.affix(form2, 'input[type=text]');
          const results = up.form.fields(form1);
          return expect(results).toMatchList([form1Field]);
        });

        it("includes fields outside the form with a [form] attribute matching the given form's ID", function() {
          const form = fixture('form#form-id');
          const insideField = e.affix(form, 'input[type=text]');
          const outsideField = fixture('input[type=text][form=form-id]');
          const results = up.form.fields(form);
          return expect(results).toMatchList([insideField, outsideField]);
        });

        return it("does not return duplicate fields if a field with a matching [form] attribute is also a child of the form", function() {
          const form = fixture('form#form-id');
          const field = e.affix(form, 'input[type=text][form=form-id]');
          const results = up.form.fields(form);
          return expect(results).toMatchList([field]);
        });
      });


      describe('up.observe', function() {

        beforeEach(() => up.form.config.observeDelay = 0);

        // Actually we only need `input`, but we want to notice
        // if another script manually triggers `change` on the element.
        const changeEvents = ['input', 'change'];

        describe('when the first argument is a form field', function() {

          u.each(changeEvents, eventName => describe(`when the input receives a ${eventName} event`, function() {

            it("runs the callback if the value changed", asyncSpec(function(next) {
              const $input = $fixture('input[name="input-name"][value="old-value"]');
              const callback = jasmine.createSpy('change callback');
              up.observe($input, callback);
              $input.val('new-value');
              u.times(2, () => Trigger[eventName]($input));
              return next(() => {
                expect(callback).toHaveBeenCalledWith('new-value', 'input-name');
                return expect(callback.calls.count()).toEqual(1);
              });
            })
            );

            it("does not run the callback if the value didn't change", asyncSpec(function(next) {
              const $input = $fixture('input[name="input-name"][value="old-value"]');
              const callback = jasmine.createSpy('change callback');
              up.observe($input, callback);
              Trigger[eventName]($input);
              return next(() => {
                return expect(callback).not.toHaveBeenCalled();
              });
            })
            );

            it('debounces the callback when the { delay } option is given', asyncSpec(function(next) {
              const $input = $fixture('input[name="input-name"][value="old-value"]');
              const callback = jasmine.createSpy('change callback');
              up.observe($input, { delay: 200 }, callback);
              $input.val('new-value-1');
              Trigger[eventName]($input);

              next.after(100, () => // 100 ms after change 1: We're still waiting for the 200ms delay to expire
              expect(callback.calls.count()).toEqual(0));

              next.after(200, function() {
                // 300 ms after change 1: The 200ms delay has expired
                expect(callback.calls.count()).toEqual(1);
                expect(callback.calls.mostRecent().args[0]).toEqual('new-value-1');
                $input.val('new-value-2');
                return Trigger[eventName]($input);
              });

              next.after(80, function() {
                // 80 ms after change 2: We change again, resetting the delay
                expect(callback.calls.count()).toEqual(1);
                $input.val('new-value-3');
                return Trigger[eventName]($input);
              });

              next.after(170, () => // 250 ms after change 2, which was superseded by change 3
              // 170 ms after change 3
              expect(callback.calls.count()).toEqual(1));

              return next.after(130, function() {
                // 190 ms after change 2, which was superseded by change 3
                // 150 ms after change 3
                expect(callback.calls.count()).toEqual(2);
                return expect(callback.calls.mostRecent().args[0]).toEqual('new-value-3');
              });
            })
            );

            it('delays a callback if a previous async callback is taking long to execute', asyncSpec(function(next) {
              const $input = $fixture('input[name="input-name"][value="old-value"]');
              let callbackCount = 0;
              const callback = function() {
                callbackCount += 1;
                return up.specUtil.promiseTimer(100);
              };
              up.observe($input, { delay: 1 }, callback);
              $input.val('new-value-1');
              Trigger[eventName]($input);

              next.after(30, function() {
                // Callback has been called and takes 100 ms to complete
                expect(callbackCount).toEqual(1);
                $input.val('new-value-2');
                return Trigger[eventName]($input);
              });

              next.after(30, () => // Second callback is triggerd, but waits for first callback to complete
              expect(callbackCount).toEqual(1));

              return next.after(90, () => // After 150 ms the first callback should be finished and the queued 2nd callback has executed
              expect(callbackCount).toEqual(2));
            })
            );

            return it('only runs the last callback when a previous long-running callback has been delaying multiple callbacks', asyncSpec(function(next) {
              const $input = $fixture('input[name="input-name"][value="old-value"]');

              const callbackArgs = [];
              const callback = function(value, field) {
                callbackArgs.push(value);
                return up.specUtil.promiseTimer(100);
              };

              up.observe($input, { delay: 1 }, callback);
              $input.val('new-value-1');
              Trigger[eventName]($input);

              next.after(10, function() {
                // Callback has been called and takes 100 ms to complete
                expect(callbackArgs).toEqual(['new-value-1']);
                $input.val('new-value-2');
                return Trigger[eventName]($input);
              });

              next.after(10, function() {
                expect(callbackArgs).toEqual(['new-value-1']);
                $input.val('new-value-3');
                return Trigger[eventName]($input);
              });

              return next.after(100, () => expect(callbackArgs).toEqual(['new-value-1', 'new-value-3']));}));
        }));

          describe('when the first argument is a checkbox', function() {

            it('runs the callback when the checkbox changes its checked state', asyncSpec(function(next) {
              const $form = $fixture('form');
              const $checkbox = $form.affix('input[name="input-name"][type="checkbox"][value="checkbox-value"]');
              const callback = jasmine.createSpy('change callback');
              up.observe($checkbox, callback);
              expect($checkbox.is(':checked')).toBe(false);
              Trigger.clickSequence($checkbox);

              next(() => {
                expect($checkbox.is(':checked')).toBe(true);
                expect(callback.calls.count()).toEqual(1);
                return Trigger.clickSequence($checkbox);
              });

              return next(() => {
                expect($checkbox.is(':checked')).toBe(false);
                return expect(callback.calls.count()).toEqual(2);
              });
            })
            );

            return it('runs the callback when the checkbox is toggled by clicking its label', asyncSpec(function(next) {
              const $form = $fixture('form');
              const $checkbox = $form.affix('input#tick[name="input-name"][type="checkbox"][value="checkbox-value"]');
              const $label = $form.affix('label[for="tick"]').text('tick label');
              const callback = jasmine.createSpy('change callback');
              up.observe($checkbox, callback);
              expect($checkbox.is(':checked')).toBe(false);
              Trigger.clickSequence($label);

              next(() => {
                expect($checkbox.is(':checked')).toBe(true);
                expect(callback.calls.count()).toEqual(1);
                return Trigger.clickSequence($label);
              });

              return next(() => {
                expect($checkbox.is(':checked')).toBe(false);
                return expect(callback.calls.count()).toEqual(2);
              });
            })
            );
          });

          return describe('when the first argument is a radio button group', function() {

            it('runs the callback when the group changes its selection', asyncSpec(function(next) {
              const $form = $fixture('form');
              const $radio1 = $form.affix('input[type="radio"][name="group"][value="1"]');
              const $radio2 = $form.affix('input[type="radio"][name="group"][value="2"]');
              const $group = $radio1.add($radio2);
              const callback = jasmine.createSpy('change callback');
              up.observe($group, callback);
              expect($radio1.is(':checked')).toBe(false);

              Trigger.clickSequence($radio1);

              next(() => {
                expect($radio1.is(':checked')).toBe(true);
                expect(callback.calls.count()).toEqual(1);
                // Trigger.clickSequence($radio2)
                $radio1[0].checked = false;
                $radio2[0].checked = true;
                return Trigger.change($radio2);
              });

              return next(() => {
                expect($radio1.is(':checked')).toBe(false);
                return expect(callback.calls.count()).toEqual(2);
              });
            })
            );

            it("runs the callbacks when a radio button is selected or deselected by clicking a label in the group", asyncSpec(function(next) {
              const $form = $fixture('form');
              const $radio1 = $form.affix('input#radio1[type="radio"][name="group"][value="1"]');
              const $radio1Label = $form.affix('label[for="radio1"]').text('label 1');
              const $radio2 = $form.affix('input#radio2[type="radio"][name="group"][value="2"]');
              const $radio2Label = $form.affix('label[for="radio2"]').text('label 2');
              const $group = $radio1.add($radio2);
              const callback = jasmine.createSpy('change callback');
              up.observe($group, callback);
              expect($radio1.is(':checked')).toBe(false);
              Trigger.clickSequence($radio1Label);

              next(() => {
                expect($radio1.is(':checked')).toBe(true);
                expect(callback.calls.count()).toEqual(1);
                return Trigger.clickSequence($radio2Label);
              });

              return next(() => {
                expect($radio1.is(':checked')).toBe(false);
                return expect(callback.calls.count()).toEqual(2);
              });
            })
            );

            return it("takes the group's initial selected value into account", asyncSpec(function(next) {
              const $form = $fixture('form');
              const $radio1 = $form.affix('input[type="radio"][name="group"][value="1"][checked="checked"]');
              const $radio2 = $form.affix('input[type="radio"][name="group"][value="2"]');
              const $group = $radio1.add($radio2);
              const callback = jasmine.createSpy('change callback');
              up.observe($group, callback);
              expect($radio1.is(':checked')).toBe(true);
              expect($radio2.is(':checked')).toBe(false);
              Trigger.clickSequence($radio1);

              next(() => {
                // Since the radio button was already checked, the click doesn't do anything
                expect($radio1.is(':checked')).toBe(true);
                expect($radio2.is(':checked')).toBe(false);
                // Since the radio button was already checked, clicking it again won't trigger the callback
                expect(callback.calls.count()).toEqual(0);
                return Trigger.clickSequence($radio2);
              });

              return next(() => {
                expect($radio1.is(':checked')).toBe(false);
                expect($radio2.is(':checked')).toBe(true);
                return expect(callback.calls.count()).toEqual(1);
              });
            })
            );
          });
        });

        describe('when the first argument is a form', () => u.each(changeEvents, eventName => describe(`when any of the form's inputs receives a ${eventName} event`, function() {

          it("runs the callback if the value changed", asyncSpec(function(next) {
            const $form = $fixture('form');
            const $input = $form.affix('input[name="input-name"][value="old-value"]');
            const callback = jasmine.createSpy('change callback');
            up.observe($form, callback);
            $input.val('new-value');
            u.times(2, () => Trigger[eventName]($input));
            return next(() => {
              expect(callback).toHaveBeenCalledWith('new-value', 'input-name');
              return expect(callback.calls.count()).toEqual(1);
            });
          })
          );

          return it("does not run the callback if the value didn't change", asyncSpec(function(next) {
            const $form = $fixture('form');
            const $input = $form.affix('input[name="input-name"][value="old-value"]');
            const callback = jasmine.createSpy('change callback');
            up.observe($form, callback);
            Trigger[eventName]($input);
            return next(() => {
              return expect(callback).not.toHaveBeenCalled();
            });
          })
          );
        })));

    //        it 'runs the callback only once when a radio button group changes its selection', ->
    //          $form = $fixture('form')
    //          $radio1 = $form.affix('input[type="radio"][name="group"][value="1"][checked="checked"]')
    //          $radio2 = $form.affix('input[type="radio"][name="group"][value="2"]')
    //          callback = jasmine.createSpy('change callback')
    //          up.observe($form, callback)
    //          $radio2.get(0).click()
    //          u.task ->
    //            expect(callback.calls.count()).toEqual(1)


        return describe('with { batch: true } options', () => it('calls the callback once with all collected changes in a diff object', asyncSpec(function(next) {
          const $form = $fixture('form');
          const $input1 = $form.affix('input[name="input1"][value="input1-a"]');
          const $input2 = $form.affix('input[name="input2"][value="input2-a"]');
          const callback = jasmine.createSpy('change callback');
          up.observe($form, { batch: true }, callback);

          next(function() {
            expect(callback.calls.count()).toEqual(0);

            $input1.val('input1-b');
            Trigger.change($input1);
            $input2.val('input2-b');
            return Trigger.change($input2);
          });

          next(function() {
            expect(callback.calls.count()).toEqual(1);
            expect(callback.calls.mostRecent().args[0]).toEqual({
              'input1': 'input1-b',
              'input2': 'input2-b'
            });

            $input2.val('input2-c');
            return Trigger.change($input2);
          });

          return next(function() {
            expect(callback.calls.count()).toEqual(2);
            return expect(callback.calls.mostRecent().args[0]).toEqual({
              'input2': 'input2-c'
            });});})));
    });


      return describe('up.submit', function() {

        it('emits a preventable up:form:submit event', asyncSpec(function(next) {
          const $form = $fixture('form[action="/form-target"][up-target=".response"]');

          const listener = jasmine.createSpy('submit listener').and.callFake(event => event.preventDefault());

          $form.on('up:form:submit', listener);

          up.submit($form);

          return next(() => {
            expect(listener).toHaveBeenCalled();
            const element = listener.calls.mostRecent().args[1];
            expect(element).toEqual(element);

            // No request should be made because we prevented the event
            return expect(jasmine.Ajax.requests.count()).toEqual(0);
          });
        })
        );

        describeCapability('canPushState', function() {

          beforeEach(function() {
            up.history.config.enabled = true;
            this.$form = $fixture('form[action="/form-target"][method="put"][up-target=".response"]');
            this.$form.append('<input name="field1" value="value1">');
            this.$form.append('<input name="field2" value="value2">');
            return $fixture('.response').text('old-text');
          });

          it('submits the given form and replaces the target with the response', asyncSpec(function(next) {
            up.submit(this.$form);

            next(() => {
              expect(this.lastRequest().url).toMatchUrl('/form-target');
              expect(this.lastRequest()).toHaveRequestMethod('PUT');
              expect(this.lastRequest().data()['field1']).toEqual(['value1']);
              expect(this.lastRequest().data()['field2']).toEqual(['value2']);
              expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.response');

              return this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/redirect-target',
                  'X-Up-Method': 'GET'
                },
                responseText: `\
  <div class='before'>
    new-before
  </div>

  <div class="response">
    new-text
  </div>

  <div class='after'>
    new-after
  </div>\
  `
              });
            });

            return next(() => {
              expect(up.browser.url()).toMatchUrl('/redirect-target');
              expect('.response').toHaveText('new-text');
              // See that containers outside the form have not changed
              expect('.before').not.toHaveText('old-before');
              return expect('.after').not.toHaveText('old-after');
            });
          })
          );

          it("places the response into the form and doesn't update the browser URL if the submission returns a 5xx status code", asyncSpec(function(next) {
            up.submit(this.$form);

            next(() => {
              return this.respondWith({
                status: 500,
                contentType: 'text/html',
                responseText:
                  `\
  <div class='before'>
    new-before
  </div>

  <form>
    error-messages
  </form>

  <div class='after'>
    new-after
  </div>\
  `
              });
            });

            return next(() => {
              expect(up.browser.url()).toEqual(this.hrefBeforeExample);
              expect('.response').toHaveText('old-text');
              expect('form').toHaveText('error-messages');
              // See that containers outside the form have not changed
              expect('.before').not.toHaveText('old-before');
              expect('.after').not.toHaveText('old-after');

              if (REJECTION_EVENTS_SUPPORTED) { return expect(window).toHaveUnhandledRejections(); }
            });
          })
          );


          it('respects X-Up-Method and X-Up-Location response headers so the server can show that it redirected to a GET URL', asyncSpec(function(next) {
            up.submit(this.$form);

            next(() => {
              return this.respondWith({
                status: 200,
                contentType: 'text/html',
                responseHeaders: {
                  'X-Up-Location': '/other-path',
                  'X-Up-Method': 'GET'
                },
                responseText:
                  `\
  <div class="response">
    new-text
  </div>\
  `
              });
            });

            return next(() => {
              return expect(up.browser.url()).toMatchUrl('/other-path');
            });
          })
          );

          it('submits the form to the current URL if the form has no [action] attribute', asyncSpec(function(next) {
            const form = fixture('form');
            const hrefBeforeSubmit = location.href;

            up.submit(form);

            return next(() => {
              return expect(this.lastRequest().url).toMatchUrl(hrefBeforeSubmit);
            });
          })
          );

          describe('handling of query params in the [action] URL', function() {

            describe('for forms with GET method', () => it('discards query params from an [action] attribute (like browsers do)', asyncSpec(function(next) {
              // See design/query-params-in-form-actions/cases.html for
              // a demo of vanilla browser behavior.

              const form = fixture('form[method="GET"][action="/action?foo=value-from-action"]');
              const input1 = e.affix(form, 'input[name="foo"][value="value-from-input"]');
              const input2 = e.affix(form, 'input[name="foo"][value="other-value-from-input"]');

              up.submit(form);

              return next(() => {
                return expect(this.lastRequest().url).toMatchUrl('/action?foo=value-from-input&foo=other-value-from-input');
              });
            })
            ));

            return describe('for forms with POST method' ,() => it('keeps all query params in the URL', asyncSpec(function(next) {

              const form = fixture('form[method="POST"][action="/action?foo=value-from-action"]');
              const input1 = e.affix(form, 'input[name="foo"][value="value-from-input"]');
              const input2 = e.affix(form, 'input[name="foo"][value="other-value-from-input"]');

              up.submit(form);

              return next(() => {
                expect(this.lastRequest().url).toMatchUrl('/action?foo=value-from-action');
                return expect(this.lastRequest().data()['foo']).toEqual(['value-from-input', 'other-value-from-input']);
            });})));
        });

          describe('with { history } option', function() {

            it('uses the given URL as the new browser location if the request succeeded', asyncSpec(function(next) {
              up.submit(this.$form, {history: '/given-path'});
              next(() => this.respondWith('<div class="response">new-text</div>'));
              return next(() => expect(up.browser.url()).toMatchUrl('/given-path'));
            })
            );

            it('keeps the current browser location if the request failed', asyncSpec(function(next) {
              up.submit(this.$form, {history: '/given-path', failTarget: '.response'});
              next(() => this.respondWith('<div class="response">new-text</div>', {status: 500}));
              return next(() => expect(up.browser.url()).toEqual(this.hrefBeforeExample));
            })
            );

            return it('keeps the current browser location if the option is set to false', asyncSpec(function(next) {
              up.submit(this.$form, {history: false});
              next(() => this.respondWith('<div class="response">new-text</div>'));
              return next(() => expect(up.browser.url()).toEqual(this.hrefBeforeExample));
            })
            );
          });

          describe('revealing', function() {

            it('reaveals the target fragment if the submission succeeds', asyncSpec(function(next) {
              const $form = $fixture('form[action="/action"][up-target=".target"]');
              const $target = $fixture('.target');

              const revealStub = up.viewport.knife.mock('reveal');

              up.submit($form);

              next(() => {
                return this.respondWith('<div class="target">new text</div>');
              });

              return next(() => {
                expect(revealStub).toHaveBeenCalled();
                return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.target');
              });
            })
            );

            it('reveals the form if the submission fails', asyncSpec(function(next) {
              const $form = $fixture('form#foo-form[action="/action"][up-target=".target"]');
              const $target = $fixture('.target');

              const revealStub = up.viewport.knife.mock('reveal');

              up.submit($form);

              next(() => {
                return this.respondWith({
                  status: 500,
                  responseText: `\
  <form id="foo-form">
    Errors here
  </form>\
  `
                });
              });

              return next(() => {
                expect(revealStub).toHaveBeenCalled();
                return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('#foo-form');
              });
            })
            );


            describe('with { reveal } option', function() {

              it('allows to reveal a different selector', asyncSpec(function(next) {
                const $form = $fixture('form[action="/action"][up-target=".target"]');
                const $target = $fixture('.target');
                const $other = $fixture('.other');

                const revealStub = up.viewport.knife.mock('reveal');

                up.submit($form, {reveal: '.other'});

                next(() => {
                  return this.respondWith(`\
  <div class="target">
    new text
  </div>
  <div class="other">
    new other
  </div>\
  `
                  );
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.other');
                });
              })
              );

              it('still reveals the form for a failed submission', asyncSpec(function(next) {
                const $form = $fixture('form#foo-form[action="/action"][up-target=".target"]');
                const $target = $fixture('.target');
                const $other = $fixture('.other');

                const revealStub = up.viewport.knife.mock('reveal');

                up.submit($form, {reveal: '.other'});

                next(() => {
                  return this.respondWith({
                    status: 500,
                    responseText: `\
  <form id="foo-form">
    Errors here
  </form>\
  `
                  });
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('#foo-form');
                });
              })
              );

              return it('allows to refer to this form as "&" in the selector', asyncSpec(function(next) {
                const $form = $fixture('form#foo-form[action="/action"][up-target="#foo-form"]');

                const revealStub = up.viewport.knife.mock('reveal');

                up.submit($form, {reveal: '& .form-child'});

                next(() => {
                  return this.respondWith(`\
  <div class="target">
    new text
  </div>

  <form id="foo-form">
    <div class="form-child">other</div>
  </form>\
  `
                  );
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toEqual(e.first('#foo-form .form-child'));
                });
              })
              );
            });

            return describe('with { failReveal } option', function() {

              it('reveals the given selector for a failed submission', asyncSpec(function(next) {
                const $form = $fixture('form#foo-form[action="/action"][up-target=".target"]');
                const $target = $fixture('.target');
                const $other = $fixture('.other');

                const revealStub = up.viewport.knife.mock('reveal');

                up.submit($form, {reveal: '.other', failReveal: '.error'});

                next(() => {
                  return this.respondWith({
                    status: 500,
                    responseText: `\
  <form id="foo-form">
    <div class="error">Errors here</div>
  </form>\
  `
                  });
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.error');
                });
              })
              );

              return it('allows to refer to this form as "&" in the selector', asyncSpec(function(next) {
                const $form = $fixture('form#foo-form[action="/action"][up-target=".target"][up-fail-reveal="#foo-form .form-child"]');
                const $target = $fixture('.target');

                const revealStub = up.viewport.knife.mock('reveal');

                up.submit($form, {reveal: '& .form-child'});

                next(() => {
                  return this.respondWith({
                    status: 500,
                    responseText: `\
  <div class="target">
    new text
  </div>

  <form id="foo-form">
    <div class="form-child">other</div>
  </form>\
  `
                  });
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toEqual(e.first('#foo-form .form-child'));
                });
              })
              );
            });
          });

          return describe('in a form with file inputs', function() {

            beforeEach(function() {
              this.$form.affix('input[name="text-field"][type="text"]').val("value");
              return this.$form.affix('input[name="file-field"][type="file"]');
            });

            return it('transfers the form fields via FormData', asyncSpec(function(next) {
              up.submit(this.$form);
              return next(() => {
                const rawData = this.lastRequest().params;
                return expect(u.isFormData(rawData)).toBe(true);
              });
            })
            );
          });
        });

        return describeFallback('canPushState', () => it('falls back to a vanilla form submission', asyncSpec(function(next) {
          const $form = $fixture('form[action="/path/to"][method="put"][up-target=".response"]');
          const form = $form.get(0);
          spyOn(form, 'submit');

          up.submit($form);

          return next(() => expect(form.submit).toHaveBeenCalled());
        })
        ));
      });
    });

    return describe('unobtrusive behavior', function() {

      describe('form[up-target]', function() {

        it('submits the form with AJAX and replaces the [up-target] selector', asyncSpec(function(next) {
          up.history.config.enabled = true;

          $fixture('.response').text('old text');

          const $form = $fixture('form[action="/form-target"][method="put"][up-target=".response"]');
          $form.append('<input name="field1" value="value1">');
          $form.append('<input name="field2" value="value2">');
          const $submitButton = $form.affix('input[type="submit"][name="submit-button"][value="submit-button-value"]');
          up.hello($form);

          Trigger.clickSequence($submitButton);

          next(() => {
            const params = this.lastRequest().data();
            expect(params['field1']).toEqual(['value1']);
            return expect(params['field2']).toEqual(['value2']);
          });

          next(() => {
            return this.respondWith(`\
  <div class="response">
    new text
  </div>\
  `
            );
          });

          return next(() => {
            return expect('.response').toHaveText('new text');
          });
        })
        );

        it('allows to refer to this form as "&" in the target selector', asyncSpec(function(next) {
          const $form = $fixture('form.my-form[action="/form-target"][up-target="&"]').text('old form text');
          const $submitButton = $form.affix('input[type="submit"]');
          up.hello($form);

          Trigger.clickSequence($submitButton);

          next(() => {
            return this.respondWith(`\
  <form class="my-form">
    new form text
  </form>\
  `
            );
          });

          return next(() => {
            return expect('.my-form').toHaveText('new form text');
          });
        })
        );

        describe('when the server responds with an error code', function() {

          it('replaces the form instead of the [up-target] selector', asyncSpec(function(next) {
            up.history.config.enabled = true;

            $fixture('.response').text('old text');

            const $form = $fixture('form.test-form[action="/form-target"][method="put"][up-target=".response"]');
            $form.append('<input name="field1" value="value1">');
            $form.append('<input name="field2" value="value2">');
            const $submitButton = $form.affix('input[type="submit"][name="submit-button"][value="submit-button-value"]');
            up.hello($form);

            Trigger.clickSequence($submitButton);

            next(() => {
              const params = this.lastRequest().data();
              expect(params['field1']).toEqual(['value1']);
              return expect(params['field2']).toEqual(['value2']);
            });

            next(() => {
              return this.respondWith({
                status: 500,
                responseText: `\
  <form class="test-form">
    validation errors
  </form>\
  `
              });
            });

            return next(() => {
              expect('.response').toHaveText('old text');
              expect('form.test-form').toHaveText('validation errors');

              // Since there isn't anyone who could handle the rejection inside
              // the event handler, our handler mutes the rejection.
              if (REJECTION_EVENTS_SUPPORTED) { return expect(window).not.toHaveUnhandledRejections(); }
            });
          })
          );

          it('updates a given selector when an [up-fail-target] is given', asyncSpec(function(next) {
            const $form = $fixture('form.my-form[action="/path"][up-target=".target"][up-fail-target=".errors"]').text('old form text');
            let $errors = $fixture('.target').text('old target text');
            $errors = $fixture('.errors').text('old errors text');

            const $submitButton = $form.affix('input[type="submit"]');
            up.hello($form);

            Trigger.clickSequence($submitButton);

            next(() => {
              return this.respondWith({
                status: 500,
                responseText: `\
  <form class="my-form">
    new form text
  </form>

  <div class="errors">
    new errors text
  </div>\
  `
              });
            });

            return next(() => {
              expect('.my-form').toHaveText('old form text');
              expect('.target').toHaveText('old target text');
              return expect('.errors').toHaveText('new errors text');
            });
          })
          );

          return it('allows to refer to this form as "&" in the [up-fail-target] selector', asyncSpec(function(next) {
            const $form = $fixture('form.my-form[action="/form-target"][up-target=".target"][up-fail-target="&"]').text('old form text');
            const $target = $fixture('.target').text('old target text');

            const $submitButton = $form.affix('input[type="submit"]');
            up.hello($form);

            Trigger.clickSequence($submitButton);

            next(() => {
              return this.respondWith({
                status: 500,
                responseText: `\
  <form class="my-form">
    new form text
  </form>\
  `
              });
            });

            return next(() => {
              expect('.target').toHaveText('old target text');
              return expect('.my-form').toHaveText('new form text');
            });
          })
          );
        });

        return describe('submit buttons', function() {

          it('includes the clicked submit button in the params', asyncSpec(function(next) {
            const $form = $fixture('form[action="/action"][up-target=".target"]');
            const $textField = $form.affix('input[type="text"][name="text-field"][value="text-field-value"]');
            const $submitButton = $form.affix('input[type="submit"][name="submit-button"][value="submit-button-value"]');
            up.hello($form);
            Trigger.clickSequence($submitButton);

            return next(() => {
              const params = this.lastRequest().data();
              expect(params['text-field']).toEqual(['text-field-value']);
              return expect(params['submit-button']).toEqual(['submit-button-value']);
            });
          })
          );

          it('excludes an unused submit button in the params', asyncSpec(function(next) {
            const $form = $fixture('form[action="/action"][up-target=".target"]');
            const $textField = $form.affix('input[type="text"][name="text-field"][value="text-field-value"]');
            const $submitButton1 = $form.affix('input[type="submit"][name="submit-button-1"][value="submit-button-1-value"]');
            const $submitButton2 = $form.affix('input[type="submit"][name="submit-button-2"][value="submit-button-2-value"]');
            up.hello($form);
            Trigger.clickSequence($submitButton2);

            return next(() => {
              const params = this.lastRequest().data();
              expect(params['text-field']).toEqual(['text-field-value']);
              expect(params['submit-button-1']).toBeUndefined();
              return expect(params['submit-button-2']).toEqual(['submit-button-2-value']);
            });
          })
          );

          it('includes the first submit button if the form was submitted with enter', asyncSpec(function(next) {
            const $form = $fixture('form[action="/action"][up-target=".target"]');
            const $textField = $form.affix('input[type="text"][name="text-field"][value="text-field-value"]');
            const $submitButton1 = $form.affix('input[type="submit"][name="submit-button-1"][value="submit-button-1-value"]');
            const $submitButton2 = $form.affix('input[type="submit"][name="submit-button-2"][value="submit-button-2-value"]');
            up.hello($form);

            Trigger.submit($form); // sorry

            return next(() => {
              const params = this.lastRequest().data();
              expect(params['text-field']).toEqual(['text-field-value']);
              expect(params['submit-button-1']).toEqual(['submit-button-1-value']);
              return expect(params['submit-button-2']).toBeUndefined();
            });
          })
          );

          return it('does not explode if the form has no submit buttons', asyncSpec(function(next) {
            const $form = $fixture('form[action="/action"][up-target=".target"]');
            const $textField = $form.affix('input[type="text"][name="text-field"][value="text-field-value"]');
            up.hello($form);

            Trigger.submit($form); // sorry

            return next(() => {
              const params = this.lastRequest().data();
              const keys = Object.keys(params);
              return expect(keys).toEqual(['text-field']);
            });
          })
          );
        });
      });

      describe('input[up-autosubmit]', function() {

        it('submits the form when a change is observed in the given form field', asyncSpec(function(next) {
          const $form = $fixture('form');
          const $field = $form.affix('input[up-autosubmit][name="input-name"][value="old-value"]');
          up.hello($field);
          const submitSpy = up.form.knife.mock('submit').and.returnValue(u.unresolvablePromise());
          $field.val('new-value');
          Trigger.change($field);
          return next(() => expect(submitSpy).toHaveBeenCalled());
        })
        );

        return it('submits the form when a change is observed on a container for a radio button group', asyncSpec(function(next) {
          const form = fixture('form');
          const group = e.affix(form, '.group[up-autosubmit][up-delay=0]');
          const radio1 = e.affix(group, 'input[type=radio][name=foo][value=1]');
          const radio2 = e.affix(group, 'input[type=radio][name=foo][value=2]');
          up.hello(form);
          const submitSpy = up.form.knife.mock('submit').and.returnValue(Promise.reject());
          Trigger.clickSequence(radio1);
          next(() => {
            expect(submitSpy.calls.count()).toBe(1);
            return Trigger.clickSequence(radio2);
          });
          next(() => {
            expect(submitSpy.calls.count()).toBe(2);
            return Trigger.clickSequence(radio1);
          });
          return next(() => {
            return expect(submitSpy.calls.count()).toBe(3);
          });
        })
        );
      });

      describe('form[up-autosubmit]', function() {

        it('submits the form when a change is observed in any of its fields', asyncSpec(function(next) {
          const $form = $fixture('form[up-autosubmit]');
          const $field = $form.affix('input[name="input-name"][value="old-value"]');
          up.hello($form);
          const submitSpy = up.form.knife.mock('submit').and.returnValue(u.unresolvablePromise());
          $field.val('new-value');
          Trigger.change($field);
          return next(() => expect(submitSpy).toHaveBeenCalled());
        })
        );

        return describe('with [up-delay] modifier', () => it('debounces the form submission', asyncSpec(function(next) {
          const $form = $fixture('form[up-autosubmit][up-delay="50"]');
          const $field = $form.affix('input[name="input-name"][value="old-value"]');
          up.hello($form);
          const submitSpy = up.form.knife.mock('submit').and.returnValue(u.unresolvablePromise());
          $field.val('new-value-1');
          Trigger.change($field);
          $field.val('new-value-2');
          Trigger.change($field);

          next(() => {
            return expect(submitSpy.calls.count()).toBe(0);
          });

          return next.after(80, () => {
            return expect(submitSpy.calls.count()).toBe(1);
          });
        })
        ));
      });

      describe('input[up-observe]', function() {

        afterEach(() => window.observeCallbackSpy = undefined);

        it('runs the JavaScript code in the attribute value when a change is observed in the field', asyncSpec(function(next) {
          const $form = $fixture('form');
          window.observeCallbackSpy = jasmine.createSpy('observe callback');
          const $field = $form.affix('input[name="input-name"][value="old-value"][up-observe="window.observeCallbackSpy(value, name)"]');
          up.hello($form);
          $field.val('new-value');
          Trigger.change($field);

          return next(() => {
            return expect(window.observeCallbackSpy).toHaveBeenCalledWith('new-value', 'input-name');
          });
        })
        );

        return describe('with [up-delay] modifier', () => it('debounces the callback', asyncSpec(function(next) {
          const $form = $fixture('form');
          window.observeCallbackSpy = jasmine.createSpy('observe callback');
          const $field = $form.affix('input[name="input-name"][value="old-value"][up-observe="window.observeCallbackSpy()"][up-delay="50"]');
          up.hello($form);
          $field.val('new-value');
          Trigger.change($field);

          next(() => expect(window.observeCallbackSpy).not.toHaveBeenCalled());
          return next.after(80, () => expect(window.observeCallbackSpy).toHaveBeenCalled());
        })
        ));
      });

      describe('form[up-observe]', function() {

        afterEach(() => window.observeCallbackSpy = undefined);

        return it('runs the JavaScript code in the attribute value when a change is observed in any contained field', asyncSpec(function(next) {
          window.observeCallbackSpy = jasmine.createSpy('observe callback');
          const $form = $fixture('form[up-observe="window.observeCallbackSpy(value, name)"]');
          const $field1 = $form.affix('input[name="field1"][value="field1-old-value"]');
          const $field2 = $form.affix('input[name="field2"][value="field2-old-value"]');
          up.hello($form);
          $field1.val('field1-new-value');
          Trigger.change($field1);

          next(() => {
            expect(window.observeCallbackSpy.calls.allArgs()).toEqual([
              ['field1-new-value', 'field1']
            ]);

            $field2.val('field2-new-value');
            return Trigger.change($field2);
          });

          return next(() => {
            return expect(window.observeCallbackSpy.calls.allArgs()).toEqual([
              ['field1-new-value', 'field1'],
              ['field2-new-value', 'field2']
            ]);
        });}));
    });

      describe('input[up-validate]', function() {

        describe('when a selector is given', function() {

          it("submits the input's form with an 'X-Up-Validate' header and replaces the selector with the response", asyncSpec(function(next) {

            const $form = $fixture('form[action="/path/to"]');
            let $group = $(`\
  <div class="field-group">
    <input name="user" value="judy" up-validate=".field-group:has(&)">
  </div>\
  `).appendTo($form);

            Trigger.change($group.find('input'));

            next(() => {
              const request = this.lastRequest();
              expect(request.requestHeaders['X-Up-Validate']).toEqual('user');
              expect(request.requestHeaders['X-Up-Target']).toEqual('.field-group:has(input[name="user"])');

              return this.respondWith({
                status: 500,
                responseText: `\
  <div class="field-group has-error">
    <div class='error'>Username has already been taken</div>
    <input name="user" value="judy" up-validate=".field-group:has(&)">
  </div>\
  `
              });
            });

            return next(() => {
              $group = $('.field-group');
              expect($group.length).toBe(1);
              expect($group).toHaveClass('has-error');
              expect($group).toHaveText('Username has already been taken');

              // Since there isn't anyone who could handle the rejection inside
              // the event handler, our handler mutes the rejection.
              if (REJECTION_EVENTS_SUPPORTED) { return expect(window).not.toHaveUnhandledRejections(); }
            });
          })
          );

          return it('does not reveal the updated fragment (bugfix)', asyncSpec(function(next) {
            const revealSpy = up.viewport.knife.mock('reveal').and.returnValue(Promise.resolve());

            const $form = $fixture('form[action="/path/to"]');
            const $group = $(`\
  <div class="field-group">
    <input name="user" value="judy" up-validate=".field-group:has(&)">
  </div>\
  `).appendTo($form);
            Trigger.change($group.find('input'));

            next(() => {
              return this.respondWith(`\
  <div class="field-group has-error">
    <div class='error'>Username has already been taken</div>
    <input name="user" value="judy" up-validate=".field-group:has(&)">
  </div>\
  `
              );
            });

            return next(() => {
              return expect(revealSpy).not.toHaveBeenCalled();
            });
          })
          );
        });


        return describe('when no selector is given', () => it('automatically finds a form group around the input field and only updates that', asyncSpec(function(next) {
          const container = fixture('.container');
          container.innerHTML = `\
  <form action="/users" id="registration">

  <div up-fieldset>
    <input type="text" name="email" up-validate />
  </div>

  <div up-fieldset>
    <input type="password" name="password" up-validate />
  </div>

  </form>\
  `;
          up.hello(container);

          Trigger.change($('#registration input[name=password]'));

          next(() => {
            return this.respondWith(`\
  <form action="/users" id="registration">

  <div up-fieldset>
    Validation message
    <input type="text" name="email" up-validate />
  </div>

  <div up-fieldset>
    Validation message
    <input type="password" name="password" up-validate />
  </div>

  </form>\
  `
            );
          });

          return next(() => {
            const $labels = $('#registration [up-fieldset]');
            expect($labels[0]).not.toHaveText('Validation message');
            return expect($labels[1]).toHaveText('Validation message');
          });
        })
        ));
      });

      describe('form[up-validate]', function() {

        // it 'prints an error saying that this form is not yet supported', ->

        it('performs server-side validation for all fieldsets contained within the form', asyncSpec(function(next) {
          const container = fixture('.container');
          container.innerHTML = `\
  <form action="/users" id="registration" up-validate>

    <div up-fieldset>
      <input type="text" name="email">
    </div>

    <div up-fieldset>
      <input type="password" name="password">
    </div>

  </form>\
  `;
          up.hello(container);

          Trigger.change($('#registration input[name=password]'));

          next(() => {
            expect(jasmine.Ajax.requests.count()).toEqual(1);
            expect(this.lastRequest().requestHeaders['X-Up-Validate']).toEqual('password');
            expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('[up-fieldset]:has(input[name="password"])');


            return this.respondWith(`\
  <form action="/users" id="registration" up-validate>

    <div up-fieldset>
      Validation message
      <input type="text" name="email">
    </div>

    <div up-fieldset>
      Validation message
      <input type="password" name="password">
    </div>

  </form>\
  `
            );
          });

          return next(() => {
            const $labels = $('#registration [up-fieldset]');
            expect($labels[0]).not.toHaveText('Validation message');
            return expect($labels[1]).toHaveText('Validation message');
          });
        })
        );

        return it('only sends a single request when a radio button group changes', asyncSpec(function(next) {
          const container = fixture('.container');
          container.innerHTML = `\
  <form action="/users" id="registration" up-validate>

    <div up-fieldset>
      <input type="radio" name="foo" value="1" checked>
      <input type="radio" name="foo" value="2">
    </div>

  </form>\
  `;
          up.hello(container);

          Trigger.change($('#registration input[value="2"]'));

          return next(() => {
            return expect(jasmine.Ajax.requests.count()).toEqual(1);
          });
        })
        );
      });

      return describe('[up-switch]', function() {

        describe('on a select', function() {

          beforeEach(function() {
            this.$select = $fixture('select[name="select-name"][up-switch=".target"]');
            this.$blankOption = this.$select.affix('option').text('<Please select something>').val('');
            this.$fooOption = this.$select.affix('option[value="foo"]').text('Foo');
            this.$barOption = this.$select.affix('option[value="bar"]').text('Bar');
            return this.$bazOption = this.$select.affix('option[value="baz"]').text('Baz');
          });

          it("shows the target element iff its up-show-for attribute contains the select value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for="something bar other"]');
            up.hello(this.$select);

            next(() => {
              expect($target).toBeHidden();
              this.$select.val('bar');
              return Trigger.change(this.$select);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-hide-for attribute doesn't contain the select value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-hide-for="something bar other"]');
            up.hello(this.$select);

            next(() => {
              expect($target).toBeVisible();
              this.$select.val('bar');
              return Trigger.change(this.$select);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff it has neither up-show-for nor up-hide-for and the select value is present", asyncSpec(function(next) {
            const $target = $fixture('.target');
            up.hello(this.$select);

            next(() => {
              expect($target).toBeHidden();
              this.$select.val('bar');
              return Trigger.change(this.$select);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute contains a value ':present' and the select value is present", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":present"]');
            up.hello(this.$select);

            next(() => {
              expect($target).toBeHidden();
              this.$select.val('bar');
              return Trigger.change(this.$select);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          return it("shows the target element iff its up-show-for attribute contains a value ':blank' and the select value is blank", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":blank"]');
            up.hello(this.$select);

            next(() => {
              expect($target).toBeVisible();
              this.$select.val('bar');
              return Trigger.change(this.$select);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );
        });

        describe('on a checkbox', function() {

          beforeEach(function() {
            return this.$checkbox = $fixture('input[name="input-name"][type="checkbox"][value="1"][up-switch=".target"]');
          });

          it("shows the target element iff its up-show-for attribute is :checked and the checkbox is checked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":checked"]');
            up.hello(this.$checkbox);

            next(() => {
              expect($target).toBeHidden();
              this.$checkbox.prop('checked', true);
              return Trigger.change(this.$checkbox);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute is :unchecked and the checkbox is unchecked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":unchecked"]');
            up.hello(this.$checkbox);

            next(() => {
              expect($target).toBeVisible();
              this.$checkbox.prop('checked', true);
              return Trigger.change(this.$checkbox);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff its up-hide-for attribute is :checked and the checkbox is unchecked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-hide-for=":checked"]');
            up.hello(this.$checkbox);

            next(() => {
              expect($target).toBeVisible();
              this.$checkbox.prop('checked', true);
              return Trigger.change(this.$checkbox);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff its up-hide-for attribute is :unchecked and the checkbox is checked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-hide-for=":unchecked"]');
            up.hello(this.$checkbox);

            next(() => {
              expect($target).toBeHidden();
              this.$checkbox.prop('checked', true);
              return Trigger.change(this.$checkbox);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          return it("shows the target element iff it has neither up-show-for nor up-hide-for and the checkbox is checked", asyncSpec(function(next) {
            const $target = $fixture('.target');
            up.hello(this.$checkbox);

            next(() => {
              expect($target).toBeHidden();
              this.$checkbox.prop('checked', true);
              return Trigger.change(this.$checkbox);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );
        });

        describe('on a group of radio buttons', function() {

          beforeEach(function() {
            this.$buttons     = $fixture('.radio-buttons');
            this.$blankButton = this.$buttons.affix('input[type="radio"][name="group"][up-switch=".target"]').val('');
            this.$fooButton   = this.$buttons.affix('input[type="radio"][name="group"][up-switch=".target"]').val('foo');
            this.$barButton   = this.$buttons.affix('input[type="radio"][name="group"][up-switch=".target"]').val('bar');
            return this.$bazkButton  = this.$buttons.affix('input[type="radio"][name="group"][up-switch=".target"]').val('baz');
          });

          it("shows the target element iff its up-show-for attribute contains the selected button value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for="something bar other"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeHidden();
              this.$barButton.prop('checked', true);
              return Trigger.change(this.$barButton);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-hide-for attribute doesn't contain the selected button value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-hide-for="something bar other"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeVisible();
              this.$barButton.prop('checked', true);
              return Trigger.change(this.$barButton);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff it has neither up-show-for nor up-hide-for and the selected button value is present", asyncSpec(function(next) {
            const $target = $fixture('.target');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeHidden();
              this.$barButton.prop('checked', true);
              return Trigger.change(this.$barButton);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute contains a value ':present' and the selected button value is present", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":present"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeHidden();
              this.$blankButton.prop('checked', true);
              return Trigger.change(this.$blankButton);
            });

            next(() => {
              expect($target).toBeHidden();
              this.$barButton.prop('checked', true);
              return Trigger.change(this.$barButton);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute contains a value ':blank' and the selected button value is blank", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":blank"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeVisible();
              this.$blankButton.prop('checked', true);
              return Trigger.change(this.$blankButton);
            });

            next(() => {
              expect($target).toBeVisible();
              this.$barButton.prop('checked', true);
              return Trigger.change(this.$barButton);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute contains a value ':checked' and any button is checked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":checked"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeHidden();
              this.$blankButton.prop('checked', true);
              return Trigger.change(this.$blankButton);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          return it("shows the target element iff its up-show-for attribute contains a value ':unchecked' and no button is checked", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":unchecked"]');
            up.hello(this.$buttons);

            next(() => {
              expect($target).toBeVisible();
              this.$blankButton.prop('checked', true);
              return Trigger.change(this.$blankButton);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );
        });

        describe('on a text input', function() {

          beforeEach(function() {
            return this.$textInput = $fixture('input[name="input-name"][type="text"][up-switch=".target"]');
          });

          it("shows the target element iff its up-show-for attribute contains the input value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for="something bar other"]');
            up.hello(this.$textInput);

            next(() => {
              expect($target).toBeHidden();
              this.$textInput.val('bar');
              return Trigger.change(this.$textInput);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-hide-for attribute doesn't contain the input value", asyncSpec(function(next) {
            const $target = $fixture('.target[up-hide-for="something bar other"]');
            up.hello(this.$textInput);

            next(() => {
              expect($target).toBeVisible();
              this.$textInput.val('bar');
              return Trigger.change(this.$textInput);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );

          it("shows the target element iff it has neither up-show-for nor up-hide-for and the input value is present", asyncSpec(function(next) {
            const $target = $fixture('.target');
            up.hello(this.$textInput);

            next(() => {
              expect($target).toBeHidden();
              this.$textInput.val('bar');
              return Trigger.change(this.$textInput);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          it("shows the target element iff its up-show-for attribute contains a value ':present' and the input value is present", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":present"]');
            up.hello(this.$textInput);

            next(() => {
              expect($target).toBeHidden();
              this.$textInput.val('bar');
              return Trigger.change(this.$textInput);
            });

            return next(() => {
              return expect($target).toBeVisible();
            });
          })
          );

          return it("shows the target element iff its up-show-for attribute contains a value ':blank' and the input value is blank", asyncSpec(function(next) {
            const $target = $fixture('.target[up-show-for=":blank"]');
            up.hello(this.$textInput);

            next(() => {
              expect($target).toBeVisible();
              this.$textInput.val('bar');
              return Trigger.change(this.$textInput);
            });

            return next(() => {
              return expect($target).toBeHidden();
            });
          })
          );
        });

        return describe('when an [up-show-for] element is dynamically inserted later', function() {

          it("shows the element iff it matches the [up-switch] control's value", asyncSpec(function(next) {
            const $select = $fixture('select[name="select-name"][up-switch=".target"]');
            $select.affix('option[value="foo"]').text('Foo');
            $select.affix('option[value="bar"]').text('Bar');
            $select.val('foo');
            up.hello($select);

            next(() => {
              // New target enters the DOM after [up-switch] has been compiled
              this.$target = $fixture('.target[up-show-for="bar"]');
              return up.hello(this.$target);
            });

            next(() => {
              return expect(this.$target).toBeHidden();
            });

            return next(() => {
              // Check that the new element will notify subsequent changes
              $select.val('bar');
              Trigger.change($select);
              return expect(this.$target).toBeVisible();
            });
          })
          );

          return it("doesn't re-switch targets that were part of the original compile run", asyncSpec(function(next) {
            const $container = $fixture('.container');

            const $select = $container.affix('select[name="select-name"][up-switch=".target"]');
            $select.affix('option[value="foo"]').text('Foo');
            $select.affix('option[value="bar"]').text('Bar');
            $select.val('foo');
            const $existingTarget = $container.affix('.target.existing[up-show-for="bar"]');

            const switchTargetSpy = up.form.knife.mock('switchTarget').and.callThrough();

            up.hello($container);

            next(() => {
              // New target enters the DOM after [up-switch] has been compiled
              this.$lateTarget = $container.affix('.target.late[up-show-for="bar"]');
              return up.hello(this.$lateTarget);
            });

            return next(() => {
              expect(switchTargetSpy.calls.count()).toBe(2);
              expect(switchTargetSpy.calls.argsFor(0)[0]).toEqual($existingTarget[0]);
              return expect(switchTargetSpy.calls.argsFor(1)[0]).toEqual(this.$lateTarget[0]);
            });
          })
          );
        });
      });
    });
  });
})();