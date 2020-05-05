/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  this.AgentDetector = (function() {

    const match = regexp => navigator.userAgent.match(regexp);

    const isIE = () => match(/\bTrident\b/);

    const isEdge = () => match(/\bEdge\b/);

    const isSafari = () => match(/\bSafari\b/) && !match(/\bChrome\b/);

    return {
      isIE,
      isEdge,
      isSafari
    };
  })();
})();