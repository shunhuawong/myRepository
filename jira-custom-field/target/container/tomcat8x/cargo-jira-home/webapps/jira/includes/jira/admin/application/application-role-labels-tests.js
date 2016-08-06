AJS.test.require(["jira.webresources:application-role-labels"], function () {
    require(["underscore", "jquery", "jira/admin/application/application-role-labels", "jira/admin/application/group-labels-store"],
        function (_, $, ApplicationRoleLabels, GroupLabelsStore) {
        module('ApplicationRoleLabels tests', {
            setup: function () {
                this.context = AJS.test.context();
                this.sandbox = sinon.sandbox.create();
            },
            teardown: function () {
                this.sandbox.restore();
            }
        });

        asyncTest("sync labels called after attach", function (assert) {
            expect(6);
            var $fixture = $("#qunit-fixture");

            var syncCalled = deferredStub.call(this, GroupLabelsStore, "syncLabels");
            var removeCalled = deferredStub.call(this, GroupLabelsStore, "removeHandler");
            var fetchCalled = deferredStub.call(this, GroupLabelsStore, "fetchLabels");

            var instance = new ApplicationRoleLabels();
            $(instance).attr("data-role-key", "role1")
                .attr("data-group-name", "group1")
                .appendTo($fixture);

            syncCalled.then(function(groupName, roleName, handler) {
                assert.ok(typeof $(instance).attr("resolved") !== "undefined", "component was processed by skate");
                assert.equal(groupName, "group1");
                assert.equal(roleName, "role1");
                assert.deepEqual(handler, instance.syncLabelsHandler);

                $(instance).remove();
                removeCalled.then(function (handler) {
                    assert.deepEqual(handler, instance.syncLabelsHandler, "removeCalled called with proper arguments");
                });

                fetchCalled.then(function () {
                    start();
                    ok("fetch called on detach");
                });
            });
        });

        test("updateLabels takes only MULTIPLE and ADMIN", function() {

            var instance = new ApplicationRoleLabels();

            instance.updateLabels([
                mockLabel("Admin", "admin", "ADMIN"),
                mockLabel("Foo", "foo", "FOO"),
                mockLabel("Multi", "multi", "MULTIPLE"),
                mockLabel("Multi", "multi", "multiple")
            ]);

            var actualTitles = $(instance.innerHTML)
                .map(function(idx, el) { return el.title; })
                .toArray();
            deepEqual(actualTitles, [ "Admin", "Multi" ]);
        });

        function mockLabel(title, text, type) {
            return {
                title: title,
                text: text,
                type: type
            };
        }

        function deferredStub(object, method) {
            var result = new $.Deferred();
            this.sandbox.stub(object, method, result.resolve.bind(result));
            return result;
        }
    });
});