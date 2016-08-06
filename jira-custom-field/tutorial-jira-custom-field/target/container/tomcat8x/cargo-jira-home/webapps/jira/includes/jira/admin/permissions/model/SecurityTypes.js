define('jira/project/permissions/securitytypes', [
], function(
) {
    "use strict";

    /**
     * @readonly
     * @exports jira/project/permissions/securitytypes
     * @enum {String}
     *
     */
    return {
        PROJECT_ROLE: "projectrole",
        GROUP: "group",
        USER_CF: "userCF",
        GROUP_CF: "groupCF",
        APPLICATION_ROLE: "applicationRole",
        REPORTER: "reporter",
        PROJECT_LEAD: "project-lead",
        CURRENT_ASSIGNEE: "current-assignee",
        SINGLE_USER: "user",

        isCustomFieldType: function (securityType) {
            return securityType === this.USER_CF || securityType === this.GROUP_CF;
        }
    };
});
