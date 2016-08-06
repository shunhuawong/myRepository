AJS.test.require(["jira.webresources:jira-global", "jira.webresources:dialogs"], function() {

    var $ = require('jquery');
    var _ = require('underscore');
    var Dialog = require('jira/dialog/dialog');

    var simpleDialogCreator = function(title, options) {
        var $content = $("<div>").css({height: '200px'}).append($("<h2>").text(title));

        var defaultOptions = {
            content: function(callback) {
                //This count is used to check that the content is cached.
                d.contentCall++;
                return callback($content);
            },
            height: '200px',
            windowTitle: title
        };

        var d = new Dialog($.extend(defaultOptions, options));

        d.isVisible = function() {
            return $content.is(":visible");
        };

        d.contentCall = 0;
        d.title = title;

        return d;
    };

    var assertDialogDisplayedFactory = function (dialogs, windowTitle) {

        return function(dialog) {
            if (dialog) {
                var title = dialog.title;
                ok(dialog.isVisible(), title + " visible?");
                strictEqual(document.title, title, "Title correctly set to '" + title + "'.");
                assertThrobberHidden();
            } else {
                strictEqual(document.title, windowTitle, "Title correctly reset.");
            }

            for (var i = 0; i < dialogs.length; i++) {
                if (dialogs[i] !== dialog) {
                    ok(!dialogs[i].isVisible(), dialogs[i].title + " not visible?");
                }
            }
        };
    };

    var assertDialogContentCallCountFactory = function(dialogs) {
        return function() {
            for (var i = 0; i < arguments.length; i++) {
                var dialog = dialogs[i];
                strictEqual(dialog.contentCall, arguments[i], "Content refreshed on '" + dialog.title
                        + "' " + arguments[i] + " times?");
            }
        };
    };

    var assertThrobberHidden = function() {
        ok($(".jira-page-loading-indicator").is(":hidden"), "Throbber is hidden when dialog is displayed");
    };

    module("Dialog Tests", {

        teardown: function() {
            //Remove any trace of the dialog when finished.
            $("."+ Dialog.ClassNames.DIALOG).remove();
        }
    });

    test("Stacked Dialogs Only", function() {

        var dialog3 = simpleDialogCreator("Dialog3", {stacked: true});
        var dialog2 = simpleDialogCreator("Dialog2", {stacked: true});
        var dialog1 = simpleDialogCreator("Dialog1", {stacked: true});
        var dialogs = [dialog1, dialog2, dialog3];

        var origTitle = document.title;
        var windowTitle = document.title = "Stacked Dialogs Test";

        var assertDialogDisplayed = assertDialogDisplayedFactory(dialogs, windowTitle);
        var assertDialogContentCallCount = assertDialogContentCallCountFactory(dialogs);

        //dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(1, 0, 0);

        //dialog1 -> dialog2
        dialog2.show();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(1, 1, 0);

        //dialog1 -> dialog2 -> dialog3
        dialog3.show();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(1, 1, 1);

        //dialog1 -> dialog2
        dialog3.hide();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(1, 1, 1);

        //dialog1 -> dialog2 -> dialog3
        dialog3.show();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(1, 1, 2);

        //dialog1 -> dialog2
        dialog3.hide();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(1, 1, 2);

        //dialog1
        dialog2.hide();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(1, 1, 2);

        // <EMPTY>
        dialog1.hide();
        assertDialogDisplayed(null);
        assertDialogContentCallCount(1, 1, 2);

        //dialog2
        dialog2.show();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(1, 2, 2);

        // <EMPTY>
        dialog2.hide();
        assertDialogDisplayed(null);
        assertDialogContentCallCount(1, 2, 2);

        //dialog3
        dialog3.show();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(1, 2, 3);

        //dialog3 -> dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(2, 2, 3);

        //dialog3 -> dialog1 -> dialog2
        dialog2.show();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(2, 3, 3);

        //dialog3 -> dialog1
        dialog2.hide();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(2, 3, 3);

        //dialog3
        dialog1.hide();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(2, 3, 3);

        //dialog3 -> diglog2
        dialog2.show();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(2, 4, 3);

        //dialog3
        dialog2.hide();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(2, 4, 3);

        // <EMPTY>
        dialog3.hide();
        assertDialogDisplayed(null);
        assertDialogContentCallCount(2, 4, 3);

        document.title = origTitle;
    });

    test("Stacked Dialogs Normal With Normal Dialogs", function() {

        var dialog3 = simpleDialogCreator("Dialog3", {stacked: true});
        var dialog2 = simpleDialogCreator("Dialog2", {stacked: true});
        var dialog1 = simpleDialogCreator("DialogNotStacked1");
        var dialog4 = simpleDialogCreator("DialogNotStacked4");

        var dialogs = [dialog1, dialog2, dialog3, dialog4];

        var origTitle = document.title;
        var windowTitle = document.title = "Stacked Dialogs with Normal Dialog Test";

        var assertDialogDisplayed = assertDialogDisplayedFactory(dialogs, windowTitle);
        var assertDialogContentCallCount = assertDialogContentCallCountFactory(dialogs);

        //dialog3
        dialog3.show();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(0, 0, 1, 0);

        //dialog3 -> dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(1, 0, 1, 0);

        //dialog4
        dialog4.show();
        assertDialogDisplayed(dialog4);
        assertDialogContentCallCount(1, 0, 1, 1);

        dialog4.hide();
        assertDialogDisplayed(null);

        //dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(2, 0, 1, 1);
        dialog1.hide();

        //dialog2
        dialog2.show();
        assertDialogDisplayed(dialog2);
        assertDialogContentCallCount(2, 1, 1, 1);

        //dialog2 -> dialog3
        dialog3.show();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(2, 1, 2, 1);

        //dialog2 -> dialog3 -> dialog4
        dialog4.show();
        assertDialogDisplayed(dialog4);
        assertDialogContentCallCount(2, 1, 2, 2);

        //dialog2 -> dialog3
        dialog4.hide();
        assertDialogDisplayed(dialog3);
        assertDialogContentCallCount(2, 1, 2, 2);

        //dialog2 -> dialog3 -> dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(3, 1, 2, 2);

        //dialog4
        dialog4.show();
        assertDialogDisplayed(dialog4);
        assertDialogContentCallCount(3, 1, 2, 3);

        //dialog1
        dialog1.show();
        assertDialogDisplayed(dialog1);
        assertDialogContentCallCount(4, 1, 2, 3);

        dialog1.hide();
        assertDialogDisplayed(null);

        document.title = origTitle;
    });

    test("Test Simple Dialog Title Change", function() {

        var assertTitle = function(dialog) {
            if (dialog) {
                strictEqual(document.title, dialog.title, dialog.title + " title correct?");
            } else {
                strictEqual(document.title, testTitle, "Original Title Restored?");
            }
        };

        var dialog1 = simpleDialogCreator("Dialog1");
        var dialog2 = simpleDialogCreator("Dialog2");

        var originalTitle = document.title;
        var testTitle = document.title = "Test Dialog Title";

        dialog1.show();
        assertTitle(dialog1);

        dialog2.show();
        assertTitle(dialog2);

        dialog2.hide();
        assertTitle(null);

        dialog1.show();
        assertTitle(dialog1);

        dialog2.show();
        assertTitle(dialog2);

        dialog1.show();
        assertTitle(dialog1);

        dialog1.hide();
        assertTitle(null);

        document.title = originalTitle;
    });

    test("Test redirect instructions", function() {
        var dialog = simpleDialogCreator("Dialog1");

        var headers = {};
        var xhr = {
            getResponseHeader: function(key) {
                return headers[key];
            }
        };

        var a = dialog._detectRedirectInstructions(xhr);
        deepEqual(a, {serverIsDone: false, redirectUrl: ""}, "No header");

        headers['X-Atlassian-Dialog-Control'] = "DONE";
        a = dialog._detectRedirectInstructions(xhr);
        deepEqual(a, {serverIsDone: true, redirectUrl: ""}, "DONE header");

        headers['X-Atlassian-Dialog-Control'] = "redirect:http://localhost.com";
        a = dialog._detectRedirectInstructions(xhr);
        deepEqual(a, {serverIsDone: true, redirectUrl: "http://localhost.com"}, "Redirect Header");

        headers['X-Atlassian-Dialog-Control'] = "permissionviolation";
        a = dialog._detectRedirectInstructions(xhr);
        deepEqual(a, {serverIsDone: true, redirectUrl: window.location.href}, "Permision Voilation");
    });

    module("Dialog headers -- likely to change in JIRA 6.1", {
        setup: function() {
            this.$content = $("<p>Practically empty</p>");
            this.dialog = new Dialog({content: this.$content});
        }, teardown: function() {
            this.dialog.hide();
            this.$content.remove();
        }
    });

    test("Can provide plain-text for the heading", function() {
        var title = "This is my dialog heading. It is made from win and awesome.";
        this.dialog.addHeading(title);
        notEqual(this.dialog.$popup.text().indexOf(title), -1, "The title text should be present in the dialog");
    });

    test("heading contents are placed inside known container", function() {
        var title = "Quite full";
        this.dialog.addHeading(title);
        var $heading = this.dialog.$popup.find("."+ Dialog.ClassNames.HEADING_AREA);
        equal($heading.text(), title, "The dialog's heading is inside an element with the HTML class from JIRA.Dialog.ClassNames.HEADING_AREA");
        equal($heading.find("h2").size(), 1, "The dialog's heading is contained within an h2 element.");
    });

    test("Can provide HTML for the heading", function() {
        var titleHtml = "One flew <i>over</i> the <strong>cuckoo's</strong> nest";
        this.dialog.addHeading(titleHtml);
        var $heading = this.dialog.$popup.find("."+ Dialog.ClassNames.HEADING_AREA);
        equal($heading.find("h2").html(), titleHtml, "HTML is preserved when added to the dialog heading");
    });

    module("Dialog resources", {
        setup: function() {
            this.sandbox = sinon.sandbox.create();

            var $content = $("<div>");
            this.dialogOptions = {
                resources: ["resource1", "resource2"],
                contexts: ["context1", "context2"],
                content: function(callback) {
                    return callback($content);
                }
            };

            this.context = AJS.test.mockableModuleContext();
            this.requireDeferred = new $.Deferred();
            this.wrmRequire = this.sandbox.stub();
            this.context.mock('wrm/require', this.wrmRequire);

            this.Dialog = this.context.require('jira/dialog/dialog');
            this.WRMDialog = this.Dialog.extend({
                defineResources: function() {
                    this._super.apply(this, arguments);

                    (this.options.resources || []).forEach(function(resource) { this.requireResource(resource); }, this);
                    (this.options.contexts || []).forEach(function(context) { this.requireContext(context); }, this);
                }
            });
        },
        teardown: function() {
            this.sandbox.restore();
        }
    });

    test("New dialog instance will not prefetch resources in constructor when prefetchResources field is not true", function() {
        var dialog = new this.WRMDialog(this.dialogOptions);

        ok(this.wrmRequire.notCalled, "require not called");
    });

    test("New dialog instance will prefetch resources in constructor when prefetchResources field is true", function() {
        var dialog = new this.WRMDialog(_.extend(this.dialogOptions, {
            prefetchResources: true
        }));

        ok(this.wrmRequire.calledOnce, "require called once");
        deepEqual(this.wrmRequire.getCall(0).args[0], ["wr!resource1", "wr!resource2", "wrc!context1", "wrc!context2"], "WRM.require called with proper args");
    });

    test("Show will not download resources if none specified", function() {
        var dialog = new this.WRMDialog();
        ok(this.wrmRequire.notCalled, "require not called after constructor");

        dialog.show();
        ok(this.wrmRequire.notCalled, "require not called after show");

        dialog.hide();
    });

    test("Show will download resources once if specified", function() {
        this.wrmRequire.returns(this.requireDeferred);

        var dialog = new this.WRMDialog(this.dialogOptions);
        ok(this.wrmRequire.notCalled, "require not called after constructor");

        dialog.show();
        ok(this.wrmRequire.calledOnce, "require called once");
        deepEqual(this.wrmRequire.getCall(0).args[0], ["wr!resource1", "wr!resource2", "wrc!context1", "wrc!context2"], "WRM.require called with proper args");

        dialog.hide();

        dialog.show();
        ok(this.wrmRequire.calledOnce, "require called once");
        dialog.hide();
    });

    test("Does not show dialog until resources resolved", function() {
        this.wrmRequire.returns(this.requireDeferred);

        var dialog = new this.WRMDialog(this.dialogOptions);
        var _showContent = this.sandbox.spy(dialog, "_onShowContent");

        ok(this.wrmRequire.notCalled, "require not called after constructor");
        dialog.show();
        ok(this.wrmRequire.calledOnce, "require called once");
        ok(_showContent.notCalled);

        this.requireDeferred.resolve();
        ok(_showContent.calledOnce, "showContent called after resources resolve");

        dialog.hide();
    });

    test("Dialog constructor should call options defineResources with itself in scope", function() {
        var defineResources = this.sandbox.stub();

        var dialog = new this.Dialog({
            defineResources: defineResources
        });

        ok(defineResources.calledOnce, "defineResources was called once");
        deepEqual(defineResources.getCall(0).thisValue, dialog, "defineResources called with dialog as this.");
    });
});
