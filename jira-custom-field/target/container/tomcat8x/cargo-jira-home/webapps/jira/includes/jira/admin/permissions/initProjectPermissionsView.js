;require([
    'jquery',
    'jira/project/permissions/permissionschememodel',
    'jira/project/permissions/permissionschemeview',
    'jira/util/events',
    'jira/util/events/types',
    'jira/util/events/reasons'
], function(
    $,
    ProjectPermissionSchemeModel,
    ProjectPermissionSchemeView,
    JiraEvents,
    JiraEventTypes,
    JiraEventReasons
) {
    "use strict";
    $(function() {
        var permissionSchemeId = WRM.data.claim("permissionSchemeId");
        var sharedProjects = WRM.data.claim("sharedProjects");
        var model = new ProjectPermissionSchemeModel({id: permissionSchemeId});

        var permissionSchemeView = new ProjectPermissionSchemeView({model: model, sharedProjects:sharedProjects, el: ".project-permissions-container"});
        // needed to hook up the shared-by inline dialog.
        permissionSchemeView.on("renderDone", function(context) {
            JiraEvents.trigger(JiraEventTypes.NEW_CONTENT_ADDED, [context, JiraEventReasons.pageLoad]);
        });

        model.fetch();
    });
});
