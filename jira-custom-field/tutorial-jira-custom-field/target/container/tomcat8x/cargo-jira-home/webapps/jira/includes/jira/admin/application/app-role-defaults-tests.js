AJS.test.require(["jira.webresources:application-roles"], function () {
    require(["underscore", "backbone", "jquery"], function (_, Backbone, $) {

        module('CompositeView Tests', {
            setup: function () {
                this.context = AJS.test.context();
            },
            teardown: function () {
            }
        });

        test("CompositeView.commit resolves after save", function () {
            var ApplicationListView = this.context.require("jira/admin/application/defaults/ApplicationListView");

            var collection = mockCollection([{key: "role1"}, {key: "role2"}]);
            var compositeView = new ApplicationListView({collection: collection});
            compositeView.render();

            compositeView.commit().then(function () {
                ok("Commit resolved after save");
            });
        });

        test("CompositeView.commit resolves empty list", function () {
            var ApplicationListView = this.context.require("jira/admin/application/defaults/ApplicationListView");

            var emptyCollection = mockCollection([]);
            var compositeView = new ApplicationListView({collection: emptyCollection});
            compositeView.render();

            compositeView.commit().then(function () {
                ok("Commit resolved after empty collection");
            });
        });

        test("CompositeView.commit fails after unsuccessful save", function () {
            var ApplicationListView = this.context.require("jira/admin/application/defaults/ApplicationListView");

            var collection = mockCollection([{key: "role1"}, {key: "role2"}]);
            collection._faulty = true;
            var compositeView = new ApplicationListView({collection: collection});
            compositeView.render();

            compositeView.commit().fail(function() {
                ok("Commit rejected after failed save");
            });
        });

        function mockCollection(data) {
            var MockCollection = Backbone.Collection.extend({
                _faulty: false,
                model: Backbone.Model.extend({
                    defaults: {
                        name: null,
                        groups: null,
                        defaultGroups: null,
                        selectedByDefault: false,
                        _faulty: false
                    },
                    idAttribute: "key",

                    update: function () {
                        if(this.get("_faulty")) {
                            return new $.Deferred().reject(this.toJSON());
                        } else {
                            return new $.Deferred().resolve(this.toJSON());
                        }
                    }
                }),

                updateDefaults: function() {
                    if(this._faulty) {
                        return new $.Deferred().reject(this.toJSON());
                    } else {
                        return new $.Deferred().resolve(this.toJSON());
                    }
                }
            });

            return new MockCollection(data);
        }

        function mapArguments(arguments, key) {
            return _.map(arguments, function (argument) { return argument[key]; });
        }
    });
});

