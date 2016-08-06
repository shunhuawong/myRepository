define('jira/ajs/contentretriever/content-retriever', [
    'jira/lib/class',
    'jquery'
], function(
    Class,
    jQuery
) {

    /**
     * A content retriever has methods that allow both synchronous and asynchronous content retrieval to be
     * to be treated in the same way.
     *
     * @class ContentRetriever
     * @extends Class
     * @abstract
     * @deprecated use {@link AJS.ProgressiveDataSet} instead.
     * @see AJS.ProgressiveDataSet
     */
    return Class.extend({

        /**
         * Starting request
         *
         * This method should be called when starting request for content. This is really only used for asynchronous content
         * retrievers. A common example of it's use is to show loading indicators. The method has to code paths:
         * - If provided with a function argument adds to array of callbacks.
         * - If no function provided will execute all callbacks in the array.
         *
         * @method
         * @instance
         * @param {Function} func - (callback) to be called when request has started
         */
        startingRequest: jQuery.noop,

        /**
         * Finished request
         *
         * This method should be called when request for content is finished. This is really only used for asynchronous
         * content retrievers. A common example of it's use is to hide loading indicators. The method has to code paths:
         * - If provided with a function argument adds to array of callbacks.
         * - If no function provided will execute all callbacks in the array.
         *
         * @method
         * @instance
         * @param {Function} func - (callback) to be called when request has finished
         */
        finishedRequest: jQuery.noop,

        /**
         * Gets/Sets cached property.
         *
         * Should the request be cached. Only really used in async content retrievers.
         *
         * @method
         * @instance
         * @param {Boolean}
         * @return {Boolean}
         */
        cache: jQuery.noop,

        /**
         * Gets/Sets locked property. Used to validate a new request in async content retrievers. We do not want to be
         * making new request whilst there is already one issued.
         *
         * @method
         * @instance
         * @param {Boolean} locked - whether or not a new request can be issued
         * @return {Boolean}
         */
        isLocked: jQuery.noop,

        /**
         * Retreives/Gets/Sets content. This method should be able to be called in the following ways.
         *
         * contentRetriever.content(function(content) {
         *      // this function will be called after content has been retrieved
         * })
         *
         * contentRetriever.content() // this will return jQuery wrapped content if available
         *
         * @method
         * @instance
         * @param {Function | HTMLElement | jQuery}
         * @return {jQuery}
         */
        content: jQuery.noop

    });
});

AJS.namespace('AJS.ContentRetriever', null, require('jira/ajs/contentretriever/content-retriever'));
