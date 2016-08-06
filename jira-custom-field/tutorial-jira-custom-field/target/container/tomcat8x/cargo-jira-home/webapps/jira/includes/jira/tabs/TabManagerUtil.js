/**
 * @module jira/tabs/tab-manager/util
 */
define('jira/tabs/tab-manager/util', [], function () {
    /**
     * A simple utility intended to be used by TabManager {@link module:jira/tabs/tab-manager} to manipulate
     * history items, extracted to enable testing.
     *
     * @param initialUrl {String} initial address used later to generate urls saved in history
     * @param tabParam {String} key of the query string parameter used to identify tabs
     * @param paramPairRegEx {RegExp} used to extract tabParam=value pair from query string
     * @constructor
     * @class TabManagerUtil
     */
    var TabManagerUtil = function (initialUrl, tabParam, paramPairRegEx) {
        this.initialUrl = initialUrl;
        this.paramPairRegEx = paramPairRegEx;
        this.tabParam = tabParam;
    };

    /**
     * Creates a new url identifying a tab by replacing tabParam in initialUrl with value found in given url;
     * if initialUrl contains no tabParam, it is not added.
     *
     * @param url {String} address to take tabParam value from
     * @returns {String} constructed url
     */
    TabManagerUtil.prototype.constructCompleteUrl = function (url) {
        var replacement = this.getTabParamFromUrl(url);
        var completeUrl = this.initialUrl.replace(this.paramPairRegEx, replacement);

        completeUrl = completeUrl.replace("?&", "?");
        completeUrl = completeUrl.replace(/[?&]$/, "");
        completeUrl = completeUrl.replace("&&", "&");

        return completeUrl;
    };

    /**
     * Extracts tabParam=value pair from query string of given url.
     *
     * @param url {String} address to extract value from
     * @returns {String} extracted pair or empty string if tabParam was not found
     */
    TabManagerUtil.prototype.getTabParamFromUrl = function (url) {
        var urlData = parseUri(url);

        if (urlData.queryKey[this.tabParam]) {
            return encodeURIComponent(this.tabParam) + "=" + urlData.queryKey[this.tabParam];
        }

        return "";
    };

    /**
     * Updates initial url based on given url; adds tabParam if necessary, keeps parameters already
     * present in initialUrl but do not add any additional parameters that given url may contain.
     *
     * @param url {String} address to update initialUrl from
     * @returns {String} initialUrl after the update
     */
    TabManagerUtil.prototype.updateInitialUrl = function (url) {
        var urlData = parseUri(url);

        if (!urlData.queryKey[this.tabParam]) {
            return this.initialUrl;
        }

        var newUrl = this.constructCompleteUrl(url);
        var newUrlData = parseUri(newUrl);
        var paramPair = this.tabParam + "=" + urlData.queryKey[this.tabParam];

        if (!newUrlData.query) {
            newUrl += "?" + paramPair;
        }
        else if (!newUrlData.queryKey[this.tabParam]) {
            newUrl += "&" + paramPair;
        }

        this.initialUrl = newUrl;

        return this.initialUrl;
    };

    /**
     * A simple wrapper over History API call, extracted to enable testing.
     *
     * @param url {String} url to pass to history.replaceState
     */
    TabManagerUtil.prototype.replaceHistoryItem = function (url) {
        history.replaceState(null, "", url);
    };

    /**
     * A simple wrapper over History API call, extracted to enable testing.
     *
     * @param url {String} url to pass to history.pushState
     */
    TabManagerUtil.prototype.saveHistoryItem = function (url) {
        history.pushState(null, "", url);
    };

    return TabManagerUtil;
});