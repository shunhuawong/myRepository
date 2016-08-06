/**
 * @module jira/tabs/tab-manager
 */
define('jira/tabs/tab-manager', [
    'jira/tabs/tab-manager/util',
    'jquery',
    'exports'
], function(
    TabManagerUtil,
    $,
    exports
) {

        /**
         * Singleton that adds ajax functionality to tabs to make requests async
         * @type NavigationTab
         */
        exports.navigationTabs = (function () {

            var
            loadEvents = {},// {Object} - contains a hash map of functions to be executed after specified tabs are loaded
            loadTab,        // {Object} - tab that is active when the page first loads
            filterTab,      // {Object} container where response from ajax tabs is injected
            activeTab,      // {Object} */
            previousTab,    // {Object} we hold the previous tab here, just in case something goes wrong we can switch back
            xhrObject,      // {Object} we keep reference to the xhrObject in case we need to abort
            tabs,
            tabUtil,        // an instance of TabManagerUtil, created in init function

            CONST = {
                filterTabSelector: JIRA.Page.mainContentCssSelector, // where async response is loaded
                tabsSelector: "ul.vertical.tabs li", // actual tab links items
                tabsLinksSelector: "ul.vertical.tabs li a", // actual tab links
                requestParams: "decorator=none&contentOnly=true", // params to ensure response is not decorated with furniture
                stateRequestParams: "decorator=none&contentOnly=true&updateState=true",
                activeTabClass: "active", // class applied to selected tabs
                loadedTabClass: "loaded", // class applied to selected and loaded tabs
                tabParam: "filterView"
            },
            /**
             * @private
             * @param {String} hashMapID
             */
            runTabLoadEvent = function (hashMapID) {
                if (loadEvents[hashMapID] && loadEvents[hashMapID] instanceof Array) {
                    $(loadEvents[hashMapID]).each(function () {
                        this();
                    });
                }
            },
            /**
             * Toggles active state from previous to specified tab and makes a request using the "href" attribute as the url
             * @private
             * @param {Object} tab - Anchor element of browse action
             * @param {boolean} historyEvent - Whether we want to navigate to a tab due to browsing already saved history item
             * @param {string} url - Url of the tab we want to navigate to
             */
            navigateToTab = function (tab, historyEvent, url) {
                var tabAnchor = $(tab).find("a"),
                    id = tabUtil.getTabParamFromUrl(url),

                populateTab = function (contentObj) {
                    // removes event handlers
                    // append evaluates scripts, which we need because we have taken out the content are putting it back in again
                    filterTab.empty();
                    filterTab.html(contentObj);
                    if (!historyEvent) {
                        tabUtil.saveHistoryItem(tabUtil.constructCompleteUrl(tabAnchor.attr("href")));
                    }
                    runTabLoadEvent(tabAnchor.attr("id"));
                    activeTab.addClass(CONST.loadedTabClass);
                    JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED, [filterTab, JIRA.CONTENT_ADDED_REASON.tabUpdated]);
                };

                if (tabUtil.getTabParamFromUrl(activeTab.find("a").attr("href")) === id){
                    return;
                }

                // We require a url to continue, otherwise there will be errors
                if (url && (activeTab.get(0) !== tab || url)) {
                    if (activeTab && activeTab.length) {
                        // remove active styling (css) from previously active tab
                        previousTab = activeTab.removeClass(CONST.activeTabClass).removeClass(CONST.loadedTabClass);
                    }
                    // apply active styling (css)
                    activeTab = $(tab).addClass("active");
                    // handling for race conditions
                    // if someone is a little click happy, we don't want their previous requests to be successful
                    if (xhrObject && xhrObject.get(0) && xhrObject.get(0).readyState !== 4 && xhrObject.get(0).abort) {
                        if ($.isFunction(xhrObject.hideThrobber)) {
                            xhrObject.hideThrobber();
                        }
                        // abort abort! We might show the incorrect content otherwise
                        xhrObject.get(0).abort();
                    }
                    // lets appear like our response is instantaneous by injecting some html straight away
                    filterTab.html("<h2>" + tabAnchor.attr("title")  + "</h2>");
                    // finally perform the ajax request
                    xhrObject = $($.ajax({
                        method: "get",
                        dataType: "html",
                        url: url,
                        data: CONST.requestParams,
                        success: populateTab
                    }).fail(function(jqXHR){
                                if (jqXHR.status === 401){
                                    window.location.reload();
                                } else if (jqXHR.statusText !== "abort") {
                                    var fragment = jqXHR.responseText && jqXHR.responseText.match(/<body[^>]*>([\S\s]*)<\/body[^>]*>/);
                                    if (fragment && fragment.length > 0) {
                                        filterTab.html("<div style=\"padding:0 20px\">" + fragment[1] + "</div>");
                                    }
                                }
                            })).throbber({target: tab}); // lets use the throbber plugin, we will only see the throbber when the request is latent...
                }
            },
            /**
             * Handler for history events. e.g browser back and forward buttons
             * @private
             * @param {String} tabParam - a key=value string pair identifying requested tab
             */
            handleBrowserNavigation = function(tabParam){
                var node = $([]); /* {Object} tab to be loaded */

                if (tabUtil.getTabParamFromUrl(activeTab.find("a").attr("href")) === tabParam){
                    return;
                }

                if (tabParam && tabParam !== "") {
                    // there is a tab parameter in the address bar, lets try and get the associated tab. Need to escape the selector.
                    node = getTab(tabParam);
                } else if (tabParam === "") {
                    // there is no tab parameter! We must be back to where we first started, before we started creating
                    // asynchronous requests
                    node = loadTab;
                }

                if (node){
                    // we have an associated tab so lets navigate to it, and pass "true" so that we
                    // don't register another history event
                    navigateToTab(node, true, $(node).find("a").attr("href"));
                }
            },

            getTab = function (url) {
                var tabRegExp = CONST.getTabRegEx, tabToTarget = url.match(tabRegExp), tab;
                $(tabs).each(function() {
                    var tabToCompare = $(this).find("a").attr("href").match(tabRegExp);
                    if (tabToTarget && tabToTarget.length > 0 && tabToCompare[0] === tabToTarget[0]) {
                        tab = this;
                    }
                });
                return tab;
            };

            window.addEventListener("popstate", function(){
                if (tabUtil){
                    handleBrowserNavigation(tabUtil.getTabParamFromUrl(window.location.href));
                }
            });

            return /** @name NavigationTab */ {

                /**
                 * @return {Object}
                 */
                getActiveTab: function () {
                    return activeTab;
                },

                /**
                 * @return {Object}
                 */
                getProjectTab: function () {
                    return filterTab;
                },

                /**
                 * Events to call after a tab is loaded via ajax. Commonly used to assign event handlers to new content.
                 * @return {Object}
                 */
                addLoadEvent: function (tabName, handler) {
                    loadEvents[tabName] = loadEvents[tabName] || [];
                    if ($.isFunction(handler)) {
                        loadEvents[tabName].push(handler);
                    }
                },

                _getTabManagerUtil: function(){
                    return tabUtil;
                },

                _getNavigateToTabFunc: function(){
                    return navigateToTab;
                },


                /**
                 * @public
                 */
                init: function (opts) {
                    $.extend(CONST, opts);

                    // used to get tab link item from DOM by comparing href attribute
                    CONST.getTabRegEx = new RegExp(CONST.tabParam + "=[^&]*");

                    tabUtil = new TabManagerUtil(window.location.href, CONST.tabParam, CONST.getTabRegEx);

                    // this is where we will inject all our html fragments
                    filterTab = $(CONST.filterTabSelector);

                    // save tabs for future use and determine currently active and first loaded tabs
                    tabs = $(CONST.tabsSelector).each(function () {
                        if ($(this).hasClass(CONST.activeTabClass)) {
                            activeTab = $(this);
                            activeTab.addClass(CONST.loadedTabClass);

                            loadTab = activeTab;
                        }
                    });

                    var addressTab = getTab(window.location.href);

                    // if current url contains no tab parameter, then add it
                    if (!window.location.href.match(CONST.getTabRegEx) && loadTab){
                        var initialUrl = $(loadTab).find("a").attr("href");

                        tabUtil.replaceHistoryItem(tabUtil.updateInitialUrl(initialUrl));
                    }

                    // check if the user wants a different tab then the one that is loaded
                    var currentTabParam = tabUtil.getTabParamFromUrl(window.location.href);
                    if (currentTabParam && addressTab && activeTab && tabUtil.getTabParamFromUrl(activeTab.find("a").attr("href")) !== currentTabParam){
                        // lets go ahead and load it for them then
                        var newUrl = $(addressTab).find("a").attr("href");
                        navigateToTab($(addressTab), true, newUrl);
                    }

                    $(CONST.tabsLinksSelector).click(function(e){
                        var href = $(this).attr("href");
                        var tab = getTab(href);

                        if (tab){
                            navigateToTab(tab, false, href);
                            e.preventDefault();
                        }
                    });

                    if (opts && opts.customInit){
                        opts.customInit();
                    }

                }
            };
        })();
});

/** Preserve legacy namespace
    @deprecated jira.app.manageShared */
AJS.namespace("jira.app.manageShared", null, require('jira/tabs/tab-manager'));
AJS.namespace("JIRA.TabManager", null, require('jira/tabs/tab-manager'));
