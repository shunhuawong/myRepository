define('jira/project/permissions/permissionmodel', [
    'backbone'
], function(
    Backbone
) {
    "use strict";

    /**
     * @class
     * @extends Backbone.Model
     * @exports jira/project/permissions/permissionmodel
     * @property {Object} attributes
     * @property {String} attributes.permissionKey - key for the permission
     * @property {String} attributes.permissionName - name of the permission
     * @property {String} attributes.permissionDesc - description for the permission
     * @property {@link module:jira/project/permissions/grantcollection} attributes.grants
     *           - Granted assignments for permission
     */
    return Backbone.Model.extend({
        defaults: {
            permissionKey: null,
            permissionName: '',
            permissionDesc: '',
            grants: []
        }
    });
});


define('jira/project/permissions/permissioncollection', [
    'backbone',
    'jira/project/permissions/permissionmodel'
], function(
    Backbone,
    ProjectPermissionModel
) {
    "use strict";


    /**
     * @class
     * @extends Backbone.Collection
     * @exports jira/project/permissions/permissioncollection
     * @property {@link module:jira/project/permissions/permissionmodel} model - of the collection elements
     */
    return Backbone.Collection.extend({
        model: ProjectPermissionModel
    });
});