AJS.test.require(["jira.webresources:application-roles"], function () {
    require(["underscore", "backbone", "jquery", "jira/admin/application/defaults/DialogView"], function (_, Backbone, $, DialogView) {

        module('DialogView Tests', {
            setup: function () {
                this.context = AJS.test.context();
                this.applicationCollection = mockCollection([
                    {key: "roleOne"},
                    {key: "roleTwo"},
                    {key: "roleThree", defaultGroups: ["defaultGroup"]}]);

                this.createDialogViewAndRenderIt = function(applicationCollection, webPanels) {
                    var dialogView = new DialogView({
                        collection: applicationCollection,
                        webPanels: webPanels || ""
                    });
                    dialogView.warnings.show = sinon.spy();
                    dialogView.render();
                    return dialogView;
                };
            },
            teardown: function () {
            }
        });

        test("Resolved commit should not display", function() {
            var CompositeView = mockCompositeView.call(this, new $.Deferred().resolve().promise());

            var collection = mockCollection([]);
            var dialogView = new DialogView({
                collection: collection
            });
            dialogView.render();
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));

            dialogView.formSubmit().done(function() {
                ok("Form submit succeeded");
                strictEqual(dialogView.errors, undefined, "Errors are not visible");
            });
        });

        test("Failed commit should display error", function() {
            var CompositeView = mockCompositeView.call(this, new $.Deferred().reject().promise(), []);

            var collection = mockCollection([]);
            var dialogView = new DialogView({
                collection: collection
            });
            dialogView.render();
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));

            equal(dialogView.errors.$el, null, "Error region not present");
            dialogView.formSubmit().fail(function() {
                ok("Form submit failed");
                equal(dialogView.errors.$el.is(':not(:empty)'), true, "Errors are visible");
            });
        });

        test("Warning should open when one application doesn't have a default group", function() {
            var CompositeView = mockCompositeView.call(this);
            this.applicationCollection.get("roleOne").set("selectedByDefault", true);

            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection);
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));
            ok(dialogView.warnings.show.calledOnce);
        });

        test("Warning should open when both applications don't have a default group", function() {
            var CompositeView = mockCompositeView.call(this);
            this.applicationCollection.get("roleOne").set("selectedByDefault", true);
            this.applicationCollection.get("roleTwo").set("selectedByDefault", true);

            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection);
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));
            ok(dialogView.warnings.show.calledOnce);
        });

        test("Warning should open when at least one application doesn't have a default group", function() {
            var CompositeView = mockCompositeView.call(this, null, ["roleOne", "roleTwo", "roleThree"]);
            this.applicationCollection.get("roleOne").set("selectedByDefault", true);
            this.applicationCollection.get("roleTwo").set("selectedByDefault", true);
            this.applicationCollection.get("roleThree").set("selectedByDefault", true);

            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection);
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));
            ok(dialogView.warnings.show.calledOnce);
        });

        test("Warning shouldn't open when all selected applications have a default group", function() {
            var CompositeView = mockCompositeView.call(this);
            this.applicationCollection.get("roleThree").set("selectedByDefault", true);

            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection);
            dialogView.showContents(new CompositeView({ collection: this.applicationCollection }));
            ok(!dialogView.warnings.show.called);
        });

        test("Dialog should render passed webPanels on showContents", function () {
            var CompositeView = mockCompositeView.call(this);
            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection, "fusion <b>awesome</b> content");

            dialogView.showContents(new CompositeView({collection: this.applicationCollection}));
            $("#qunit-fixture").append(dialogView.$el);

            equal($(".app-role-defaults-web-panels").html(), "fusion <b>awesome</b> content");
        });

        test("Dialog should trigger showContents event on showContents", function () {
            var CompositeView = mockCompositeView.call(this);
            var dialogView = this.createDialogViewAndRenderIt(this.applicationCollection);
            dialogView.dialog = {showContents: sinon.spy()};
            var executeOnDialogShow = sinon.spy();
            dialogView.on("showContents", executeOnDialogShow);

            dialogView.showContents(new CompositeView({collection: this.applicationCollection}));

            ok(executeOnDialogShow.called);
        });

        function mockCompositeView(commitResult) {
            var ApplicationListView = this.context.require("jira/admin/application/defaults/ApplicationListView");

            return ApplicationListView.extend({
                commit: function () {
                    return commitResult;
                }
            });
        }

        function mockCollection(data) {
            var MockCollection = Backbone.Collection.extend({
                model: Backbone.Model.extend({
                    defaults: {
                        name: null,
                        groups: null,
                        defaultGroups: null,
                        selectedByDefault: false
                    },
                    idAttribute: "key"
                })
            });
            return new MockCollection(data);
        }
    });
});

AJS.test.require(["jira.webresources:application-roles"], function () {
    require(["underscore", "backbone", "jquery"], function (_, Backbone, $) {

        module('Defaults init tests asdasd', {
            setup: function () {
                this.context = AJS.test.context();
                this.dialogTrigger = $("<a href='#' class='app-role-defaults-show-button'>Dialog trigger</a>");
                $("#qunit-fixture").append(this.dialogTrigger);
            },
            teardown: function () {
            },
            initDialog: function initDialog() {
                var dialogContext = {};
                this.context.mock("jira/admin/application/defaults/DialogView", Backbone.View.extend({
                    initialize: function () {
                        dialogContext.currentDialog = this;
                    },
                    show: function () {},
                    disable: function () {}
                }));

                var defaults = this.context.require("jira/admin/application/defaults");

                dialogContext.defaults = new defaults({
                    whenFetched: function () {
                        return new $.Deferred().promise();
                    }
                });

                return dialogContext;
            }
        });

        test("Init should use provided webpanels to init pluginpoint", function () {
            var claimStub = sinon.stub(WRM.data, "claim");
            claimStub.withArgs("com.atlassian.jira.web.action.admin.application-access:defapp-selector-webpanels").returns("web-panels-content");

            var dialogContext = this.initDialog();

            this.dialogTrigger.click();

            equal(dialogContext.currentDialog.options.webPanels, "web-panels-content");

            claimStub.restore();
        });

        test("Should emit API event on dialog show event", function () {
            var defaultsApi = require("jira/admin/application/defaults/api");
            this.context.mock("jira/admin/application/defaults/api", defaultsApi);
            var dialogContext = this.initDialog();

            var executeOnDialogShow = sinon.spy();
            defaultsApi.on(defaultsApi.EVENT_ON_SHOW, executeOnDialogShow);

            this.dialogTrigger.click();

            dialogContext.currentDialog.trigger("showContents");

            ok(executeOnDialogShow.called);
        });
    });
});