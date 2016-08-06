define('jira/project/permissions/permissiongroupview', [
    'backbone',
    'jira/project/permissions/permissionrowview'
], function(
    Backbone,
    PermissionRowView
) {
    "use strict";

    return Backbone.View.extend({
        tagName:'div',
        className:'permissions-group',
        template: JIRA.Templates.ProjectPermissions.permissionTable,

        initialize: function(attributes) {
            this.readOnly = attributes.readOnly;
            this.listenTo(this.model, "change", this.render);
        },
        render: function() {
            // avoid rendering a table that will have no content
            if (this.model.get("permissions").length === 0) {
                return this;
            }

            this.$el.html(this.template({
                heading: this.model.get('heading'),
                readOnly: this.readOnly
            }));

            var tableBody = this.$("tbody");
            var self = this;

            this.model.get("permissions").each(function(permissionModel) {
                var rowView = new PermissionRowView({model: permissionModel, readOnly: self.readOnly});
                rowView.on("openAddDialog", function(permissionKey) {
                    self.trigger("openAddDialog", permissionKey);
                }).on("openDeleteDialog", function(model) {
                    self.trigger("openDeleteDialog", model);
                });
                tableBody.append(rowView.render().el);
            });
            return this;
        }
    });
});