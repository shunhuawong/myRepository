define('jira/project/permissions/deletepermissionview', [
    'backbone',
    'jquery',
    'underscore',
    'jira/project/permissions/securitytypes'
], function (Backbone,
             $,
             _,
             SecurityTypes) {
    "use strict";

    return Backbone.View.extend({
        template: JIRA.Templates.ProjectPermissions.deleteDialog,

        events: {
            'change .js-delete-grant': '_handleGrantClick',
            'click #dialog-save-button': '_handleSubmitEvent',
            'click #dialog-close-button': 'close'
        },

        initialize: function (attributes) {
            this.grantsToRemove = [];
            this.permissionSchemeId = attributes.permissionSchemeId;
            this.model.on('change:submitDisabled', _.bind(this._handleSubmitState, this));
            this.model.on('change:grants', _.bind(this.render, this));
            this.dialog = AJS.dialog2(this.$el);
        },

        /**
         * Open the dialog and renders the content
         */
        open: function () {
            this.dialog.show();
            this.dialog.on('hide', _.bind(this.close, this));
            this.render();
            this.trigger('contentLoaded');
        },

        /**
         * Renders the content of the dialog
         */
        render: function () {
            var grantsContainer = this.$('.grants');
            var self = this;

            _.each(this.model.get('grants'), function (grant) {
                grantsContainer.append(self._renderDeleteGrantControl(grant));
            });

            this.model.set('submitDisabled', true);
            this._checkFirstCheckboxIfOnlyOneExists();
        },

        /**
         * @returns {boolean} if the delete permission can be submitted
         */
        canSubmit: function () {
            return !this.model.get('submitDisabled');
        },

        /**
         * If we are in a state where we can submit, submit and close the dialog.
         */
        submit: function () {
            if (this.canSubmit()) {
                this._removeGrants();
            }
        },

        /**
         * Closes the dialog.
         */
        close: function () {
            this.remove();
            this.dialog.remove();
        },


        _checkFirstCheckboxIfOnlyOneExists: function () {
            var checkboxes = this.$('.js-delete-grant');
            if (checkboxes.length === 1) {
                $(checkboxes[0]).prop('checked', true).change();
            }
        },

        _handleGrantClick: function (e) {
            var grantValue = parseInt($(e.target).val());
            if (e.target.checked) {
                this.grantsToRemove.push(grantValue);
            } else {
                this.grantsToRemove = _.without(this.grantsToRemove, grantValue);
            }

            this._determineSubmitState();
        },

        _determineSubmitState: function () {
            this.model.set('submitDisabled', this.grantsToRemove.length === 0);
        },

        _removeGrants: function () {
            var context = this;
            context._disableAllFields();
            $.ajax({
                url: AJS.contextPath() + "/rest/internal/2/managedpermissionscheme/" + this.permissionSchemeId,
                type: "DELETE",
                data: JSON.stringify({"grantsToDelete": this.grantsToRemove}),
                contentType: "application/json",
                success: function (response) {
                    context.trigger("deleteCompleted", response);
                    context.close();
                },
                error: function (response) {
                    response = response.responseText ? JSON.parse(response.responseText) : {};
                    context.trigger("deletePermissionError", response);
                    context._enableAllFields();
                }
            });
        },

        _disableAllFields: function () {
            this.$el.find('input, button').attr('aria-disabled', 'true').attr('disabled', 'disabled');
        },

        _enableAllFields: function () {
            this.$el.find('input, button').attr('aria-disabled', 'false').removeAttr('disabled');
        },

        _handleSubmitEvent: function (e) {
            e.preventDefault();

            this.submit();
        },

        _renderDeleteGrantControl: function (grant) {
            var data = grant;
            if (grant.securityType === SecurityTypes.GROUP) {
                data = $.extend({emptyDisplayName: AJS.I18n.getText('admin.common.words.anyone')}, grant);
            } else if (grant.securityType === SecurityTypes.APPLICATION_ROLE) {
                data = $.extend({emptyDisplayName: AJS.I18n.getText('admin.permission.types.application.role.any')}, grant);
            }
            return JIRA.Templates.ProjectPermissions.deleteGrant(data);
        },

        _handleSubmitState: function () {
            this.dialog.$el.find('#dialog-save-button').attr('aria-disabled', this.model.get('submitDisabled'));
        }
    });
});