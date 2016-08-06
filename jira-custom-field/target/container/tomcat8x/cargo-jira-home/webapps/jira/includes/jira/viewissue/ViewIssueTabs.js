/**
 * This module encapsulates issue tab-related functionality

 * @namespace JIRA.ViewIssueTabs
 * @requires jQuery
 * @requires JIRA.Dialog
 */
define("jira/viewissue/tabs", [
    "jquery",
    "jira/util/data/meta",
    "jira/dialog/form-dialog",
    "jira/ajs/ajax/smart-ajax",
    "jira/userhover/userhover",
    "jira/viewissue/tabs/analytics"
], function(
    jQuery,
    Meta,
    FormDialog,
    SmartAjax,
    Userhover,
    Analytics
) {
    var Format = AJS.format;
    var Templates = JIRA.Templates.Issue.Tabs;

    /**
     * Whether to use the HTML5 History API when switching between tabs. Setting this to false will cause tab switching
     * to just use a plain AJAX request without changing the URL.
     *
     * @type {Boolean}
     */
    var useHistoryApi = Meta.get('viewissue-use-history-api') !== false;

    /**
     * The CSS class used to mark issue tab panel links that can be loaded using AJAX.
     */
    var AJAX_LOAD_CLASS = 'ajax-activity-content';

    /**
     * The selector for container that should contain contents be loaded using AJAX.
     */
    var CONTAINER_SELECTOR = '#activitymodule div.mod-content';

    /**
     * The selector for links that should be loaded using AJAX.
     */
    var AJAX_LINK_SELECTOR = Format('a.{0}', AJAX_LOAD_CLASS);

    /**
     *
     * This array holds the functions that will be called after a issue tab is loaded.
     */
    var issueTabLoadedListeners = [];

    /**
     * These are used to display progress and the tab contents.
     */
    var $tabWrapper,
        $tabContents;

    /**
     * The XHR that's currently in progress and hasn't been aborted, or null.
     */
    var xhrInProgress;

    /**
     * Dispatches the "issue tab loaded" event to the registered listeners.
     *
     * @param container the DOM node that was loaded (may be a tab or the whole document)
     */
    function dispatchIssueTabLoadedEvent(container) {
        container = container || document;
        jQuery.each(issueTabLoadedListeners, function (i, fn) {
            fn(container);
        });
    }

    /**
     * Binds this class's $tabWrapper and $tabContents vars to the loaded tab.
     *
     * @param container the tab
     */
    function bindToTabDivs(container) {
        // these are the DOM elements we'll manipulate

        // JRADEV-17627 - Don't overwrite old elements if the container doesn't contain them.
        //
        // This method is called as a listener to the event JIRA.Events.NEW_CONTENT_ADDED, and that event is fired
        // twice. The first time it is fired when the page is loaded and container == document. The second time is fired
        // with container == some other div. In that second case, the container doesn't contain the elements we are after.
        var $newTabWrapper = jQuery(container).find('.issuePanelWrapper');
        var $newTabContents = jQuery(container).find('#issue_actions_container');
        $tabContents = $newTabContents.length ? $newTabContents : $tabContents;
        $tabWrapper = $newTabWrapper.length ? $newTabWrapper : $tabWrapper;
    }

    /**
     * Dispatches the "issue tab error" event to the registered listeners.
     */
    function dispatchIssueTabErrorEvent(smartAjaxResult, activeTabKey) {
        var errorPopup = new FormDialog({
            id: 'issue-tab-error-dialog',
            widthClass: 'small',
            content: SmartAjax.buildDialogErrorContent(smartAjaxResult, false)
        });

        // restore the previously-active tab before showing the pop-up
        setActiveTab(activeTabKey);
        $tabContents.show();

        errorPopup.show();
    }

    function setActiveTab(activeTabKey) {
        jQuery('#issue-tabs li').each(function() {
            var $li = jQuery(this);

            // activate the right tab
            var tabKey = $li.data('key');
            var tabLabel = $li.data('label');
            if (tabKey == activeTabKey)
            {
                $li.addClass('active');
                $li.html(Templates.label({
                    text: tabLabel
                }));
            }
            else
            {
                $li.removeClass('active');
                var id = $li.data('id');
                var href = $li.data('href');
                $li.html(Templates.tab({
                    id: id,
                    href: href,
                    linkClass: AJAX_LOAD_CLASS,
                    text: tabLabel
                }));
            }
        });

        enableAjaxOnLinks(jQuery('#issue-tabs'));
    }

    /**
     * Puts a tab in the loading state: marks the tab title as active, hides the previous tab's content, and shows a
     * "loading" image.
     */
    function putTabInLoadingState(activeTabKey) {
        setActiveTab(activeTabKey);
    }

    /**
     * Detect if event trigger by keyboard or mouse based on position
     * because we cannot based on event.type (always return "click" inner click handler function
     */

    function isTriggerByKeyBoard(event, $trigger){
        var eventX = event.pageX;
        var eventY = event.pageY;
        var triggerOffset = $trigger.offset();
        var triggerWidth = $trigger.outerWidth();
        var triggerHeight = $trigger.outerHeight();

        if(eventX == 0 && eventY == 0) {
            return true;
        }
        else {
            return ! (eventX >= triggerOffset.left && eventX <= (triggerOffset.left + triggerWidth) && eventY >= triggerOffset.top && eventY <= (triggerOffset.top + triggerHeight));
        }
    }

    /**
     * Make all activitymodule links PJAX-enabled.
     */
    function enableAjaxOnLinks(context) {
        var activeTabKey = jQuery(context).find('li.active').data('key');
        jQuery(context).find(AJAX_LINK_SELECTOR).click(function (event) {
            var $trigger = jQuery(this);

            var isTriggerByKeyboard = isTriggerByKeyBoard(event, $trigger);

            // hide the contents, and activate the other tab
            var loadingTabKey = $trigger.parent().data('key');

            var openInNewWindow = event.metaKey;

            if (loadingTabKey) {
                Analytics.tabClicked($trigger, openInNewWindow, isTriggerByKeyboard);
            } else {
                Analytics.buttonClicked($trigger, openInNewWindow, isTriggerByKeyboard);
            }

            if (openInNewWindow) {
                // allow people to meta-click to open link in a new tab or window
                return;
            }

            event.preventDefault();

            // not all links change tabs - e.g. sort icon
            if (loadingTabKey) {
                putTabInLoadingState(loadingTabKey);
            }


            handleAjaxContentsLoading(activeTabKey, $trigger.attr("href"))
                .done(function($container){
                    if(!isTriggerByKeyboard){
                        //if user trigger action by mouse , we don't get focus
                        return;
                    }
                    //focus into tab or sort action element after update content
                    if(loadingTabKey) {
                        //focus into active tab
                        $container.find("#"+$trigger.attr("id")+" > :first-child").focus();
                    }
                    else {
                        //focus into sort action
                        $container.find(".sortwrap  > :first-child").focus();
                    }
                })
                .done(dispatchIssueTabLoadedEvent);
        });
    }

    /**
     * Loading new content by Ajax and update dom content based on the Ajax'result
     */
    function handleAjaxContentsLoading(activeTabKey, loadingUrl){
        var deferred = jQuery.Deferred();
        // cancel any pending requests
        if (xhrInProgress) {
            xhrInProgress.abort();
        }

        var xhr = SmartAjax.makeRequest({
            jqueryAjaxFn: useHistoryApi ? jQuery.pjax : jQuery.ajax,
            headers: { "X-PJAX": true }, // needed for the ViewIssue action to return only the activity panel
            container: CONTAINER_SELECTOR,
            url: loadingUrl,
            timeout: null,
            complete: function (xhr, status, smartAjaxResult) {
                if (status != 'abort') {
                    xhrInProgress = null;

                    if (!smartAjaxResult.successful)
                    {
                        // don't display error when we're going to redirect anyway
                        if (smartAjaxResult.status < 300 || smartAjaxResult.status >= 400)
                        {
                            dispatchIssueTabErrorEvent(smartAjaxResult, activeTabKey);
                        }

                        return;
                    }

                    var $container = jQuery(this.container);
                    /**
                     * var newElements = AJS.$(smartAjaxResult.data);
                     * Above line of code caused the RangeError: Maximum call stack size exceeds error,
                     * when trying to wrap the huge smartAjaxResult.data.
                     */

                    var newElementsHtml = document.createElement("div");
                    newElementsHtml.innerHTML = smartAjaxResult.data;
                    var newElements = document.createDocumentFragment().appendChild(newElementsHtml);
                    if (!useHistoryApi) {
                        // if not using PJAX then we need to manually write the retrieved content into the page
                        smartUpdate($container, newElements);
                    }

                    JIRA.trace('jira.issue.tab.loaded');

                    deferred.resolve($container);
                }
            }
        });
        jQuery(xhr).throbber({target: $tabWrapper});
        xhrInProgress = xhr;
        return deferred;
    }

    /**
     * Attempts to find tab and content elements in newElements and update the respective elements in the container.
     * If the elements can't be matched up, it simply replaces the contents of container with newElements.
     * @param container
     * @param newElements
     */
    function smartUpdate(container, newElements) {
        var newTabs = newElements.querySelectorAll('.tabwrap');
        var oldTabs = container.find('.tabwrap');
        var newContents = jQuery(newElements.querySelectorAll("#issue_actions_container")).contents();
        var oldContents = $tabContents.contents();
        if (newTabs.length && oldTabs.length && newContents.length && oldContents.length) {
            // Replace the tabs
            oldTabs.replaceWith(newTabs);

            var currentContentHeight = $tabContents.height();
            // If the new content would cause the page to 'jump' due to being shorter than the
            // previous content, animate it smoothly from the edge of the window.
            // Otherwise, simply replace the content.
            $tabContents.append(newContents);
            var newContentHeight = $tabContents.height() - currentContentHeight;
            var visibleHeightDifference = jQuery(window).scrollTop() + jQuery(window).height() - ($tabContents.offset().top + newContentHeight);
            if (visibleHeightDifference > 0) {
                $tabContents.css('height', newContentHeight + visibleHeightDifference);
                oldContents.remove();

                // Delay the animation so the user has time to recognise that it is shrinking due to
                // the extra whitespace.
                var preDelay = 150;
                setTimeout(function() {
                    var pixelsPerSecond = 500;
                    var animSpeed = visibleHeightDifference / pixelsPerSecond * 1000;
                    $tabContents.animate({
                        height: newContentHeight
                    }, animSpeed, 'easeOutQuart', function() {
                        $tabContents.css('height', 'auto');
                    });
                }, preDelay);
            } else {
                $tabContents.empty().append(newContents);
            }

            // jQuery pulls out inline <script> elements from the hierarchy and places them at the top level
            // Execute any such scripts at the end
            jQuery(newElements.querySelectorAll('script')).each(function() {
                jQuery.globalEval(this.text || this.textContent || this.innerHTML || '');
            });
        } else {
            container.empty().append(newElements);
        }
    }

    /**
     * Appends "#issue-tabs" to each activity module link, in order to
     * maintain the legacy behaviour.
     */
    function appendHashCodeToLinks(context) {
        jQuery(context).find(AJAX_LINK_SELECTOR).each(function () {
            var $a = jQuery(this);

            $a.attr('href', $a.attr('href') + '#issue-tabs');
        });
    }

    /**
     * Either appends "#issue-tabs" to each link or PJAXifies them, depending
     * on whether the browser supports the pushState API.
     */
    function processActivityModuleLinks(context) {
        if (!useHistoryApi || jQuery.support.pjax) {
            enableAjaxOnLinks(context);
        } else {
            appendHashCodeToLinks(context);
        }
    }

    function setupMouseoverBehaviour(context) {
        jQuery(context).bind("moveToFinished", function (event, target) {
            jQuery("a.twixi:visible", target).focus();
        });
    }

    function initLivestamp(context) {
        context.find("time.livestamp").livestamp();
    }

    function onTabReady(listener) {
        // Prevent duplicate listeners.
        if (jQuery.inArray(listener, issueTabLoadedListeners) < 0) {
            issueTabLoadedListeners.push(listener);
        }
    }

    // sprinkle AJAX magic all over the tab links after they are loaded
    onTabReady(bindToTabDivs);
    onTabReady(processActivityModuleLinks);
    onTabReady(setupMouseoverBehaviour);
    onTabReady(Userhover);
    onTabReady(initLivestamp);

    /**
     * @borrows onTabReady
     * @borrows dispatchIssueTabLoadedEvent as domReady
     */
    return {
        onTabReady: onTabReady,
        domReady: dispatchIssueTabLoadedEvent
    };
});

AJS.namespace('JIRA.ViewIssueTabs', null, require('jira/viewissue/tabs'));
