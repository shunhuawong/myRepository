AJS.test.require([
    "jira.webresources:userbrowser-lib",
    "com.atlassian.plugins.helptips.jira-help-tips:common"
], function() {

    var jQuery = require('jquery');

    module('help-tip', {
        setup: function() {
            this.inviteUser = jQuery('<div id="invite-user"></div>').appendTo("#qunit-fixture");
            jQuery('<div id="create-user"></div>').appendTo("#qunit-fixture");
            jQuery('<div id="content"></div>').appendTo("#qunit-fixture");

            this.context = AJS.test.mockableModuleContext();
            this.announcementsInitializer = {
                createFlagsFromDataProvider: sinon.spy()
            };
            this.context.mock('jira/postsetup/announcements-initializer', this.announcementsInitializer);

            this.userBrowser = this.context.require('jira/admin/user-browser');
            AJS.HelpTip.Manager.dismissedTipIds = ['add.new.users'];
        },

        undismissHelpTip: function () {
            AJS.HelpTip.Manager.dismissedTipIds = [];
        },

        initHelpTip: function() {
            this.userBrowser.initNewUsersTip("#invite-user", "#create-user");
        },

        teardown: function() {
            this.inviteUser.click();
        }
    });

    test("Should initialize post setup announcements if AJS.HelpTip was dismissed", function() {
        this.initHelpTip();

        sinon.assert.calledOnce(this.announcementsInitializer.createFlagsFromDataProvider);
    });

    test("Initialization of post setup announcements is forbidden if AJS.HelpTip isn't dismissed", function() {
        this.undismissHelpTip();
        this.initHelpTip();

        sinon.assert.notCalled(this.announcementsInitializer.createFlagsFromDataProvider);
    });

    test("Should initialize post setup announcements after closing HelpTip", function() {
        this.initHelpTip();
        this.inviteUser.click();

        sinon.assert.calledOnce(this.announcementsInitializer.createFlagsFromDataProvider);
    });

});
