/**
 * @module jira/dropdown/dropdown-factory
 */
define('jira/dropdown/dropdown-factory', [
    'jira/ajs/dropdown/dropdown',
    'jquery',
    'exports'
], function (
    Dropdown,
    $,
    exports
) {
    /**
     * Bind dropdowns that have no special behaviours.
     * @param {Element|jQuery} ctx the element to look in for dropdowns to bind
     * @deprecated see {@link skate:js-default-dropdown}.
     */
    exports.bindGenericDropdowns = $.noop;

    /**
     * Binds issue action (cog) dropdowns
     * @param {Element|jQuery} ctx the element to look in for dropdowns to bind
     * @param {Object} options additional configuration for the dropdown to be created
     * @deprecated see {@link skate:issue-actions-trigger}
     */
    exports.bindIssueActionsDds = $.noop;

    /**
     * Binds dropdowns that control the views & columns in issue navigator
     */
    exports.bindNavigatorOptionsDds = function () {
        var $navigatorOptions = $("#navigator-options");

        Dropdown.create({
            trigger: $navigatorOptions.find(".aui-dd-link"),
            content: $navigatorOptions.find(".aui-list"),
            alignment: AJS.RIGHT
        });
        $navigatorOptions.find("a.aui-dd-link").linkedMenu();
    };

    /**
     * Binds all the dropdowns that support the dashboard chrome
     */
    exports.bindConfigDashboardDds = function () {
        $("#dashboard").find(".aui-dd-parent").dropDown("Standard", {
            trigger: "a.aui-dd-link"
        });
    };

});

AJS.namespace('JIRA.Dropdowns', null, require('jira/dropdown/dropdown-factory'));
