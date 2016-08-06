/**
 * A dictionary of event types that JIRA will fire from time to time.
 * @module jira/util/events/types
 */
define('jira/util/events/types', /** @alias module:jira/util/events/types */ {
    // Export the event name so listeners don't have to
    NEW_CONTENT_ADDED: "newContentAdded",
    NEW_PAGE_ADDED: "newPageAdded",
    REFRESH_TOGGLE_BLOCKS: "refreshToggleBlocks",
    CHECKBOXMULITSELECT_READY: "checkboxMultiSelectReady"
});

AJS.namespace('JIRA.Events', null, require('jira/util/events/types'));
