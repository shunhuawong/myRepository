;require(["jquery", "jira/admin/application/approleseditor"],
(function ($, ApplicationRoles) {
    "use strict";

    $(function () {
        new ApplicationRoles({
            el: "#application-roles"
        });
    });
}));