/**
 * Reports bulk move events to analytics.
 */
(function () {
    var $ = require('jquery');

    $(function () {
        var groupsAll = $('.bulk-group').length;
        if (groupsAll > 0) {
            var groupsSubtaskToIssue = $('.subtask-to-issue').length;
            var groupsIssueToSubtask = $('.issue-to-subtask').length;
            var groupsSubtaskToSubtask = $('.subtask-to-subtask').length;

            AJS.trigger('analyticsEvent', {
                name: "jira.bulk.move.page.confirmation.groups",
                data: {
                    all: groupsAll,
                    subtaskToIssue: groupsSubtaskToIssue,
                    issueToSubtask: groupsIssueToSubtask,
                    subtaskToSubtask: groupsSubtaskToSubtask
                }
            });
        }
    });
})();
