/**
 * This script checks if the selected global permission in GlobalPermissions page is an admin one and if that's the case
 * if the selected group is a default group. Then it will create an AUI warning to display.
 */
require([
    'jquery',
], function ($)
{
    // Checks if given group is default of any of the given roles
    // If so displays $warning with relevant messaging
    function displayWarningIfNeeded (group, permission, roles, $warning) {
        var $permission = $('#globalPermType_select option:selected');

        var newPermission = $permission.val();
        var newGroup = $('#groupName_select option:selected').val();
        if (newGroup !== group || newPermission !== permission ) {
            // Race condition, outdated data
            return;
        }

        var affectedRoles = roles.filter(function (role) {
            return $.inArray(group, role.defaultGroups) > -1;
        });
        if (affectedRoles.length > 0) {
            var translatedPermission = $permission.text().trim();
            $('#default-group-warning-message').text(AJS.I18n.getText("admin.errors.permissions.grant.admin.to.default.group",
                    group, affectedRoles[0].name, translatedPermission));
            $warning.removeClass("hidden");
        }
    }

    var deferredRoles;

    function updateWarning() {
        var $defaultGroupsWarning = $('#default-groups-warning');
        $defaultGroupsWarning.addClass("hidden");

        var permission = $('#globalPermType_select option:selected').val();
        var group = $('#groupName_select option:selected').val();

        var showMessage = group && (permission === 'SYSTEM_ADMIN' || permission === 'ADMINISTER');

        if (!showMessage) {
            return;
        }

        var $addButton = $('#addpermission_submit');
        $addButton.attr("aria-disabled", "true");  //Disable Add button

        if (typeof deferredRoles === 'undefined') {
            deferredRoles = $.ajax({
                url: AJS.contextPath() + "/rest/api/2/applicationrole",
                contentType: 'application/json',
                type: "GET"
            }).promise();
        }

        deferredRoles.done(function (roles) {
            displayWarningIfNeeded(group, permission, roles, $defaultGroupsWarning);
        });

        deferredRoles.always(function () {
            $addButton.attr("aria-disabled", "false");
        });
    }

    $(document).ready(function () {
        $('#groupName_select').on('change', updateWarning);
        $('#globalPermType_select').on('change', updateWarning);
    });
});
