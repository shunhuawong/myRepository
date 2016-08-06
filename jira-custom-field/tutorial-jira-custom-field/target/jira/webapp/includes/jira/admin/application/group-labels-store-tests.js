AJS.test.require(["jira.webresources:application-role-labels"], function () {
    require(["underscore", "jquery"], function (_, $) {
        var GroupLabelStore;
        module('GroupLabelsStore tests', {
            setup: function () {
                this.context = AJS.test.context();
                this.sandbox = sinon.sandbox.create();
                this.server = sinon.fakeServer.create();
                this.clock = sinon.useFakeTimers();
                GroupLabelStore = this.context.require("jira/admin/application/group-labels-store");
            },
            teardown: function () {
                this.sandbox.restore();
                this.server.restore();
                this.clock.restore();
            }
        });

        test("consecutive requests terminate ongoing requests", function (assert) {
            GroupLabelStore.fetchLabels();

            //let's wait for call to happen
            this.clock.tick(200);
            GroupLabelStore.fetchLabels();

            assert.ok(this.server.requests[0].aborted, "GET aborted");
        });

        test("it will trigger listener", function (assert) {
            var fetchLabels = this.sandbox.stub(GroupLabelStore, "fetchLabels");

            var callback1 = this.sandbox.stub();
            var callback2 = this.sandbox.stub();
            var listener1 = GroupLabelStore.syncLabels("group1", "role1", callback1);
            var listener2 = GroupLabelStore.syncLabels("group2", "role2", callback2);

            GroupLabelStore.triggerListener(listener1, [ mockGroup("group1") ]);
            GroupLabelStore.triggerListener(listener2, [ mockGroup("group1") ]);
            GroupLabelStore.triggerListener(listener1, [ mockGroup("group2") ]);

            sinon.assert.calledOnce(callback1);
            sinon.assert.notCalled(callback2);
            sinon.assert.calledTwice(fetchLabels);
        });

        test("callback not fired after removing handler", function (assert) {
            var fetchLabels = this.sandbox.stub(GroupLabelStore, "fetchLabels");

            var callback1 = this.sandbox.stub();
            GroupLabelStore.syncLabels("group1", "role1", callback1);

            GroupLabelStore.triggerListeners([ mockGroup("group1") ]);
            GroupLabelStore.removeHandler(callback1);
            GroupLabelStore.triggerListeners([ mockGroup("group1") ]);

            sinon.assert.calledOnce(callback1, "callback1 not triggered second time");
            sinon.assert.calledOnce(fetchLabels, "callback1 not triggered second time");
        });

        function mockGroup(name, labels) {
            return {
                name: name,
                labels: labels
            };
        }
    });
});