/**
 * @module jira/common/header
 */
define('jira/common/header', [
    'jira/message',
    'jira/issue',
    'jira/util/events',
    'jquery',
    'exports',
    'wrm/context-path'
], function(
    Messages,
    Issue,
    Events,
    jQuery,
    exports,
    contextPath
) {
    var messageBuffer = {};

    var getProjectAdminLink = function(issueKey, section) {
        var projectKey = issueKey.substr(0, issueKey.indexOf("-"));
        return AJS.format('<a href="{0}" target="_blank">', contextPath() + "/plugins/servlet/project-config/" + projectKey + "/" + section);
    };

    var showMessage = function(html) {
        if(html) {
            Messages.showSuccessMsg(html, {
                closeable: true
            });
        }
        //clear out the buffer.
        messageBuffer = {};
    };

    var getEditMessage = function(versionMsg, compnentMsg) {
        var html = "";
        if(messageBuffer.versionCreated) {
            html = "<p>" + versionMsg + "</p>";
        }
        if(messageBuffer.componentCreated) {
            html += "<p>" + compnentMsg + "</p>";
        }
        return html;
    };

    // A function for retrieving the KickAss API.
    // TODO: Replace this with require() call once AMD module exists for KickAss' API.
    var issueApp = function getKickAssAPIObject() {
        if (JIRA && JIRA.Issues && JIRA.Issues.Application) {
            return JIRA.Issues.Application;
        }
        return false; // KickAss' API doesn't exist
    };

    // Keeping a reference for event handlers. I'm doing it this way because I wanted to affect as few lines in the commit diff as possible.
    var sessionCompleteCb, saveSuccessCb, versionCb, componentCb;

    /**
     * Initialised the header module.  Binds to various events that will result in
     * global messages being shown.
     */
    exports.initialize = function() {
        Events.bind("QuickCreateIssue.sessionComplete", sessionCompleteCb = function (e, issues) {
            var issue = [].concat(issues).pop(); //get the last issue created

            var html = Issue.issueCreatedMessage(issue);
            html += getEditMessage(AJS.I18n.getText("jira.version.created.quick.create", getProjectAdminLink(issue.issueKey, "versions"), "</a>"),
                    AJS.I18n.getText("jira.component.created.quick.create", getProjectAdminLink(issue.issueKey, "components"), "</a>"));
            showMessage(html);
        });

        if(issueApp()) {
            issueApp().on("issueEditor:saveSuccess", saveSuccessCb = function(saveDetails) {
                // Only the latest version of the issueEditor includes the issueKey in the event.  For older versions we fall back to JIRA.Issue.getIssueKey() which could be buggy if the user
                // has already moved on to another issue when the saveSuccess comes back.  Eventually we can just rely on the key from the event once we're on the latest version of KA.
                var issueKey = saveDetails && saveDetails.issueKey ? saveDetails.issueKey : Issue.getIssueKey();
                var msg = getEditMessage(AJS.I18n.getText("jira.version.created", getProjectAdminLink(issueKey, "versions"), "</a>"),
                        AJS.I18n.getText("jira.component.created", getProjectAdminLink(issueKey, "components"), "</a>"));
                showMessage(msg);
            });
        }

        Events.bind("Issue.Version.new.selected", versionCb = function() {
            messageBuffer.versionCreated = true;
        });

        Events.bind("Issue.Component.new.selected", componentCb = function() {
            messageBuffer.componentCreated = true;
        });
    };

    /**
     * Unbinds any events the header module listens for.
     */
    exports.unbind = function() {
        Events.unbind("QuickCreateIssue.sessionComplete", sessionCompleteCb);
        Events.unbind("Issue.Version.new.selected", versionCb);
        Events.unbind("Issue.Component.new.selected", componentCb);
        if(issueApp()) {
            issueApp().unbind("issueEditor:saveSuccess", saveSuccessCb);
        }
    };
});
