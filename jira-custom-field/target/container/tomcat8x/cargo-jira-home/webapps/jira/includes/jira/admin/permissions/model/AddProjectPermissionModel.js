define('jira/project/permissions/addpermissionmodel', [
    'backbone',
    'jquery',
    'jira/project/permissions/grantcollection',
    'wrm/context-path'
], function(Backbone, $, GrantCollection, contextPath) {
    "use strict";

    /**
     * @class
     * @extends Backbone.Model
     * @exports jira/project/permissions/addpermissionmodel
     * @property {Object} attributes
     * @property {@link jira/project/permissions/grantcollection} attributes.grantCollection - collection of possible
     *           grant permission types
     * @property {Boolean} attributes.showMore - whether more grant types should be displayed
     * @property {Boolean} attributes.submitDisabled - whether the submit button should be disabled
     */
    return Backbone.Model.extend({
        defaults: {
            grantCollection: null,
            showMore: null,
            submitDisabled: null
        },

        url: function() {
            return this.addModelUrl;
        },

        initialize:function(attributes) {
            this.permissionSchemeId = attributes.permissionSchemeId;
            this.permissionKey = attributes.permissionKey;

            if (this.permissionKey) {
                this.addModelUrl = contextPath() + "/rest/internal/2/managedpermissionscheme/" + this.permissionSchemeId + "/" + this.permissionKey;
            } else {
                this.addModelUrl = contextPath() + "/rest/internal/2/managedpermissionscheme/securitytypes";
            }
        },

        toggleShowMore: function() {
            this.set("showMore", !this.get("showMore"));
        },

        parse:function(data) {
            var newData = $.extend({}, data);

            newData.grantCollection = new GrantCollection(data.primarySecurityType);
            newData.grantCollection.forEach(function(model) {
                model.set("primary", true);
            });
            newData.grantCollection.add(data.secondarySecurityType);

            return newData;
        }
    });
});