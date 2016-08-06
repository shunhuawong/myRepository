require([
    "jira/admin/application-selector",
    "jquery",
    "aui/inline-dialog2",
    "jira/admin/view-user/view-user"
], function(
    ApplicationSelector,
    $,
    InlineDialog2,
    ViewUser
) {
    $(function () {
        var $applicationsAndGroupsModule = $(".view-user-applications-and-groups-module");
        var username = $applicationsAndGroupsModule.attr("data-username");

        var viewUser = new ViewUser({
            el: $applicationsAndGroupsModule,
            username: username
        });

        viewUser.listenTo(viewUser, "application-trigger", function(options) {
            var ajaxType = options.application.isSelected() ? "POST" : "DELETE";

            $.ajax({
                type: ajaxType,
                url: contextPath + "/rest/internal/2/viewuser/application/" + encodeURI(options.application.getApplicationKey()) + "?username=" + encodeURIComponent(username),
                contentType: "application/json",
                dataType: "json"
            }).done(function(response) {
                viewUser.update(response);
                JIRA.trace("view-user-select");
            }).fail(function(xhr) {
                viewUser.onError(xhr.responseText, xhr.status);
            });
        });
    });
});