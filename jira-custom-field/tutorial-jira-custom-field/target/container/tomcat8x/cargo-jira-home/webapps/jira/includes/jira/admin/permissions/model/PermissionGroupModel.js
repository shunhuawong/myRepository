define('jira/project/permissions/permissiongroupmodel', [
    'backbone'
], function(
    Backbone
) {
    "use strict";

    /**
     * @class
     * @extends Backbone.Model
     * @exports jira/project/permissions/permissiongroupmodel
     * @property {Object} attributes
     * @property {String} attributes.heading - the group title, e.g. Project Permissions
     * @property {@link module:jira/project/permissions/permissioncollection} attributes.permissions - permissions in this group
     */
    return Backbone.Model.extend({
        defaults: {
            heading: '',
            permissions: []
        }
    });
});
