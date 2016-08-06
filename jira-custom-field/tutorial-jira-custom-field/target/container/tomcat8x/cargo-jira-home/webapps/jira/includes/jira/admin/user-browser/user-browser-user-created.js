define('jira/admin/user-browser/user-created', [
    'jquery',
    'underscore',
    'jira/flag',
    'jira/admin/user-browser/user-browser-flags'
], function(
    $,
    _,
    Flag,
    observer
) {
    function showUserCreatedFlag (displayNames) {
        Flag.showSuccessMsg(null, JIRA.Templates.Admin.UserBrowser.userCreatedFlag({
            names: displayNames
        }));
        JIRA.trace('user-created-flag');
    }

    $(function () {
        observer.whenFlagSet("userCreatedFlag", function(){
            var displayNames = WRM.data.claim("UserBrowser:createdUsersDisplayNames");
            if (displayNames && displayNames.length > 0) {
                showUserCreatedFlag(displayNames);
            }
        });
    });
});