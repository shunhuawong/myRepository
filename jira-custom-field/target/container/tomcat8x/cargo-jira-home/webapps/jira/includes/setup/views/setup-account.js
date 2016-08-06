define("jira/setup/setup-account-view", [
    "jquery",
    "backbone",
    "underscore",
    "jira/setup/setup-tracker",
    "jira/flag"
], function (
    $,
    Backbone,
    _,
    SetupTracker,
    Flag
) {
    var SetupAccountView =  Backbone.Marionette.ItemView.extend({

        ui: {
            "email": "#jira-setup-account-field-email",
            "username": "#jira-setup-account-field-username",
            "innerForm": ".jira-setup-account-contents",
            "form": ".jira-setup-form",
            "formField": ".jira-setup-account-form-field",
            "password": "#jira-setup-account-field-password",
            "retypePassword": "#jira-setup-account-field-retype-password",
            "submitButton": "#jira-setup-account-button-submit",

            "emailHidden": "#jira-setup-account-email-hidden",
            "usernameHidden": "#jira-setup-account-username-hidden",
            "licenseHidden": "#jira-setup-account-license-hidden",
            "passwordHidden": "#jira-setup-account-password-hidden"
        },

        events: {
            "submit @ui.form": "onSubmit",

            "input @ui.password": "onPasswordValueChanged",
            "input @ui.retypePassword": "onRetypePasswordValueChanged",
            "input @ui.email": "onEmailValueChanged",
            "input @ui.username": "onUsernameValueChanged",

            "blur @ui.password": "onFormElementFocusOut",
            "blur @ui.retypePassword": "onFormElementFocusOut",
            "blur @ui.email": "onFormElementFocusOut",
            "blur @ui.username": "onFormElementFocusOut"
        },

        initialize: function (options) {
            this.bindUIElements();

            this.errorTexts = this.ui.innerForm.data("error-texts");
            this.fields = {
                "email": {
                    "invalidEmail": this.errorTexts.invalidEmail,
                    "required": this.errorTexts.emailRequired
                },
                "password": {
                    "required": this.errorTexts.passwordRequired
                },
                "username": {
                    "required": this.errorTexts.usernameRequired,
                    "invalidUsername": this.errorTexts.invalidUsername,
                    "tooLongUsername": this.errorTexts.tooLongUsername
                },
                "retypePassword": {
                    "required": this.errorTexts.passwordRetypeRequired,
                    "passwordsMatch": this.errorTexts.passwordsDoNotMatch
                }
            };
            this.viewValidationState = {
                errors: {},
                decoratedFields: {},
                timeout: null
            };

            this.setupTracker = _.isEmpty(options.setupTracker) ? SetupTracker : options.setupTracker;

            this.ui.email.val(options.email);
            this.ui.password.val(options.password);
            this.ui.retypePassword.val(options.password);

            this.showLicenseState();
        },

        getValues: function () {
            var values = {};

            _.each(Object.keys(this.fields), function (name) {
                if (this.ui[name].length) {
                    values[name] = this.ui[name].val();
                }
            }, this);

            return values;
        },

        validate: function (values) {
            var errors = {};
            values = values || this.getValues();

            _.each(this.fields, function (fieldData, name) {
                if (!(name in values)) {
                    return;
                }

                if (fieldData.required && !values[name].length) {
                    errors[name] = fieldData.required;
                } else if (fieldData.invalidEmail && !this.validateEmailValue(values[name])){
                    errors[name] = fieldData.invalidEmail;
                } else if (fieldData.invalidUsername && !this.validateUsernameValue(values[name])){
                    errors[name] = fieldData.invalidUsername;
                } else if (fieldData.tooLongUsername && !this.validateUsernameLength(values[name])){
                    errors[name] = fieldData.tooLongUsername;
                } else if (fieldData.passwordsMatch && values["password"] && values["retypePassword"] &&
                            !(values["password"] == values["retypePassword"]) ) {
                    errors[name] = fieldData.passwordsMatch;
                }
            }, this);

            this.viewValidationState.errors = errors;

            return Object.keys(this.viewValidationState.errors).length === 0;
        },

        validateEmailValue: function (value) {
            // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
            // without &
            var emailRegex = /^[a-zA-Z0-9.!#$%'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if (value.length > 255) {
                return false;
            }
            return emailRegex.test(value);
        },

        validateUsernameValue: function (value) {
            if (value.indexOf('&') !== -1) {
                return false;
            } else if (value.indexOf('<') !== -1) {
                return false;
            } else if (value.indexOf('>') !== -1) {
                return false;
            } else if (value.indexOf(' ') !== -1) {
                return false;
            } else {
                return true;
            }
        },

        validateUsernameLength: function (value) {
            return value.length <= SetupAccountView.MAX_USERNAME_LEN;
        },

        onPasswordValueChanged: function() {
            this._handleFieldChange("password");
            this.ui.passwordHidden.val(this.ui.password.val());
        },

        onRetypePasswordValueChanged: function() {
            this._handleFieldChange("retypePassword");
        },

        onEmailValueChanged: function() {
            this._handleFieldChange("email");
            this._propagateEmailToUsername();
            this.ui.emailHidden.val(this.ui.email.val());
        },

        onUsernameValueChanged: function() {
            this._handleFieldChange("username");
            this.ui.usernameHidden.val(this.ui.username.val());
        },

        _propagateEmailToUsername: function() {
            // do not automatically adapt if there was user interaction
            if (!this.viewValidationState.decoratedFields["username"]) {
                var emailText = this.ui.email.val();
                var atSignIndex = emailText.indexOf('@');
                var username;
                if (atSignIndex < 0) {
                    // no at sign yet.
                    username = emailText;
                } else {
                    username = emailText.substring(0, atSignIndex);
                }
                this.ui.username.val(username);
                this.ui.usernameHidden.val(username);
            }
        },

        _handleFieldChange: function(field) {
            // clear errors for the edited field.
            delete this.viewValidationState.errors[field];

            // mark the field as target to render validation errors from now on
            this.viewValidationState.decoratedFields[field] = true;

            // clear errors on the edited field
            this._renderErrors([field]);

            // refresh timeout on error rendering
            var timeoutObj = this.viewValidationState.timeout;
            if (timeoutObj) {
                clearTimeout(timeoutObj);
            }

            // validate all values
            this.validate();

            // set timeout to render errors if the user stops typing
            this.viewValidationState.timeout = setTimeout(_.bind(this._renderErrors, this), SetupAccountView.VALIDATION_TIMEOUT);
        },

        onFormElementFocusOut: function() {

            // clear timeout on error rendering
            var timeoutObj = this.viewValidationState.timeout;
            if (timeoutObj) {
                clearTimeout(timeoutObj);
            }
            this._renderErrors();
        },

        _isLicensePresent: function () {
            var license = this.ui.licenseHidden.val();
            return !!license;
        },

        showLicenseState: function() {
            var flagTexts = this.ui.innerForm.data("flag-texts");
            if (this._isLicensePresent()) {
                // license made it OK:
                setTimeout(function() {
                    Flag.showSuccessMsg(flagTexts.successTitle, flagTexts.successContent, { close : "auto" });
                }, SetupAccountView.FLAG_TIMEOUT);
                this.setupTracker.sendUserArrivedFromMacSuccess();
            } else {
                setTimeout(function() {
                    Flag.showErrorMsg(flagTexts.errorTitle, flagTexts.errorContent, { close : "never" });
                }, SetupAccountView.FLAG_TIMEOUT);
                this.ui.submitButton.enable(false);
            }
        },

        _renderErrors: function(fields) {
            var that = this;
            // render errors only on fields touched by the user so far:
            fields = fields || Object.keys(this.viewValidationState.decoratedFields);
            _.each(fields, function (name) {
                var $field = that.ui[name];
                var $errorField = $field.siblings(".error");

                if (that.viewValidationState.errors[name]) {
                    $errorField.removeClass("hidden").html(that.viewValidationState.errors[name]);
                } else {
                    $errorField.empty().addClass("hidden");
                }
            });
        },

        onSubmit: function(e) {
            if (this.validate()) {
                this.ui.submitButton.enable(false);
            } else {
                e.preventDefault();

                // from now on, we want to render errors everywhere:
                _.each(Object.keys(this.fields), _.bind(function (key) {
                    this.viewValidationState.decoratedFields[key] = true;
                }, this));
                this._renderErrors();
            }
        }
    }, {
        FLAG_TIMEOUT: 1000,
        VALIDATION_TIMEOUT: 1200,
        MAX_USERNAME_LEN: 255
    });

    return SetupAccountView;
});