/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  const showVersions = () => $('.jasmine-version').text(`\
  jQuery ${$.fn.jquery}
  Jasmine ${jasmine.version}\
  `
  );

  $(() => // Give Jasmine time to initialize
  setTimeout(showVersions, 0));
})();
 