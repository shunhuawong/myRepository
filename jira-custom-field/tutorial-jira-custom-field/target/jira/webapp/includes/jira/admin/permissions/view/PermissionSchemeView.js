define('jira/project/permissions/permissionschemeview', [
    'jquery',
    'backbone',
    'underscore',
    'internal/browser-metrics',
    'jira/project/permissions/permissiongroupview',
    'jira/project/permissions/addpermissionmodel',
    'jira/project/permissions/addpermissionview',
    'jira/project/permissions/deletepermissionview',
    'jira/flag'
], function(
    $,
    Backbone,
    _,
    metrics,
    PermissionsGroupView,
    AddPermissionModel,
    AddPermissionView,
    DeletePermissionView,
    jiraFlag) {
    "use strict";

    var METRIC_KEYS = {
        ADD_PERMISSION_DIALOG_OPEN: "jira.dialog.open.add-permission-dialog",
        DELETE_PERMISSION_DIALOG_OPEN: "jira.dialog.open.delete-permission-dialog"
    };

    return Backbone.View.extend({
        tagName: 'div',
        template: JIRA.Templates.ProjectPermissions.permissionScheme,
        events: {
            "click .js-grant-permission-trigger": "openAddDialog"
        },
        addDialogSelector: "#grant-project-permission-popup",
        deleteDialogSelector: "#delete-permission-dialog",

        initialize: function (attributes) {
            this.sharedProjects = attributes.sharedProjects || [];
            this.listenTo(this.model, "change", this.render);
        },
        render: function () {
            this.$el.html(this.template({
                id: this.model.get('id'),
                name: this.model.get('name'),
                description: this.model.get('description'),
                sharedProjects: this.sharedProjects
            }));

            var self = this;
            var grouping = self.model.get("displayRendering").grouping;
            var isReadOnly = self.model.isReadOnly();

            _.each(grouping, function (group) {
                var groupModel = self.model.getGroupModel(group);
                var groupView = new PermissionsGroupView({model: groupModel, readOnly: isReadOnly});
                self.$el.append(groupView.render().el);
                groupView.on({
                    "openAddDialog": self.openAddPermissionView,
                    "openDeleteDialog": self.openDeletePermissionView
                }, self);
            });

            this.trigger("renderDone", this.$el);

            return this;
        },

        openAddDialog:function(e) {
            e.preventDefault();
            this.openAddPermissionView();
        },

        openAddPermissionView: function (permissionKey) {
            metrics.start({
                key: METRIC_KEYS.ADD_PERMISSION_DIALOG_OPEN,
                isInital: false,
                threshold: 500
            });

            this.$el.append(JIRA.Templates.AddProjectPermission.renderPopupContent());

            var addModel = new AddPermissionModel({
                permissionSchemeId: this.model.get("id"),
                permissionKey: permissionKey
            });
            this._addView = new AddPermissionView({
                el: this.addDialogSelector,
                schemeModel: this.model,
                model: addModel
            });

            this._addView.on("permissionGranted", this.displayOperationSuccessMessage, this);
            this._addView.on("grantPermissionError", this.displayOperationFailureMessage, this);
            this._addView.once("contentLoaded", function() {
                metrics.end({
                    key: METRIC_KEYS.ADD_PERMISSION_DIALOG_OPEN
                });
            });

            this._addView.open();
            addModel.fetch();
        },

        openDeletePermissionView: function (permissionModel) {
            this.$el.append(JIRA.Templates.ProjectPermissions.deleteDialog({permissionName: permissionModel.get("permissionName")}));

            metrics.start({
                key: METRIC_KEYS.DELETE_PERMISSION_DIALOG_OPEN,
                isInital: false,
                threshold: 500
            });

            this._deleteView = new DeletePermissionView({
                el: this.deleteDialogSelector,
                model: permissionModel,
                permissionSchemeId: this.model.get("id")
            });

            this._deleteView.on("deleteCompleted", this.displayOperationSuccessMessage, this);
            this._deleteView.on("deletePermissionError", this.displayOperationFailureMessage, this);

            this._deleteView.once("contentLoaded", function() {
                metrics.end({
                    key: METRIC_KEYS.DELETE_PERMISSION_DIALOG_OPEN
                });
            });
            this._deleteView.open();
        },

        displayOperationSuccessMessage: function (response) {
            this.model.set(this.model.parse(response));

            // determining which flag type to show
            var displayFlagMethod;
            switch (response.operationResult.type) {
                case 'success':
                    displayFlagMethod = jiraFlag.showSuccessMsg;
                    break;
                case 'info':
                    displayFlagMethod = jiraFlag.showInfoMsg;
                    break;
                default:
                    return; // invalid flag type: no-op
            }

            displayFlagMethod(
                '',
                _.first(response.operationResult.messages),
                {
                    close: 'auto'
                }
            );
        },

        displayOperationFailureMessage: function (response) {
            var errors = this._extractErrorMessages(response);
            // specific error messages to be displayed
            if (errors.length > 0) {
                var title = AJS.I18n.getText('admin.permissions.feedback.feedbackerror.title.single');
                var messageBody = JIRA.Templates.ProjectPermissions.renderMessageList({messages: errors});

                if (errors.length > 1) {
                    title = AJS.I18n.getText('admin.permissions.feedback.feedbackerror.title.multiple');
                    messageBody = AJS.I18n.getText('admin.permissions.feedback.feedbackerror.desc') + messageBody;
                }

                jiraFlag.showWarningMsg(
                    title,
                    messageBody,
                    {
                        close: 'manual'
                    }
                );
            }
            // generic server error - for example: timeout
            else {
                jiraFlag.showWarningMsg(
                    AJS.I18n.getText('admin.permissions.feedback.unspecifiederror.title'),
                    AJS.I18n.getText('admin.permissions.feedback.unspecifiederror.description'),
                    {
                        close: 'manual'
                    }
                );
            }
        },

        /**
         * error messages can be returned from the server in two different (and incompatible) collections:
         * errors and errorsMessage. This helper function normalises their differences and returns a flat array with
         * the original error messages.
         * @param response from the server
         * @returns {Array} of messages
         * @private
         */
        _extractErrorMessages: function (response) {
            var errors = [];
            if (_.isObject(response) === false) {
                return errors;
            }

            // if present, errorMessages is an array
            if (_.isArray(response.errorMessages) === true && response.errorMessages.length > 0) {
                errors.push.apply(errors, _.clone(response.errorMessages));
            }
            if (_.isObject(response.errors) === true) {
                errors.push.apply(errors, _.collect(response.errors, function (message) {
                    return message;
                }));
            }

            return errors;
        }
    });
});
