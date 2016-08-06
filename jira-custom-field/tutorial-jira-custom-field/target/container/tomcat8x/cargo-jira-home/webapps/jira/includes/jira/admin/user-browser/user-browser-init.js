require([
    'jira/admin/user-browser',
    'jquery',
    'jira/admin/user-browser/user-created'
], function(
    UserBrowser,
    jQuery
) {
    jQuery(function () {
        UserBrowser.initToggleLists();
        if (AJS.HelpTip) {
            UserBrowser.initNewUsersTip("#invite_user", "#create_user");
        }
    });
});