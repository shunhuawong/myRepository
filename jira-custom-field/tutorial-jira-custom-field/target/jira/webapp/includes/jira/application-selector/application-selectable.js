define("jira/admin/application-selector/application-selectable", [
    'jira/admin/application-selector/application',
    'underscore'
], function (
    Application,
    _
) {
    return Application.extend({
        ui: _.extend({}, Application.prototype.ui, {
                "checkbox": "input[type=checkbox]",
                "undefinedApplicationDialog": ".application-not-defined-dialog"
            }
        ),

        events: {
            "change @ui.checkbox": function (event, parameters) {
                var manual = true;
                if (parameters && !parameters.manual) {
                    manual = false;
                }

                this.hideEffectiveWarning();

                this.trigger(Application.TOGGLE_EVENT, { manual: manual });

                if (!this.isDefined()) {
                    var dialog = this.getUndefinedWarning();
                    if (this.isSelected()) {
                        this.trigger(Application.WARNING_DIALOG_OPENED_EVENT, {
                            type: Application.WARNINGS.NONEFFECTIVE
                        });
                        if (this.options.disableUndefinedWarningDisplaying !== true) {
                            this.displayWarning(Application.WARNINGS.NONEFFECTIVE);
                        }
                    } else {
                        dialog.hide();
                    }
                }
            }
        },

        getApplicationKey: function() {
            return this.ui.checkbox.data("key");
        },

        getEffective: function() {
            return this.ui.checkbox.data("effective") || [];
        },

        isDisabled: function() {
            return this.ui.checkbox.prop("disabled");
        },

        setDisabled: function (disabled) {
            this.ui.checkbox.prop("disabled", disabled);
            return this;
        },

        isDefined: function() {
            return this.ui.checkbox.attr("data-defined") === "true";
        },

        isSelected: function() {
            return this.ui.checkbox.prop("checked");
        },

        setSelected: function(checked) {
            if (checked !== this.isSelected()) {
                this.ui.checkbox.prop("checked", checked);
                this.ui.checkbox.trigger('change', {
                    manual: false
                });
            }
        },

        isIndeterminateButNotEffective: function () {
            return this.ui.checkbox.data("indeterminate") === "indeterminate";
        },

        onIndeterminateChange: function (params) {
            this.ui.checkbox.prop("indeterminate", params.indeterminate);
        },

        getUndefinedWarning: function() {
            return this.ui.undefinedApplicationDialog.get(0);
        },

        onInlineWarningChange: function(params) {
            this.ui.checkbox.attr("aria-controls", params.controls);
        },

        _getNonIndeterminateWarningId: function () {
            return this.ui.undefinedApplicationDialog.prop("id");
        },

        displayWarning: function(type) {
            if (type === Application.WARNINGS.NONEFFECTIVE) {
                this.changeInlineWarning(Application.WARNINGS.NONEFFECTIVE);
                this.getUndefinedWarning().show();
            }
            else {
                Application.prototype.displayWarning.call(this, type);
            }
        }
    });
});