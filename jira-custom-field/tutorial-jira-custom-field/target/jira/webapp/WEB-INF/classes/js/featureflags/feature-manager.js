/**
 * Require this to check feature flags in javascript code.
 */
define("jira/featureflags/feature-manager", [
    "exports"
], function(
    exports
){

    // this has a mock in jira-components/jira-core/src/main/resources/js/setup-wrm-data-mock.js to be used in setup.
    var json = WRM.data.claim("jira.webresources:feature-flags.feature-flag-data");
    var systemEnabledFeatures = (json && json["enabled-feature-keys"]) || [];
    var featureFlagStates = (json && json["feature-flag-states"]) || {};

    var contains = function (arr, target) {
        return arr.indexOf(target) !== -1;
    };

    /**
     * Checks if the given feature is enabled. If no feature flag is defined with
     * the given feature key, this will fall-back to the default feature manager behaviour (like AJS.DarkFeatures.isEnabled(..))
     * @param featureKey a String, usually of the form "my.feature.key" (NOT "my.feature.key.enabled" or "my.feature.key.disabled")
     * @returns {boolean}
     */
    exports.isFeatureEnabled = function(featureKey){
        var flagState = featureFlagStates[featureKey];

        if(flagState === true){
            // Feature flag is in enabled state, check for (featureKey + ".disabled") to tell us otherwise
            var isSystemNegated = contains(systemEnabledFeatures, featureKey + ".disabled");
            return !isSystemNegated;
        }
        else if(flagState === false){
            // Disabled state, remain disabled unless (featureKey + ".enabled") is present
            var isSystemEnabled = contains(systemEnabledFeatures, featureKey + ".enabled");
            return isSystemEnabled;
        }
        else {
            // There is no flag defined with the given key, fall-back to what the system features say
            return contains(systemEnabledFeatures, featureKey);
        }
    };
});