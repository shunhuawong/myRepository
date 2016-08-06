AJS.test.require("jira.webresources:jira-setup", function(){
    var $ = require("jquery");
    var _ = require("underscore");
    var View = require("jira/setup/setup-account-view");
    var Flag = require("jira/flag");

    var assert = sinon.assert;
    var match = sinon.match;

    var errorTexts = {
        invalidEmail: "invalidEmail",
        emailRequired: "emailRequired",
        passwordRequired: "passwordRequired",
        usernameRequired: "usernameRequired",
        invalidUsername: "invalidUsername",
        tooLongUsername: "tooLongUsername",
        passwordRetypeRequired: "passwordRetypeRequired",
        passwordsDoNotMatch: "passwordsDoNotMatch"
    };
    var flagTexts = {
        successTitle: "successTitle",
        successContent: "successContent",
        errorTitle: "errorTitle",
        errorContent: "errorContent"
    };

    var markup = JIRA.Templates.Setup.Account.pageContent({
        productLicense: 'SomeLicenseText',
        errorTextsJson: JSON.stringify(errorTexts),
        licenseFlagTextsJson: JSON.stringify(flagTexts)
    });

    var setFieldValue = function($field, value) {
        $field.val(value);
        $field.trigger("input");
        // input causes the validation to happen after a time delay, but blur triggers it right away.
        // for this helper, trigger it right away:
        $field.trigger("blur");
    };

    var errorFieldOf = function($field) {
        return $field.siblings(".error");
    };

    var hasNoErrors = function($field) {
        var $errorField = errorFieldOf($field);
        equal($errorField.hasClass("hidden"), true, "Errors container is visible");
        return $errorField;
    };

    var hasErrors = function($field) {
        var $errorField = errorFieldOf($field);
        equal($errorField.hasClass("hidden"), false, "Errors container is not visible");
        return $errorField;
    };

    var getErrorText = function($field) {
        return hasErrors($field).html();
    };



    function _setUpFixture(markupContent) {
        $("#qunit-fixture").empty().append(
            $("<div></div>")
                .addClass("jira-setup-basic-form")
                .html(markupContent)
        );
    }

    module("JIRA Instant Setup Admin Account", {
        setup: function(){
            this.sandbox = sinon.sandbox.create({
                useFakeTimers: true
            });

            this.sandbox.stub(Flag, "showSuccessMsg");

            _setUpFixture(markup);
        },

        teardown: function(){
            this.sandbox.restore();
        },

        initializeView: function(){
            this.testObj = new View({
                el: ".setup-account-view-container"
            });
            this.testObj.bindUIElements();
        }
    });

    test("submit button should be disabled when no license is present", function(){
        // given no license
        _setUpFixture(JIRA.Templates.Setup.Account.pageContent({})); // no license
        this.sandbox.stub(Flag, "showErrorMsg");

        // when
        this.initializeView();

        // then
        equal(this.testObj.ui.submitButton.is(':disabled'), true, "submit button is disabled by default");
    });

    test("error flag should be displayed when no license is present", function(){
        // given no license:
        _setUpFixture(JIRA.Templates.Setup.Account.pageContent({
            licenseFlagTextsJson: JSON.stringify(flagTexts)
        }));
        this.sandbox.stub(Flag, "showErrorMsg");

        // when
        this.initializeView();

        // then
        this.sandbox.clock.tick(View.FLAG_TIMEOUT - 1);
        assert.notCalled(Flag.showErrorMsg);
        this.sandbox.clock.tick(1);
        assert.calledOnce(Flag.showErrorMsg);
        assert.calledWith(Flag.showErrorMsg,
            flagTexts.errorTitle, flagTexts.errorContent, match({close: "never"}));
    });

    test("submit button should be enabled when license is provided", function(){
        // when
        this.initializeView();

        // then
        equal(this.testObj.ui.submitButton.is(':disabled'), false, "submit button is enabled when license is present");
    });

    test("success flag should be displayed when license is provided", function(){
        // when
        this.initializeView();

        // then
        this.sandbox.clock.tick(View.FLAG_TIMEOUT - 1);
        assert.notCalled(Flag.showSuccessMsg);
        this.sandbox.clock.tick(1);
        assert.calledOnce(Flag.showSuccessMsg);
        assert.calledWith(Flag.showSuccessMsg,
            flagTexts.successTitle, flagTexts.successContent, match({close: "auto"}));
    });

    test("errors are displayed on all fields when next button is pressed", function(){
        // when
        this.initializeView();
        this.testObj.ui.submitButton.trigger("click");

        // then
        _.each(this.testObj.fields, function (fieldData, name) {
            equal(errorFieldOf(this.testObj.ui[name]).hasClass("hidden"), false, "Field " + name + " should have errors");
        }, this);
    });

    test("email is required", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.email, "");

        // then
        equal(getErrorText(this.testObj.ui.email), errorTexts.emailRequired, "Email required information should be displayed");
    });

    test("email is invalid", function(){
        // when
        this.initializeView();

        _.each(
            [  // invalid emails
                "aString",
                "aStringFinishingWith@",
                "aStringWith@butEndsIn.",
                "a string containing @ but also space"
            ],
            _.bind(function(data) {
                setFieldValue(this.testObj.ui.email, data);

                // then
                equal(getErrorText(this.testObj.ui.email), errorTexts.invalidEmail, "Email invalid error should be displayed for email: " + data);
            }, this)
        );
    });

    test("username is required", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.username, "");

        // then
        equal(getErrorText(this.testObj.ui.username), errorTexts.usernameRequired, "Username required error should be displayed");
    });

    test("username is too long", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.username, _.range(View.MAX_USERNAME_LEN+1).map(function() { return "x"}).join(""));

        // then
        equal(getErrorText(this.testObj.ui.username), errorTexts.tooLongUsername, "Username too long error should be displayed");

        // but when
        setFieldValue(this.testObj.ui.username, _.range(View.MAX_USERNAME_LEN).map(function() { return "x"}).join(""));

        // then
        hasNoErrors(this.testObj.ui.username)
    });

    test("username is invalid", function(){
        // when
        this.initializeView();

        _.each([ // invalid usernames
            "aStringContaining&",
            "aStringContaining<",
            "aStringContaining>",
            "a string containing space"
        ], _.bind(function(data) {
            setFieldValue(this.testObj.ui.username, data);

            // then
            equal(getErrorText(this.testObj.ui.username), errorTexts.invalidUsername, "Username invalid error should be displayed for username: " + data);
        }, this));
    });

    test("email is propagated to username until it is edited", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.email, "charlie@atlassian.com")

        // then
        equal(this.testObj.ui.emailHidden.val(), "charlie@atlassian.com", "Email is processed");
        equal(this.testObj.ui.username.val(), "charlie", "Username should have been filled by partial email");

        // when
        setFieldValue(this.testObj.ui.username, "will")
        setFieldValue(this.testObj.ui.email, "emma@atlassian.com")

        // then
        equal(this.testObj.ui.emailHidden.val(), "emma@atlassian.com", "Email is processed");
        equal(this.testObj.ui.username.val(), "will", "Username is not changed if edited earlier");
    });

    test("password is required", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.password, "");

        // then
        equal(getErrorText(this.testObj.ui.password), errorTexts.passwordRequired, "Password required error should be displayed");
    });

    test("password retype is required", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.retypePassword, "");

        // then
        equal(getErrorText(this.testObj.ui.retypePassword), errorTexts.passwordRetypeRequired, "Password retype required error should be displayed");
    });

    test("passwords must match", function(){
        // when
        this.initializeView();
        setFieldValue(this.testObj.ui.password, "pass1");
        setFieldValue(this.testObj.ui.retypePassword, "pass2");

        // then
        equal(getErrorText(this.testObj.ui.retypePassword), errorTexts.passwordsDoNotMatch, "Passwords do not match should be displayed");
        hasNoErrors(this.testObj.ui.password);

        // and when
        setFieldValue(this.testObj.ui.password, "pass2");
        // wait until the change propagates to refresh the retype password field:
        this.sandbox.clock.tick(View.VALIDATION_TIMEOUT);

        // then
        hasNoErrors(this.testObj.ui.retypePassword);
    });

    test("errors are displayed with delay as long as user types only on fields touched by user", function(){
        // when
        this.initializeView();
        this.testObj.ui.password.val("");
        this.testObj.ui.password.trigger("input");
        this.sandbox.clock.tick(View.VALIDATION_TIMEOUT - 1);

        // then
        _.each(this.testObj.fields, function (fieldData, name) {
            hasNoErrors(this.testObj.ui[name]);
        }, this);

        // when
        this.testObj.ui.password.trigger("blur");

        // then
        hasErrors(this.testObj.ui.password);

        // when
        this.testObj.ui.email.val("someInvalidEmail@");
        this.testObj.ui.email.trigger("input");
        this.sandbox.clock.tick(View.VALIDATION_TIMEOUT - 1);

        // then
        hasErrors(this.testObj.ui.password);
        hasNoErrors(this.testObj.ui.email);
        hasNoErrors(this.testObj.ui.username);
        hasNoErrors(this.testObj.ui.retypePassword);

        // when
        this.sandbox.clock.tick(1);

        //then
        hasErrors(this.testObj.ui.password);
        hasErrors(this.testObj.ui.email);
        hasNoErrors(this.testObj.ui.username);
        hasNoErrors(this.testObj.ui.retypePassword);
    });
});