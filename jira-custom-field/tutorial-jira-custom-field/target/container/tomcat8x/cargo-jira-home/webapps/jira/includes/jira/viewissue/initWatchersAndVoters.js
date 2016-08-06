require([
    'jira/viewissue/watchers-voters/watchers',
    'jira/viewissue/watchers-voters/voters',
    'jira/viewissue/watchers-voters/toggler'
], function() {
    // Watchers and voters initialised
});

//
// Legacy namespacing for watchers and voters
// Deprecated since JIRA 7.1
//
AJS.namespace('JIRA.VotersUsersCollection', null, require('jira/viewissue/watchers-voters/entities/voters-user-collection'));
AJS.namespace('JIRA.WatchersUsersCollection', null, require('jira/viewissue/watchers-voters/entities/watchers-user-collection'));
AJS.namespace('JIRA.VotersView', null, require('jira/viewissue/watchers-voters/views/voters-view'));

AJS.namespace('JIRA.WatchersView', null, require('jira/viewissue/watchers-voters/views/watchers-view'));
AJS.namespace('JIRA.WatchersNoBrowseView', null, require('jira/viewissue/watchers-voters/views/watchers-no-browse-view'));
AJS.namespace('JIRA.WatchersReadOnly', null, require('jira/viewissue/watchers-voters/views/watchers-read-only-view'));
