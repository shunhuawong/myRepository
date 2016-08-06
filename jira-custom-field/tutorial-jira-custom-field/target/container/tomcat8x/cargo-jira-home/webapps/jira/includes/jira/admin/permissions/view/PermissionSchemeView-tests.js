AJS.test.require('jira.webresources:projectpermissions', function() {
    var $ = require('jquery');
    var _ = require('underscore');
    var PermissionSchemeModel = require('jira/project/permissions/permissionschememodel');

    var ADD_COMMENT_PERMISSION = {
        permissionKey: 'ADD_COMMENTS',
        permissionName: 'Add comments',
        permissionDesc: 'Adding comments',
        grants: [
            {
                displayName: 'Application Role',
                securityType: 'applicationRole',
                values: [{
                    id: 1,
                    displayValue: 'Administrators'
                }]
            }
        ]
    };

    var REMOVE_COMMENT_PERMISSION = {
        permissionKey: 'REMOVE_COMMENTS',
        permissionName: 'Remove comments',
        permissionDesc: 'Removing comments',
        grants: [
            {
                displayName: 'Application Role',
                securityType: 'applicationRole',
                values: [{
                    id: 2
                }]
            }
        ]
    };

    var CREATE_PROJECTS_PERMISSION = {
        permissionKey: 'CREATE_PROJECTS',
        permissionName: 'Create projects',
        permissionDesc: 'Creating projects',
        grants: [
            {
                displayName: 'Application Role',
                securityType: 'applicationRole',
                values: [{id: 1}]
            }
        ]
    };


    var ISSUE_PERMISSIONS_GROUP = {
        heading: 'Issue Permissions',
        sectionType: 'issue',
        permissions: [ADD_COMMENT_PERMISSION.permissionKey, REMOVE_COMMENT_PERMISSION.permissionKey]
    };

    var PROJECT_PERMISSIONS_GROUP = {
        heading: 'Project Permissions',
        sectionType: 'project',
        permissions: [CREATE_PROJECTS_PERMISSION.permissionKey]
    };

    /**
     * Creates a complete set of models and collections to render this view. As this view groups all other views to render
     * the final dialog, it requires a slightly complex combination of models.
     *
     * @returns {{schemeModel: {PermissionSchemeModel}, addModel: {AddPermissionModel}}}
     */
    function getMockPermissionSchemeModel(server) {
        var schemeModel = new PermissionSchemeModel({
            id: 12345
        });

        schemeModel.fetch();

        server.requests[0].respond(
                200,
                {
                    'Content-Type': 'application/json'
                },
                JSON.stringify({
                    name: 'test scheme',
                    description: 'test scheme',
                    displayRendering: {
                        readOnly: false,
                        grouping: [
                            ISSUE_PERMISSIONS_GROUP,
                            PROJECT_PERMISSIONS_GROUP
                        ]
                    },
                    permissions: [
                        ADD_COMMENT_PERMISSION, REMOVE_COMMENT_PERMISSION, CREATE_PROJECTS_PERMISSION
                    ]
                })
            );

        return schemeModel;
    }

    function mockPermissionSchemeView() {
        this.context = AJS.test.context();

        this.mockMetrics = {
            start: sinon.spy(),
            end: sinon.spy()
        };

        this.mockOpen = sinon.spy();

        this.mockAddPermissionView = Backbone.View.extend({
            open: this.mockOpen,
            render: _.noop
        });

        this.mockDeletePermissionView = Backbone.View.extend({
            open: this.mockOpen,
            render: _.noop
        });

        this.context.mock('internal/browser-metrics', this.mockMetrics);
        this.context.mock('jira/project/permissions/addpermissionview', this.mockAddPermissionView);
        this.context.mock('jira/project/permissions/deletepermissionview', this.mockDeletePermissionView);

        return this.context.require('jira/project/permissions/permissionschemeview');
    }

    module('Dialog rendering', {
        setup: function() {
            var PermissionSchemeView = mockPermissionSchemeView.call(this);

            this.sandbox = sinon.sandbox.create({useFakeServer: true});

            this.schemeModel = getMockPermissionSchemeModel(this.sandbox.server);

            this.view = new PermissionSchemeView({
                el: $('#qunit-fixture'),
                model: this.schemeModel
            });

            this.view.render();
        },

        teardown: function() {
            this.sandbox.restore();
        }
    });

    test('Ensure all permission groups are rendered correctly', function() {
        var permissionGroups = this.view.$el.find('.permissions-group');

        strictEqual(permissionGroups.length, 2, 'Should have two permission groups');

        strictEqual(AJS.$('.project-permissions-category-header', permissionGroups[0]).text(), ISSUE_PERMISSIONS_GROUP.heading,
            'First permission group should be issue permissions');

        strictEqual(AJS.$('.project-permissions-category-header', permissionGroups[1]).text(), PROJECT_PERMISSIONS_GROUP.heading,
            'Second permission group should be project permissions');
    });

    test('Ensure permission group content is rendered correctly', function() {
        var issuePermissionGroup = this.view.$el.find('.permissions-group').first();

        var permissions = AJS.$('.jira-admin-table tbody tr', issuePermissionGroup);
        var numberPermissionsInGroup = permissions.length;

        strictEqual(numberPermissionsInGroup, ISSUE_PERMISSIONS_GROUP.permissions.length, 'Should have the correct number of permissions in group');

        var addCommentPermission = permissions.first();

        strictEqual(addCommentPermission.find('.title').text(), ADD_COMMENT_PERMISSION.permissionName, 'Should have rendered permission title');
        strictEqual(addCommentPermission.find('.description').text(), ADD_COMMENT_PERMISSION.permissionDesc, 'Should have rendered permission description');

        var addCommentGrants = addCommentPermission.find('.grants dl.types');

        var numberGrants = addCommentGrants.find('dt').length;
        strictEqual(numberGrants, ADD_COMMENT_PERMISSION.grants.length, 'Add Comment should have the right number of grants');

        strictEqual(addCommentGrants.find('dt').text(), ADD_COMMENT_PERMISSION.grants[0].displayName, 'Should have application role title');
        strictEqual(addCommentGrants.find('dd').text(), ADD_COMMENT_PERMISSION.grants[0].values[0].displayValue,
            'Should have the administration application role grant')
    });

    test('Ensure on an add event browser metrics are started and ended', function() {
        var addCommentPermission = this.view.$el.find('.permissions-group').first().find('.jira-admin-table tbody tr').first();

        ok(!this.mockOpen.called, 'Should not have called the open function yet');
        ok(!this.mockMetrics.start.called, 'Should not have started metrics yet');
        ok(!this.mockMetrics.end.called, 'Should not have ended metrics, considering it hasn\'t started');

        addCommentPermission.find('.add-trigger').click();

        ok(this.mockOpen.called, 'Should have called the open function');
        ok(this.mockMetrics.start.called, 'Start of metrics should have been begun');
        ok(!this.mockMetrics.end.called, 'End of metrics should not have been called until rendered');

        this.view._addView.trigger('contentLoaded');

        ok(this.mockMetrics.end.called, 'End of metrics should now have been called');
    });

    test('Ensure on delete event browser metrics are started and ended', function() {
        var addCommentPermission = this.view.$el.find('.permissions-group').first().find('.jira-admin-table tbody tr').first();


        ok(!this.mockOpen.called, 'Should not have called the open function yet');
        ok(!this.mockMetrics.start.called, 'Should not have started metrics yet');
        ok(!this.mockMetrics.end.called, 'Should not have ended metrics, considering it hasn\'t started');

        addCommentPermission.find('.delete-trigger').click();

        ok(this.mockOpen.called, 'Should have called the open function');
        ok(this.mockMetrics.start.called, 'Start of metrics should have been begun');
        ok(!this.mockMetrics.end.called, 'End of metrics should not have been called until rendered');

        this.view._deleteView.trigger('contentLoaded');

        ok(this.mockMetrics.end.called, 'End of metrics should now have been called');
    });

    var view;

    module('Rendering feedback messages', {
        setup: function () {
            this.sandbox = sinon.sandbox.create({useFakeServer: true});

            var PermissionSchemeView = mockPermissionSchemeView.call(this);

            var model = getMockPermissionSchemeModel(this.sandbox.server);
            view = new PermissionSchemeView({
                model: model
            });
        },
        teardown: function () {
            // dismiss any visible flags
            $('.aui-flag .icon-close').click();
            this.sandbox.restore();
        }
    });

    test('null server response renders generic error message', function () {
        view.displayOperationFailureMessage(/* nothing */);

        assertFlagPresenceByTitleAndType('admin.permissions.feedback.unspecifiederror.title', 'warning');
        assertFlagPresenceByBodyText('admin.permissions.feedback.unspecifiederror.description');
    });

    test('server response with empty errorMessages renders generic error message', function () {
        view.displayOperationFailureMessage({
            errorMessages: []
        });

        assertFlagPresenceByTitleAndType('admin.permissions.feedback.unspecifiederror.title', 'warning');
        assertFlagPresenceByBodyText('admin.permissions.feedback.unspecifiederror.description');
    });

    test('server response with a single item in errorMessages collection renders correct message', function () {
        view.displayOperationFailureMessage({
            errorMessages: ['only a single error somewhere']
        });

        assertFlagPresenceByTitleAndType('admin.permissions.feedback.feedbackerror.title.single', 'warning');
    });

    test('server response with multiple items in errorMessages collection renders correct message', function () {
        view.displayOperationFailureMessage({
            errorMessages: ['error #1', 'error #2']
        });

        assertFlagPresenceByTitleAndType('admin.permissions.feedback.feedbackerror.title.multiple', 'warning');
        assertFlagPresenceByBodyText('admin.permissions.feedback.feedbackerror.desc');
    });

    test('server response without unknown result type renders no message', function () {
        view.displayOperationSuccessMessage({
            operationResult: {
                type: 'invalid-type'
            }
        });

        strictEqual(getVisibleFlags().size(), 0, 'no flags should be visible');
    });

    test('server response with success result type renders success message', function () {
        var messageText = 'This should be a success message!';

        view.displayOperationSuccessMessage({
            operationResult: {
                type: 'success',
                messages: [
                    messageText
                ]
            }
        });

        assertFlagPresenceByBodyTextAndType(messageText, 'success');
    });

    test('server response with info result type renders info message', function () {
        var messageText = 'This should be an info message!';

        view.displayOperationSuccessMessage({
            operationResult: {
                type: 'info',
                messages: [
                    messageText
                ]
            }
        });

        assertFlagPresenceByBodyTextAndType(messageText, 'info');
    });

    test('server response with multiple messages should render only the first one', function () {
        var messageText = 'This is the expected message to be rendered';

        view.displayOperationSuccessMessage({
            operationResult: {
                type: 'success',
                messages: [
                    messageText,
                    'This message should not be rendered in the Project Permissions page'
                ]
            }
        });

        assertFlagPresenceByBodyTextAndType(messageText, 'success');
    });

    function assertFlagPresenceByTitle(title) {
        var $flag = $('#aui-flag-container .aui-flag[aria-hidden=false] .title:contains(' + title + ')');
        strictEqual($flag.size(), 1, 'a flag with title "' + title + '" was expected');
        return $flag.parent();
    }

    function assertFlagPresenceByTitleAndType(title, type) {
        var $flag = assertFlagPresenceByTitle(title);
        assertFlagType($flag, type);
    }

    function assertFlagPresenceByBodyText(text) {
        var $flag = $('#aui-flag-container .aui-flag[aria-hidden=false] .aui-message').contents().filter(function () {
            return this.nodeType === 3 && this.nodeValue.indexOf(text) !== -1;
        });
        strictEqual($flag.size(), 1, 'a flag with body text "' + text + '" was expected');
        return $flag.parents('.aui-message');
    }

    function assertFlagPresenceByBodyTextAndType(text, type) {
        var $flag = assertFlagPresenceByBodyText(text);
        assertFlagType($flag, type);
    }

    function assertFlagType($flag, type) {
        strictEqual($flag.is('.aui-message-' + type), true, 'expected flag have class aui-message-' + type);
    }

    function getVisibleFlags() {
        return $('#aui-flag-container .aui-flag[aria-hidden=false]');
    }
});