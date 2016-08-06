/**
 * @fileOverview hooks in to a modification of almond's source to capture info
 * about the modules that are defined and subsequently required on pages in JIRA.
 *
 * It uses the "old" AJS.EventQueue approach to recording its events, since by the time
 * the analytics client has run, several modules will have already been defined
 * (and thus lost).
 */
;(function() {
    var events = [];
    var oldFn;
    var path = (function() {
        var path = window.location.pathname;
        path = path.replace(/(projects?|issues?|browse)\/[A-Z][A-Z0-9]+\-\d+(.*|$)/ig, '$1/ISSUEKEY$2');
        path = path.replace(/(projects?|issues?|browse)\/[A-Z][A-Z0-9](\/|$)/ig, '$1/PROJECTKEY$2');
        return path;
    })();

    // Only bother doing these things if our analytics hook exists in the AMD loader.
    if (typeof require.analytics !== 'function') return;
    // ...and if the appropriate dark feature is enabled.
    var darkFeatures = document.querySelector('meta[name=ajs-enabled-dark-features]');
    darkFeatures = darkFeatures && darkFeatures.getAttribute('content') || '';
    if (!darkFeatures || darkFeatures.indexOf('amd.loader.analytics.enabled') === -1) return;

    oldFn = require.analytics;
    require.analytics = function(action, moduleName, deps) {
        var props = {
            path: path,
            moduleName: moduleName,
            deps: deps,
            afterDomReady: jQuery.isReady
        };
        events.push({
            name: 'amd.loader.'+action,
            properties: props
        });
    };

    // The AJS.EventQueue only exists if the analytics client is enabled.
    // Just wait a little bit until that code has had a chance to run.
    setTimeout(function() {
        if (AJS && typeof AJS.EventQueue !== 'undefined') {
            // Analytics is enabled.
            for (var i = 0, ii = events.length; i < ii; i++) {
                AJS.EventQueue.push(events[i]);
            }
            events = AJS.EventQueue;
        } else {
            // Analytics isn't enabled.
            // Drop all the events on the floor if analytics wasn't present.
            events.length = 0;
            require.analytics = oldFn;
        }
    }, 5000);
})();
