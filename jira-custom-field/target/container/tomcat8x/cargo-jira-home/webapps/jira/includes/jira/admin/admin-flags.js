;require([
    "jira/flag",
    "jquery"
], function(
    Flags,
    $
) {
    "use strict";

    $(function () {
        var data = WRM.data.claim('jira.webresources:user-message-flags.adminLockout') || {};
        if (data.noprojects) {
            var templates = JIRA.Templates.Flags.Admin;
            var title = templates.adminIssueAccessFlagTitle({});
            var body = templates.adminIssueAccessFlagBody({
                manageAccessUrl: data.manageAccessUrl
            });
            var flag = Flags.showWarningMsg(title, body, {
                dismissalKey: data.flagId
            });

            $(flag).find("a").on("click", function () {
                flag.dismiss();
            });
        }
        JIRA.trace("admin.flags.done");
    });
});