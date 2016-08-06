define('jira/issue', [
    'jira/util/browser',
    'jira/util/events',
    'jquery',
    'wrm/context-path'
], function(
    Browser,
    Events,
    jQuery,
    contextPath
) {

    /**
     * Represents the View Issue page.  This class should be used to get the current issue key
     * and any other issue centric information!
     *
     * @deprecated should all be superceded by {@link JIRA.Issues.Api}.
     * @todo TF-711 remove entirely.
     * @exports jira/issue
     * @namespace JIRA.Issue
     */
    var Issue = {};
    var $keyVal;

    //private function to cache the key value.
    function getKeyVal() {
        if(!$keyVal) {
            $keyVal = jQuery("#key-val");
        }
        return $keyVal;
    }

    /**
     * @return {jQuery}
     */
    Issue.getStalker = function () {
        return jQuery("#stalker");
    };

    /**
     * Gets subtask contents
     * @return {jQuery}
     */
    Issue.getSubtaskContent = function () {
        return Issue.getSubtaskModule().find(".mod-content");
    };

    /**
     * Gets subtask module
     */
    Issue.getSubtaskModule = function () {
        return jQuery("#view-subtasks");
    };

    /**
     * Reloads View Issue screen
     */
    Issue.reload = function () {
        Browser.reloadViaWindowLocation();
    };

    /**
     * Goes back to the server to get updates content, if there is any.
     *
     * @return jQuery.promise
     */
    Issue.refreshSubtasks = function () {

        var deferred = jQuery.Deferred(),
                $subtasks = Issue.getSubtaskContent();

        if ($subtasks.length === 0) {
            Browser.reloadViaWindowLocation(window.location.href + "#view-subtasks");
            return deferred.promise();
        } else {
            return jQuery.ajax({
                url: contextPath + "/secure/ViewSubtasks.jspa?id=" + Issue.getIssueId(),
                success: function (html) {
                    $subtasks.replaceWith(html);
                    Events.trigger("Issue.subtasksRefreshed", [Issue.getSubtaskContent()]);
                }
            });
        }
    };

    /**
     * Highlights specified issues
     *
     * @param issues
     */
    Issue.highlightSubtasks = function (issues) {
        jQuery.each(issues, function (i, issue) {
            jQuery(".issuerow[data-issuekey='" + issue.issueKey + "']").fadeInBackground();
        });
    };

    /**
     * Returns the issue id of the current issue being viewed.
     *
     * @return {String} the issue id or undefined if none can be found.
     */
    Issue.getIssueId = function() {
        var $keyVal = getKeyVal();
        if($keyVal.length !== 0) {
            return $keyVal.attr("rel");
        }
        return undefined;
    };

    /**
     * Returns the issue key of the current issue being viewed.
     *
     * @return {String} the issue key or undefined if none can be found.
     */
    Issue.getIssueKey = function() {
        var $keyVal = getKeyVal();
        if($keyVal.length !== 0) {
            return $keyVal.text();
        }
        return undefined;
    };

    /**
     * Gets I18N message for a created issue.
     *
     * @param issue issue to get message for
     * @param isSubtask whether the created issue is a subtask
     * @return {String} the issue created message according to the given data
     */
    Issue.issueCreatedMessage = function(issue, isSubtask) {
        var issueText = isSubtask ? AJS.I18n.getText("common.words.subtask") : AJS.I18n.getText("common.words.issue");
        var link = '<a class="issue-created-key issue-link" data-issue-key="' + issue.issueKey + '" href="' + contextPath() + '/browse/' + issue.issueKey + '">'
            + issue.issueKey + ' - ' + AJS.escapeHtml(issue.summary) + '</a>';
        return AJS.I18n.getText('createissue.issuecreated', issueText, link);
    };

    return Issue;
});

/** @deprecated */AJS.namespace("jira.app.issue", null, require('jira/issue'));
/** @deprecated */AJS.namespace("JIRA.Issue", null, require('jira/issue'));
