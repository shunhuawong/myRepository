(function () {

    var SuggestionCollectionModel = require('jira/ajs/select/suggestion-collection-model');

    function findProjectAndIssueTypeSelectAndConvertToPicker(ctx) {
        var $ctx = ctx || jQuery("body");

        $ctx.find(".issuetype-field").each(function (index) {
            var $project = $ctx.find(".project-field, .project-field-readonly"),
                $issueTypeSelect = jQuery(this),
                $projectIssueTypes = $ctx.find("#" + $issueTypeSelect.attr('id') + '-projects'),
                $defaultProjectIssueTypes = $ctx.find("#" + $issueTypeSelect.attr('id') + '-defaults'),
                issueTypeSelect = new AJS.SingleSelect({
                    element: $issueTypeSelect,
                    revertOnInvalid: true,
                    model: SuggestionCollectionModel
                });

            // Remove redundant "please select" option
            issueTypeSelect.model.remove("");

            //if there is accompanied project field link them together
            if ($project.length > 0) {
                new JIRA.ProjectIssueTypeSelect({
                    project: $project.eq(index), //link correct project field in case of multiple project fields
                    issueTypeSelect: issueTypeSelect,
                    projectIssueTypesSchemes: $projectIssueTypes,
                    issueTypeSchemeIssueDefaults: $defaultProjectIssueTypes
                });
            }
        });
    }

    JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function (e, context, reason) {
        if (reason !== JIRA.CONTENT_ADDED_REASON.panelRefreshed) {
            findProjectAndIssueTypeSelectAndConvertToPicker(context);
        }
    });

})();