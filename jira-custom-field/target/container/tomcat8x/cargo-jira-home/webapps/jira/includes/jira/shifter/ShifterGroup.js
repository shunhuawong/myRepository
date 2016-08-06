/**
 * @module jira/shifter/shifter-group
 */
define('jira/shifter/shifter-group', [
    'jquery'
], function(
    jQuery
) {
    /**
     * @typedef {Object} ShifterGroup
     * @alias module:jira/shifter/shifter-group
     */
    return {
        /**
         * displayed as the group heading
         * @type String
         */
        name: "",
        /**
         * a number similar to z-index that determines the order it is displayed in
         * @type Number
         * @default -1
         */
        weight: -1,
        /**
         * called each time the query changes
         * @param {String} args - query
         * @returns {jQuery.Deferred} to be resolved with an array of `{ value: any, label: String, keywords: Array|null }`
         */
        getSuggestions: function(args) {
            return jQuery.Deferred();
        },
        /**
         * called when one of the group's suggestions is chosen
         * @type Function
         * @param {*} args
         */
        onSelection: jQuery.noop
    };
});