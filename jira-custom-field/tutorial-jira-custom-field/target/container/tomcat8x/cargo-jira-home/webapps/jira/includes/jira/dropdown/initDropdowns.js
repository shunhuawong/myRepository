require([
    'jira/dropdown/element/default-dropdown',
    'jira/dropdown/element/issue-actions-trigger',
    'jira/dropdown/dropdown-factory',
    'jquery'
], function(DefaultDropdownElement, IssueActionsTriggerElement, DropdownFactory, $) {

    $(function () {
        DropdownFactory.bindNavigatorOptionsDds();
        DropdownFactory.bindConfigDashboardDds();
    });

});
