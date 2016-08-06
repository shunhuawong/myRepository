/**
 * Initialises project picker frother fields
 *
 * Please not that project fields interact with issue type fields in create issue. This interation is handled in
 * initIssueTypeSelect.js
 */
(function() {
    var ScrollableSingleSelect = require('jira/ajs/select/scrollable-single-select');
    var SuggestionCollectionModel = require('jira/ajs/select/suggestion-collection-model');

    function createProjectPicker(context) {
        context.find(".project-field").each(function () {
            new ScrollableSingleSelect({
                element: this,
                revertOnInvalid: true,
                pageSize: 50,
                pagingThreshold: 100,
                model: SuggestionCollectionModel
            });
        });
    }

    JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function (e, context, reason) {
        if (reason !== JIRA.CONTENT_ADDED_REASON.panelRefreshed) {
            createProjectPicker(context);
        }
    });

})();
