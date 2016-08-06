define('jira/page/atl/prefetch', [
    'jira/util/data/meta',
    'jira/data/local-storage',
    'jira/ajs/dark-features',
    'jquery'
], function definePrefetchResource(meta,
    storage,
    darkFeatures,
    jQuery
) {
    /**
     * A module for pre-fetching resources for given page before it is really visited.
     * <link rel="prefetch" /> is used to instruct browser which resources to pre download.
     * Currently used to prefetch view issue resources.
     * @exports jira/issue/resources-prefetch
     */
    'use strict';

    var SESSION_KEY = 'jira.issue.prefetch.last.superbatch';
    var stateToken = _getStateToken();

    //
    // Private functions
    //
    function _getStateToken() {
        //lets use last super batch url as token with date as browser most probably removed entries from cache
        var now = new Date();
        var dateStr = now.getFullYear().toString() + now.getMonth().toString() + now.getDate().toString();
        var superbatch = jQuery('head > script').filter(function findSuperbatch(a, b) {return b.src.indexOf('/_super') > 0;});
        return (superbatch.length > 0 ? superbatch[0].src : 'empty') + dateStr;

    }

    function _addPrefetchTag(url) {
        jQuery('<link />', {
            rel: 'prefetch',
            href: url
        }).appendTo('head');
    }

    /**
     * @param {Object} issueMenuData - data for view issue menu.
     * @param {Object} [issueMenuData.sections] - optional section in view issue menu.
     */
    function _getLastIssueFromMenu(issueMenuData) {
        var sections = issueMenuData.sections;
        if (!sections) {
            return;
        }
        var recentIssues = sections.filter(function filterMenu(menuItem) {return menuItem.id === 'issues_history_main';});
        if (recentIssues.length && recentIssues[0].items.length !== 0) {
            var lastIssue = recentIssues[0].items[0];
            return lastIssue.url;
        }
    }

    function _addPrefetchForRegex(response, regex) {
        var matchResult;
        while (matchResult = regex.exec(response)) {
            var url = matchResult[1].replace(/&amp;/g, '&');
            _addPrefetchTag(url);
        }
    }

    function _rememberFetchState() {
        storage.setItem(SESSION_KEY, stateToken);

    }

    function _parsePageAndInsertLinks(data) {
        _addPrefetchForRegex(data, /<script.+?src="(.+?)".+?<\/script>/g);
        _addPrefetchForRegex(data, /<link.+?rel="stylesheet".+?href="(.+?)".+?>/g);
        _rememberFetchState();
    }

    function _shouldFetchResources() {
        if (!darkFeatures.isEnabled('jira.issue.prefetch')) {
            //don't fetch if dark feature is not enabled
            return false;
        }
        if (jQuery('#isNavigator').length === 1) {
            //don't fetch on navigator as this has the same resources as issue
            _rememberFetchState();
            return false;
        }
        else if (meta.get('issue-key')) {
            //don't fetch on issue page
            _rememberFetchState();
            return false;
        }
        else {
            //fetch if current state token is different for stored in local storage
            return stateToken !== storage.getItem(SESSION_KEY);
        }
    }
    function _prefetchResourcesForLastIssue(data) {
        var issueUrl = _getLastIssueFromMenu(data);
        if (issueUrl) {
            prefetchResourcesForUrl(issueUrl);
        }
    }
    //
    // Public API functions
    //

    function prefetchResourcesForUrl(url) {
        jQuery.get(url, _parsePageAndInsertLinks);
    }


    function prefetchViewIssueResources() {
        if (_shouldFetchResources()) {
            //only execute if we are on view issue context and
            jQuery.ajax(
                {
                    url: AJS.contextPath() + '/rest/api/1.0/menus/find_link?inAdminMode=false',
                    dataType: 'json'
                }).done(_prefetchResourcesForLastIssue);
        }
    }

    return {
        /**
         * Adds prefetch tags for resources included by page at given URL
         * @param {String} url
         */
        prefetchResourcesForUrl: prefetchResourcesForUrl,
        /**
         * Adds prefetch tags for view issue resources.
         * It will work only if user has visited any issue in the past so it is accessible from latest issues menu.
         */
        prefetchViewIssueResources: prefetchViewIssueResources
    };
});
