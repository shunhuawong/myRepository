define('jira/dropdown/element/issue-actions-trigger', [
    'jira/ajs/dropdown/dropdown',
    'jira/skate',
    'jquery'
], function(Dropdown, skate, $) {
    var TEMPLATE = JIRA.FRAGMENTS.issueActionsFragment;

    function getIssueActionFormatHandlers() {
        var options = {};

        if (JIRA.Issues && JIRA.Issues.Api) {
            options.ajaxOptions = {};
            options.ajaxOptions.formatError = JIRA.Issues.Api.showInlineIssueLoadError; // KickAss' override to the default error handling for AJAX content retriever error cases
        }

        return options;
    }

    /**
     * These are the "..." buttons you'll see within the issue tables,
     * either on the issue search results page or on lists of subtasks for an issue.
     *
     * @skate issue-actions-trigger
     */
    return skate('issue-actions-trigger', {
        type: skate.type.CLASSNAME,
        attached: function issueActionTriggerAttached(element) {
            var $trigger = $(element);
            var dropdownConfig = {
                hideOnScroll: '.issue-container',
                trigger: $trigger,
                ajaxOptions: {
                    dataType: 'json',
                    cache: false,
                    formatSuccess: TEMPLATE
                },
                onerror: function (instance) {
                    //Sometimes the layerController is left in a initializing state (race condition?)
                    //Reset it here just in case.
                    instance.layerController.initialized = true;
                    instance.hide();
                }
            };
            dropdownConfig = $.extend(true, dropdownConfig, getIssueActionFormatHandlers());
            new Dropdown(dropdownConfig);
            $trigger.addClass('trigger-happy');
        }
    });
});
