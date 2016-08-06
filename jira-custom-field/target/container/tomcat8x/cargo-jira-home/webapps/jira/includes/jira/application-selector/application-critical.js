define("jira/admin/application-selector/application-critical", [
    'jira/admin/application-selector/application',
    'underscore'
], function (
    Application,
    _
) {
    return Application.extend({
        ui: _.extend({}, Application.prototype.ui, {
                "criticalWarning": ".application-warning"
            }
        ),

        getApplicationKey: function() {
            return this.ui.criticalWarning.data("key");
        },

        isDisabled: function() {
            return this.ui.label.hasClass("disabled");
        },

        setDisabled: function (disabled) {
            this.ui.label.toggleClass("disabled", disabled);
            return this;
        },

        isIndeterminateButNotEffective: function () {
            return false;
        },

        onIndeterminateChange: function (params) {
            this.ui.criticalWarning.toggleClass("effective", params.indeterminate);
            this.setDisabled(params.indeterminate);
        },

        onInlineWarningChange: function(params) {
            this.ui.criticalWarning.attr("aria-controls", params.controls);
        },

        _getNonIndeterminateWarningId: function () {
            return this.ui.criticalWarning.data("warningId");
        },

        // these functions are used in application-selector
        // but they work only in selectable application
        isSelected: function() {
            return false;
        },
        setSelected: function() {
        }

    });
});