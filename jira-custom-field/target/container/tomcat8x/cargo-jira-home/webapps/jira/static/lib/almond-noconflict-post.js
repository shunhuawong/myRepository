// noConflict
if (window.__require) {
    window.require = window.__require;
    window.requirejs = window.__requirejs;
    window.define = window.__define;
} else {
    // Patch our own version of Almond.
    //
    // If "define.amd" is truthy, some 3rd-party libs (e.g. jQuery, spin.js)
    // automatically register themselves via define(). We don't want that,
    // we'll take care of calling define() for each lib.
    delete window.define.amd;
}

// INC-71 There's some calls throughout JIRA of the form AJS.namespace('object.name', null, require('amd/module/name')).
// This code will attach the name of the 'require' call to the returned value, for use in deprecation messages.
(function(require) {
    var almondRequire = require;

    window.require = function(deps, callback) {
        var value = almondRequire.apply(window, arguments);
        if (typeof deps === "string") {
            if (!(value instanceof Array) && (typeof value === "object" || typeof value === "function")) {
                value.__amdModuleName = deps;
            }
        }
        return value;
    };
    window.require.analytics = almondRequire.analytics;

})(window.require);

// IE8 doesn't support delete window.?
try { delete window.__require; } catch (e) { window.__require = undefined; }
try { delete window.__requirejs; } catch (e) { window.__requirejs = undefined; }
try { delete window.__define; } catch (e) { window.__define = undefined; }
