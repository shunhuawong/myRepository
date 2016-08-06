define("jira/viewissue/analytics-utils", [
    'jira/util/data/meta',
    'jira/issuenavigator/issue-navigator',
    'jira/util/strings',
    'wrm/context-path',
    'jquery',
    'exports'
], function(
    Meta,
    IssueNav,
    StringUtils,
    ContextPath,
    jQuery,
    exports
) {
    function isFullscreenIssue() {
        return jQuery(document.body).hasClass("navigator-issue-only");
    }

    function isServiceDeskQueue() {
        return !!Meta.get("is-servicedesk-rendered");
    }

    function isIssueNav() {
        return IssueNav.isNavigator();
    }

    function isIssueNavFullScreen() {
        return isFullscreenIssue() && StringUtils.contains(location.search, "jql=");
    }

    function isProjectView() {
        return StringUtils.startsWith(location.pathname, ContextPath() + "/projects/");
    }

    exports.context = function() {
        if (isIssueNavFullScreen()) {
            return "fullscreen-issuenav";
        }

        if (isFullscreenIssue()) {
            return "fullscreen";
        }

        if (isServiceDeskQueue()) {
            return "sd-queue";
        }

        if (isIssueNav()) {
            return "issuenav";
        }

        if (isProjectView()) {
            return "project";
        }

        return "unknown";
    };
});

