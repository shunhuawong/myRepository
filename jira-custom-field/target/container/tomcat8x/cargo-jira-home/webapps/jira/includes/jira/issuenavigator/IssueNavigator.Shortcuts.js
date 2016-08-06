define('jira/issuenavigator/issue-navigator/shortcuts', [
    'jira/issuenavigator/issue-navigator',
    'jira/focus/set-focus',
    'jira/ajs/persistence',
    'jira/util/events',
    'jira/issue',
    'jira/message',
    'jquery'
], function (
    IssueNavigator,/** @todo TF-711 remove. */
    SetFocus,
    Persistence,
    Events,
    Issue,
    Messages,
    $
) {
    /**
     * @deprecated should all be superceded by {@link JIRA.Issues.Api}.
     * @todo TF-711 remove entirely.
     * @exports jira/issuenavigator/issue-navigator/shortcuts
     * @namespace JIRA.IssueNavigator.Shortcuts
     */
    var Shortcuts = {};

    Shortcuts._quickEditSessionCompleteHandler = function (e, issues) {
        IssueNavigator.setIssueUpdatedMsg();
        IssueNavigator.reload();
    };

    Shortcuts._quickCreateSubtaskSessionCompleteHandler = function (e, issues) {
        var lastIssue = issues[issues.length-1],
            msg = Issue.issueCreatedMessage(lastIssue,true);

        IssueNavigator.setIssueUpdatedMsg({
            issueMsg: msg
        });

        IssueNavigator.reload();
    };

    var $rows,
        index,
        $nextPage,
        $previousPage,
        helpText,
        isLoadingNewPage = false;

    var issueIdToRowIndex = {};

    $(document).ready(function () {

        if (IssueNavigator.isNavigator()) {

            var $focusedRow;
            var focusedClassName = /(?:^|\s)focused(?!\S)/;
            var preventFocus = function() {
                $(this).attr("tabIndex", -1);
            };

            $rows = $('#issuetable').find('tr.issuerow');

            $rows.each(function(i) {
                var $row = $(this);

                $('a.hidden-link', this).blur(preventFocus);

                if (!$focusedRow && focusedClassName.test(this.className)) {
                    $focusedRow = $row;
                    index = i;
                }

                issueIdToRowIndex[$row.attr("rel")] = i;
            });

            if (!$focusedRow) {
                // This shouldn't ever be the case, but let's be defensive.
                $focusedRow = $rows.first().addClass("focused");
            }

            var jqlHasFocus = $("#jqltext").hasClass('focused');

            if (!jqlHasFocus) {
                var triggerConfig = new SetFocus.FocusConfiguration();
                triggerConfig.focusNow = function() {
                    focusRow(index);
                };
                SetFocus.pushConfiguration(triggerConfig);
            }

            // This is basically a hard coded shortcut for "Enter".  It will trigger a issue view ...
            $(document).keypress(function (e) {
                if (e.keyCode == '13' && $('div.aui-blanket').length == 0){ // ... but not if a dialog is currently open.
                    var target = e.target;
                    // On different browser the originalTarget is different, but all of these are impossible for a user to trigger.
                    if (target === undefined || target.nodeName === "HTML" || target.nodeName === "BODY" || target == document){
                        if (hasResults() && $rows[index]) {
                            window.location = contextPath + '/browse/' + $rows.eq(index).data('issuekey');
                        }
                    }
                }
            });


            var $pager = $('div.pagination').first(),
                shouldFocusSearch = $("#focusSearch").attr("content") === "true";

            $nextPage = $pager.find('a.icon-next');
            $previousPage = $pager.find('a.icon-previous');

            /*
             * This is used to set the focus away from an input box if they are coming back from a previous search.
             * The server is setting the #focusSearch meta property to true if its a new search and hence the focus will auto go to the input box.
             * But if its not a new search then we want to blur away from the input box so that keyboard shortcuts work
             */
            if (!shouldFocusSearch) {
                var activeElement = $(document.activeElement);
                if (activeElement.is(":input")) {
                    activeElement.blur();
                }
            }


            if (hasResults() && !$(document.activeElement).is(":input")) {
                setTimeout(function () {
                    $rows.eq(index).scrollIntoView();
                }, 0);
            }

            $(".issue-actions-trigger").click(function(){
                var $row = $(this).closest("tr");
                var issueId = $row.attr("rel");
                if (issueId){
                    Shortcuts.focusRow(issueId, 0, true);
                }
            });

            // listen for subtask creation to publish success message. See jira-quick-edit plugin.
            Events.bind("QuickCreateSubtask.sessionComplete", Shortcuts._quickCreateSubtaskSessionCompleteHandler);

            // Listen to edit event to publish success message. See jira-quick-edit plugin.
            Events.bind("QuickEdit.sessionComplete", Shortcuts._quickEditSessionCompleteHandler);
        }
    });

    Shortcuts.selectNextIssue = function () {
        if (hasResults() && !isLoadingNewPage) {
            if (index === $rows.length - 1) {
                followLink($nextPage);
            } else {
                unselectRow(index++);
                selectRow(index);
            }
        }
    };

    Shortcuts.selectPreviousIssue = function () {
        if (hasResults() && !isLoadingNewPage) {
            if (index === 0) {
                followLink($previousPage);
            } else {
                unselectRow(index--);
                selectRow(index);
            }
        }
    };

    Shortcuts.viewSelectedIssue = function () {
        if (hasResults() && $($rows[index]).length) {
            try {
                window.location = contextPath + '/browse/' + $($rows[index]).data('issuekey');
            } catch(err) {
                //IE8 seems to throw an unspecified error here if there's a dirty form warning (see JRADEV-3307).  Catching and ignoring it!
            }
        }
    };

    /**
     * Called to focus the row on the first row or the specified row if issueId is specified
     * @param issueId an optional issueIf to focus on
     * @param delay the delay before triggering ajax issue selection
     * @param supressLinkFocus Do not focus on the first link in the row if this is true.
     */
    Shortcuts.focusRow = function (issueId, delay, supressLinkFocus) {
        if (hasResults()) {
            if (issueId) {
                selectRowViaIssueId(issueId, delay, supressLinkFocus);
            } else {
                if (!supressLinkFocus){
                    $($rows[index]).find('a:first').focus();
                }
            }
        }
    };



    Shortcuts.focusSearch = function () {
        var $jqlTextArea = $("#jqltext");
        // go to the top of the page
        $("#jira").scrollIntoView();
        if ($jqlTextArea.length > 0){
            $jqlTextArea.focus();
        } else {
            var $issuenav = $("#issuenav");
            if ($issuenav.hasClass("lhc-collapsed")){
                $(".toggle-lhc").click();
            }
            var $textSection = $("#navigator-filter-subheading-textsearch-group");
            if ($textSection.hasClass("collapsed")){
                $("#searcher-pid").focus();
            } else {
                $("#searcher-query").focus();
            }
        }
    };

    function hasResults() {
        return $rows && $rows.length > 0;
    }

    function followLink($a) {
        var href = $a.attr('href');
        if (href) {
            isLoadingNewPage = true;
            Persistence.nextPage("blurSearch", true);
            window.location = href;
            //if the new page hasn't loaded, re-enable shortcuts after 5 seconds (user may have pressed stop).
            //this may leave a small window where j & k don't work but there doesn't seem to be a way to detect
            //if the user pressed stop. (JRADEV-2872)
            setTimeout(function() { isLoadingNewPage = false; }, 5000);

        }
    }

    function unselectRow(i) {

        var $td = $($rows[i]).find('td:first');
        $($rows[i]).removeClass('focused');
        helpText = $td.attr('title');
        $td.removeAttr('title');
    }

    function selectRow(i, delay, supressLinkFocus) {
        var $selected = $($rows[i]).addClass('focused').scrollIntoView();
        $selected.find('td').first().attr('title', helpText);
        if (!supressLinkFocus){
            focusRow(i);
        }
    }

    function selectRowViaIssueId(issueId, delay, supressLinkFocus)
    {
        var newIndex = issueIdToRowIndex[issueId];
        if (newIndex || newIndex === 0) {
            unselectRow(index);
            selectRow(index = newIndex, delay, supressLinkFocus);
        }
    }

    // This is here so tab and enter work correctly while traversing the navigator list.
    function focusRow(i) {
        var $selected = $($rows[i]);
        $selected.find('.hidden-link')
            .removeAttr('tabIndex')
            .focus();
    }

    return Shortcuts;
});

/** @deprecated */AJS.namespace("jira.app.issuenavigator.shortcuts", null, require('jira/issuenavigator/issue-navigator/shortcuts'));
/** @deprecated */AJS.namespace("JIRA.IssueNavigator.Shortcuts", null, require('jira/issuenavigator/issue-navigator/shortcuts'));
