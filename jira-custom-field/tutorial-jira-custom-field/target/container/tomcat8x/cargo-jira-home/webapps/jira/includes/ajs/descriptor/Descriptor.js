define('jira/ajs/descriptor', [
    'jira/lib/class',
    'jquery'
], function(
    Class,
    $
) {

    /**
     * An abstract class used to maintain complex descriptors
     * @abstract
     * @class Descriptor
     * @extends Class
     */
    return Class.extend({

        /**
         * @param {Object} properties - descriptor properties
         * @constructs
         */
        init: function (properties) {
            if (this._validate(properties)) {
                this.properties = $.extend(this._getDefaultOptions(), properties);
            }
        },

        /**
         * Gets all properties
         *
         * @return {Object}
         */
        allProperties: function () {
            return this.properties;
        },

        /**
         * Ensures all required properites are defined otherwise throws error
         *
         * @protected
         */
        _validate: function (properties) {
            if (this.REQUIRED_PROPERTIES) {
                $.each(this.REQUIRED_PROPERTIES, function (name) {
                    if (typeof properties[name] === "undefined") {
                        throw new Error("AJS.Descriptor: expected property [" + name + "] but was undefined");
                    }
                });
            }
            return true;
        }
    });

});

AJS.namespace('AJS.Descriptor', null, require('jira/ajs/descriptor'));