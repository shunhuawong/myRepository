/**
 * @fileOverview
 * The {@link AJS.namespace} function and all AMD modules in this file are deprecated and not to be used.
 * Please create AMD modules for your code.
 * Read [JIRA's JavaScript Documentation]{@link https://extranet.atlassian.com/display/JIRADEV/JIRA+JavaScript+Documentation} for more.
 *
 * The code here exists to support defining JIRA's legacy globals such that they can be
 * deprecated and removed in favour of AMD modules. The 'jira/legacy' AMD modules exist to support testing.
 *
 * I am deliberately avoiding use of other AMD modules here to do things like dark feature checks,
 * because doing so would create a synchronous circular dependency on those modules (since they use
 * AJS.namespace to put themselves in the global namespace).
 *
 * To reiterate, these AMD modules ONLY exist for testing. DO NOT ADD DEPENDENCIES TO OR require() THESE MODULES!!!
 *
 * See [INC-71]{@link https://jdog.jira-dev.com/browse/INC-71} for more.
 */

/**
 * @module
 * @ignore
 * @note
 * I am deliberately avoiding use of other AMD modules here to do things like dark feature checks,
 * because doing so would create a synchronous circular dependency on those modules (since they use
 * AJS.namespace to put themselves in the global namespace).
 */
define('jira/legacy/config', function() {
    // Are we in dev mode?
    var isDevMode = document.querySelector('meta[name=ajs-dev-mode]');
    isDevMode = isDevMode && 'true' === isDevMode.getAttribute('content');
    // Check if some dark features are on or not.
    var darkFeatures = document.querySelector('meta[name=ajs-enabled-dark-features]');
    darkFeatures = darkFeatures && darkFeatures.getAttribute('content') || '';
    function isEnabled(key) {
        return darkFeatures && darkFeatures.indexOf(key) !== -1;
    }

    var noGlobals = isEnabled('amd.loader.noglobals');
    var logDeprecationNotice = isDevMode || noGlobals || isEnabled('amd.loader.globals.deprecation.warning');

    var hasDefineProperty = (function () {
        try {
            return Object.defineProperty && Object.defineProperty({}, 'x', {get: function () {return true;}}).x === true;
        }
        catch (e) { }
        return false;
    })();

    return {
        hasDefineProperty: hasDefineProperty,
        logDeprecationNotice: logDeprecationNotice,
        noGlobals: noGlobals
    };
});

/**
 * @module
 * @ignore
 */
define('jira/legacy/logger', function() {
    /**
     * An array of all arguments passed to the logging function
     * that we are yet to output to the developer console.
     * @type {Array<Array>}
     */
    var messages = [];
    var nextTick;

    function logMessages() {
        var i = 0;
        var ii = messages.length;
        console && console.groupCollapsed && console.groupCollapsed("Global object deprecations (" + ii + ")");
        for (; i < ii; i++) {
            AJS.warn.apply(undefined, messages[i]);
        }
        console && console.groupEnd && console.groupEnd();
        messages.length = 0;
    }

    return function() {
        messages.push(Array.prototype.slice.apply(arguments));
        if (nextTick) {
            clearTimeout(nextTick);
        }
        nextTick = setTimeout(function() {
            logMessages();
            nextTick = undefined;
        }, 200);
    };
});

/**
 * @module
 * @ignore
 */
define('jira/legacy/deprecator', function() {
    return AJS.deprecate;
});

/**
 * @module
 * @ignore
 */
define('jira/legacy/namespace', [
    'jira/legacy/config',
    'jira/legacy/logger',
    'jira/legacy/deprecator'
], function(
    config,
    log,
    deprecator
) {
    return function internalLegacyNamespacing(namespace, context, value) {
        var logMessage, names;
        if (config.logDeprecationNotice) {
            // Output an appropriate message based on what the function will end up doing.
            if (config.noGlobals) {
                logMessage = 'GONE: The global object ' + namespace + ' was not created!';
            } else {
                logMessage = 'DEPRECATED: The global object ' + namespace + ' is deprecated.';
            }
            // Check if there's enough info to output a message suggesting the more correct alternative
            if (typeof value === 'object' || typeof value === 'function') {
                if (value.__amdModuleName) {
                    logMessage += ' Please use require(["' + value.__amdModuleName + '"]) instead.';
                    delete value.__amdModuleName;
                }
            }
        }
        if (config.noGlobals) {
            log(logMessage);
            return;
        }

        // Calculate and output the global.

        names = namespace.split('.');
        context = context || window;
        for (var i = 0, n = names.length - 1; i < n; i++) {
            var x = context[names[i]];
            context = (x != null) ? x : context[names[i]] = {};
        }
        (function(val) {
            if (config.hasDefineProperty && config.logDeprecationNotice) {
                Object.defineProperty(context, names[i], {
                    configurable: true,
                    get: function() {
                        var trace = "";
                        if (deprecator && deprecator.__getDeprecatedLocation) {
                            trace = deprecator.__getDeprecatedLocation(0);
                        }
                        if (trace.indexOf("internalLegacyNamespacing") === -1) {
                            if (trace && trace.indexOf("AJS.namespace") === -1) {
                                log(logMessage, "\n"+trace);
                            } else {
                                log(logMessage);
                            }
                        }
                        return val;
                    },
                    set: function(newVal) {
                        val = newVal;
                    }
                });
            } else {
                if (config.logDeprecationNotice) {
                    log(logMessage);
                }
                context[names[i]] = val;
            }
        })(value || context[names[i]] || {});

        return context[names[i]];
    };
});

// INC-71 - In order for AJS.namespace to continue working... we need to be evil and use a top-level synchronous require

/**
 * Get/set the value at a compound namespace, gracefully adding values where missing.
 * @param {string} namespace
 * @param {Object} [context=window]
 * @param {Object} [value={}]
 * @deprecated please create AMD modules in the appropriate place in the /webapp/static/ folder!
 * Read [JIRA's JavaScript Documentation]{@link https://extranet.atlassian.com/display/JIRADEV/JIRA+JavaScript+Documentation} for more.
 */
AJS.namespace = require('jira/legacy/namespace');

/**
 * @deprecated
 * @ignore
 */
AJS.namespace('jQuery.namespace', null, function(namespace) { AJS.namespace(namespace); });
