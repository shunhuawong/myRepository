define('jira/project/permissions/grantmodel', [
    'backbone',
    'jira/project/permissions/securitytypes'
], function(
    Backbone,
    SecurityTypes
) {
    "use strict";

    /**
     * @typedef {Object} GrantValue
     * @property {String} displayValue - User readable value for the type of grant
     * @property {String} value - Id for the grant
     */

    /**
     * @class
     * @extends Backbone.Model
     * @exports jira/project/permissions/grantmodel
     * @property {Object} attributes
     * @property {String} attributes.displayName - name of the security type
     * @property {@link module:jira/project/permissions/securitytypes} attributes.securityType - grant security type
     * @property {[GrantValue]} attributes.values - Assigned permission ids
     */
    return Backbone.Model.extend({
        defaults: {
            displayName: '',
            securityType: null,
            values: []
        },

        validate: function() {
            switch (this.get("securityType")) {
                case SecurityTypes.SINGLE_USER:
                    // reject when there is no option selected. Expected format is an Array of a single element
                    var paramValue = this.get("securityTypeParamVal");
                    if (_.isArray(paramValue) === false || _.first(paramValue) === "") {
                        return "a.user.must.be.selected"; // not a translation key - it only indicates an error was found
                    }
                    break;
                default:
                    break;
            }

            // backbone requires no return to indicate validation was successful
        }
    });
});

define('jira/project/permissions/grantcollection', [
    'backbone',
    'underscore',
    'jira/project/permissions/grantmodel'
], function(
    Backbone,
    _,
    GrantModel
) {
    "use strict";

    /**
     * @class
     * @extends Backbone.Collection
     * @exports jira/project/permissions/grantcollection
     * @property {@link module:jira/project/permissions/grantmodel} model - of the collection elements
     */
    return Backbone.Collection.extend({
        model: GrantModel,
        /**
         * @returns {Object} An object with the current securityType and its value, if anything is selected. Returns
         * null if no security type is selected.
         */
        getSelectedData: function() {
            var selectedGrant = this.getSelectedModel();
            if(selectedGrant) {
                var result = {
                    securityType: selectedGrant.get("securityType")
                };
                var selectedParam = selectedGrant.get("securityTypeParamVal");
                if(selectedParam) {
                    result.value = _.isArray(selectedParam) ? _.first(selectedParam) : selectedParam;
                }
                return result;
            } else {
                return null;
            }
        },
        /**
         * @returns {@link module:jira/project/permissions/grantmodel} the model related to the type currently selected;
         * null if nothing is selected.
         */
        getSelectedModel: function() {
            return this.find(function(grantModel) { return grantModel.get("selected"); });
        }
    });
});