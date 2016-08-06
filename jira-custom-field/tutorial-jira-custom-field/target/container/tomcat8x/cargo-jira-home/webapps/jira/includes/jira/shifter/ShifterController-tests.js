AJS.test.require(['jira.webresources:shifter'], function () {

    var ShifterController = require('jira/shifter/shifter-controller');
    var ShifterAnalytics = require('jira/shifter/shifter-analytics');
    var assert = sinon.assert;

    var shifter;

    module('ShifterController', {
        setup: function() {
            this.sandbox = sinon.sandbox.create();
            this.sandbox.stub(ShifterAnalytics, "show");

            shifter = new ShifterController('shifter-dialog');
        },
        teardown: function() {
            shifter.hide();
            this.sandbox.restore();
        }
    });

    test('should trigger analytics event on selection', function() {
        shifter.show();

        assert.calledOnce(ShifterAnalytics.show);
    });

});