AJS.test.require("jira.webresources:util-lite", function() {

    var submitted;

    module('Form tests with mocks', {
        setup: function() {
            submitted = false;
            this.jquery = function() {
                return {
                    submit: function() {
                        submitted = true;
                    }
                };
            };

            this.mockedJquery = AJS.test.mockableModuleContext();

            this.navigator4WindowsAndLinux = { isMac: function() { return false; }};
            this.mockedNavigator4WindowsAndLinux = AJS.test.mockableModuleContext();
            this.mockedNavigator4WindowsAndLinux.mock('jira/util/navigator', this.navigator4WindowsAndLinux);
            this.mockedNavigator4WindowsAndLinux.mock('jquery', this.jquery);

            this.navigator4Mac = { isMac: function() { return true; }};
            this.mockedNavigator4Mac = AJS.test.mockableModuleContext();
            this.mockedNavigator4Mac.mock('jira/util/navigator', this.navigator4Mac);
            this.mockedNavigator4Mac.mock('jquery', this.jquery);
        }
    });

    test('submitOnCtrlEnter() method should submit if keyCode is 13 and if OS is Windows or Linux', function() {
        var e = {
            ctrlKey: true,
            target: { form: true },
            keyCode: 13
        };
        var Forms = this.mockedNavigator4WindowsAndLinux.require('jira/util/forms');
        equal(Forms.submitOnCtrlEnter(e), false);
        equal(submitted, true);
    });

    test('submitOnCtrlEnter() method should submit if keyCode is 13 and if OS is Mac', function() {
        var e = {
            ctrlKey: true,
            target: { form: true },
            keyCode: 13
        };
        var Forms = this.mockedNavigator4Mac.require('jira/util/forms');
        equal(Forms.submitOnCtrlEnter(e), false);
        equal(submitted, true);
    });

    test('submitOnCtrlEnter() method should submit if keyCode is 10 and if OS is Windows or Linux', function() {
        var e = {
            ctrlKey: true,
            target: { form: true },
            keyCode: 10
        };
        var Forms = this.mockedNavigator4WindowsAndLinux.require('jira/util/forms');
        equal(Forms.submitOnCtrlEnter(e), false);
        equal(submitted, true);
    });

    test('submitOnCtrlEnter() method should *not* submit if keyCode is 10 and if OS is Mac', function() {
        var e = {
            ctrlKey: true,
            target: { form: true },
            keyCode: 10
        };
        var Forms = this.mockedNavigator4Mac.require('jira/util/forms');
        equal(Forms.submitOnCtrlEnter(e), true);
        equal(submitted, false);
    });
});
