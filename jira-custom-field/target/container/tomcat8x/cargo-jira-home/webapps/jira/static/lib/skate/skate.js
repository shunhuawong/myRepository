/**
 * JIRA's module for using [Skate.js]{@link https://github.com/skatejs/skatejs} in JIRA's UI.
 *
 * Skate is a lightweight polyfill for creating Custom Elements.
 * Skate is JIRA's conduit to creating web-components.
 *
 * Imports the Skate module from [the Atlassian JSLibs plugin]{@link https://stash.atlassian.com/projects/CP/repos/atlassian-jslibs}
 *
 * @module jira/skate
 */
define('jira/skate', ['atlassian/libs/skate-0.12.6'], function(skate) {
    function jiraSkate(id, component) {
        return skate(id, component);
    }

    jiraSkate.type = skate.type || {
        CLASSNAME: skate.types.CLASS,
        ELEMENT: skate.types.TAG,
        ATTRIBUTE: skate.types.ATTR
    };

    jiraSkate.init = function(nodes) {
        skate.init(nodes);
        // Since each version of Skate keeps its own registry of components,
        // it's possible that there's a global version of Skate, and it's
        // maintaining its own distinct list of components to us.
        //
        // A tangible scenario is AUI's internal Skate instance.
        //
        // Proxying to the window skate is an approximation of
        // synchronously initialising AUI's components.
        if (window.skate && window.skate.init) {
            window.skate.init(nodes);
        }
        return nodes;
    };

    return jiraSkate;
});
