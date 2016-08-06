define('jira/ajs/contentretriever/dom-content-retriever', [
    'jira/ajs/contentretriever/content-retriever',
    'jquery'
], function(
    ContentRetriever,
    $
) {
    /**
     * A simple content retrieval class, that provides a common interface to access to a provided HTML element
     *
     * @class DOMContentRetriever
     * @extends ContentRetriever
     * @deprecated use {@link AJS.ProgressiveDataSet} instead.
     * @see AJS.ProgressiveDataSet
     */
    return ContentRetriever.extend({

        /**
         * @param {HTMLElement | jQuery | String} content - HTML element to access
         * @constructs
         */
        init: function (content) {
            this.$content = $(content);
        },

        /**
         * Gets content via invocation or callback
         *
         * @param {Function} callback - if provided executes callback with content being the first argument
         */
        content: function (callback) {
            if ($.isFunction(callback)) {
                callback(this.$content);
            }

            return this.$content;
        }
    });
});

AJS.namespace('AJS.DOMContentRetriever', null, require('jira/ajs/contentretriever/dom-content-retriever'));
