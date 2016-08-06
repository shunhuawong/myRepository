/**
 * A module that wraps all the browser+os checks
 * you'd want to do via checking the window.navigator properties.
 *
 * TODO JDEV-28436: Code is borrowed (i.e., copy-pasted) from a Bower component until CAS-751 is resolved.
 *
 * @see {@link https://stash.atlassian.com/projects/FE/repos/navigator/browse/lib/internal/util/navigator.js|Bower component}
 * @see {@link https://stash.atlassian.com/projects/STASH/repos/stash/browse/webapp/default/src/main/webapp/static/util/navigator.js|Stash's implementation}
 * @module internal/util/navigator
 */
define('internal/util/navigator', [
    'jquery',
    'underscore',
    'exports'
], function (
    $,
    _,
    exports
) {

    "use strict";

    // Avoid using this file at all costs,
    // Prefer using util/feature-detect

    var userAgent = window.navigator.userAgent;
    var platform = window.navigator.platform;

    function _isTrident (userAgent) {
        return (/\bTrident\b/).test(userAgent);
    }

    // workaround for http://stackoverflow.com/a/32102663
    var EDGE_UA_WORKAROUND = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    var EDGE_DEFAULT_VERSION = 12;

    function _isEdge (userAgent) {
        if (userAgent == EDGE_UA_WORKAROUND) {
            return true;
        } else {
            return (/(Edge)\/(\d+)\.(\d+)/).test(userAgent);
        }
    }

    function _edgeVersion (userAgent) {
        if (userAgent == EDGE_UA_WORKAROUND) {
            return EDGE_DEFAULT_VERSION;
        } else {
            var match = userAgent.match(/Edge\/(\d+)/);
            return match && match[1];
        }
    }

    var isChrome = _.once(function() {
        return (/Chrome/).test(exports._getUserAgent());
    });

    /**
     * Is this browser IE?
     * @function
     */
    var isIE = _.once(function () {
        // we are detecting Edge as IE 12
        return _isTrident(userAgent) || isEdge();
    });

    var isEdge = _.once(function () {
        return _isEdge(userAgent);
    });

    var isMozilla = _.once(function () {
        // IE11+ now identifies itself as Mozilla so need to explicitly exclude IE
        return $.browser.mozilla && !isIE();
    });

    var isSafari = _.once(function () {
        return $.browser.safari && !isChrome();
    });

    var isWebkit = _.once(function () {
        return $.browser.webkit;
    });

    var majorVersion = _.once(function () {
        return parseInt($.browser.version, 10);
    });

    var isLinux = _.once(function () {
        return exports._getPlatform().indexOf('Linux') !== -1;
    });

    var isMac = _.once(function () {
        return exports._getPlatform().indexOf('Mac') !== -1;
    });

    var isWin = _.once(function () {
        return exports._getPlatform().indexOf('Win') !== -1;
    });

    exports.isChrome = isChrome;
    exports.isIE = isIE;
    exports.isEdge = isEdge;
    exports.isMozilla = isMozilla;
    exports.isSafari = isSafari;
    exports.isWebkit = isWebkit;
    exports.majorVersion = majorVersion;

    exports.isLinux = isLinux;
    exports.isMac = isMac;
    exports.isWin = isWin;

    exports._isTrident = _isTrident; // Exposed for testing
    exports._getUserAgent = function() { return userAgent; };
    exports._getPlatform =  function() { return platform; };

    // override $.browser.version, because some of jira-project and ecosystem may depend on that
    if (_isEdge(userAgent)) {
        $.browser.version = _edgeVersion(userAgent);
        $.browser.mozilla = false;
        $.browser.msie = true;
    }
});
