define('jira/project/permissions/permissionrowview', [
    'backbone',
    'jira/project/permissions/grantsview'
], function(
    Backbone,
    GrantsView
) {
    "use strict";

    return Backbone.View.extend({
        tagName:'tr',
        template: JIRA.Templates.ProjectPermissions.permissionRow,
        events: {
            "click .add-trigger": "openAddDialog",
            "click .delete-trigger": "openDeleteDialog"
        },
        initialize: function(attributes) {
            this.readOnly = attributes.readOnly
        },
        render: function() {
            this.$el.html(this.template({
                permissionName:this.model.get("permissionName"),
                permissionDescription: this.model.get("permissionDesc"),
                grants: this.model.get("grants"),
                readOnly: this.readOnly
            }));

            this.$(".grants").append(new GrantsView({grants: this.model.get("grants")}).render().el);
            return this;
        },

        attributes: function() {
            var attr = [];
            attr["data-permission-key"] = this.model.get("permissionKey");
            return attr;
        },

        openAddDialog:function(e) {
            e.preventDefault();
            this.trigger("openAddDialog", this.model.get("permissionKey"));
        },
        openDeleteDialog:function(e) {
            e.preventDefault();
            this.trigger("openDeleteDialog", this.model);
        }
    });
});