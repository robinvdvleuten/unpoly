/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  window.Trigger = (function() {

    const mouseover = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mouseover', options);
      return dispatch($element, event);
    };

    const mouseenter = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mouseenter', options);
      return dispatch($element, event);
    };

    const mousedown = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mousedown', options);
      return dispatch($element, event);
    };

    const mouseout = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mouseout', options);
      return dispatch($element, event);
    };

    const mouseleave = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mouseleave', options);
      return dispatch($element, event);
    };

    const mouseup = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('mouseup', options);
      return dispatch($element, event);
    };

    const click = function(element, options) {
      const $element = $(element);
      const event = createMouseEvent('click', options);
      return dispatch($element, event);
    };

    const focus = function(element, options) {
      const $element = $(element);
      return $element.focus();
    };

    const submit = function(form, options) {
      form = e.get(form);
      options = u.options(options, {
        cancelable: true,
        bubbles: true
      }
      );
      const event = createEvent('submit', options);
      return form.dispatchEvent(event);
    };

    const change = function(field, options) {
      field = e.get(field);
      options = u.options(options, {
        cancelable: false,
        bubbles: true
      }
      );
      const event = createEvent('change', options);
      return field.dispatchEvent(event);
    };

    const input = function(field, options) {
      field = e.get(field);
      options = u.options(options, {
        cancelable: false,
        bubbles: true
      }
      );
      const event = createEvent('input', options);
      return field.dispatchEvent(event);
    };

    const escapeSequence = function(element, options) {
      options = u.options(options,
        {key: 'Escape'}
      );
      return (() => {
        const result = [];
        for (let type of ['keydown', 'keypress', 'keyup']) {
          const event = createKeyboardEvent(type, options);
          result.push(element.dispatchEvent(event));
        }
        return result;
      })();
    };

    const clickSequence = function(element, options) {
      const $element = $(element);
      mouseover($element, options);
      mousedown($element, options);
      focus($element, options);
      mouseup($element, options);
      return click($element, options);
    };

    const hoverSequence = function(element, options) {
      const $element = $(element);
      mouseover($element, options);
      return mouseenter($element, options);
    };

    const unhoverSequence = function(element, options) {
      const $element = $(element);
      mouseout($element, options);
      return mouseleave($element, options);
    };

    // Can't use the new Event constructor in IE11 because computer.
    // http://www.codeproject.com/Tips/893254/JavaScript-Triggering-Event-Manually-in-Internet-E
    var createEvent = function(type, options) {
      options = u.options(options, {
        cancelable: true,
        bubbles: true
      }
      );
      const event = document.createEvent('Event');
      event.initEvent(type, options.bubbles, options.cancelable);
      return event;
    };

    // Can't use the new MouseEvent constructor in IE11 because computer.
    // http://www.codeproject.com/Tips/893254/JavaScript-Triggering-Event-Manually-in-Internet-E
    var createMouseEvent = function(type, options) {
      options = u.options(options, {
        view: window,
        cancelable: true,
        bubbles: true,
        detail: 0,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: null
      }
      );
      const event = document.createEvent('MouseEvent');
      event.initMouseEvent(type,
        options.bubbles,
        options.cancelable,
        options.view,
        options.detail,
        options.screenX,
        options.screenY,
        options.clientX,
        options.clientY,
        options.ctrlKey,
        options.altKey,
        options.shiftKey,
        options.metaKey,
        options.button,
        options.relatedTarget
      );
      return event;
    };

    var createKeyboardEvent = function(type, options) {
      let event;
      options = u.options(options, {
        cancelable: true,
        bubbles: true,
        view: window,
        key: null
      }
      );

      if (canEventConstructors()) {
        event = new KeyboardEvent(type, options);
      } else {
        event = document.createEvent('KeyboardEvent');
        // The argument of initKeyboardEvent differs wildly between browsers.
        // In IE 11 it is initKeyboardEvent(type, canBubble, cancelable, view, key, location, modifierList, repeat, locale).
        event.initKeyboardEvent(type,
          options.bubbles,
          options.cancelable,
          options.view,
          options.key,
          null,
          null,
          null,
          null
        );
      }

      return event;
    };

    var canEventConstructors = () => typeof window.Event === "function";

    var dispatch = function(element, event) {
      element = e.get(element);
      return element.dispatchEvent(event);
    };

    return {
      mouseover,
      mouseenter,
      mousedown,
      mouseup,
      mouseout,
      mouseleave,
      click,
      clickSequence,
      hoverSequence,
      unhoverSequence,
      escapeSequence,
      submit,
      change,
      input,
      createEvent,
      createMouseEvent,
      createKeyboardEvent
    };

  })();
})();