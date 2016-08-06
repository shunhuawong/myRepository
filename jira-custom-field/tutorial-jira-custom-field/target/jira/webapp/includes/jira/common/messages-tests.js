AJS.test.require(['jira.webresources:jira-global'], function() {
    'use strict';

    var $ = require('jquery');

    module('JIRA Flags', {
        setup: function () {
            var ctx = AJS.test.context();
            var flag = $.extend({}, require('jira/flag'));
            this.stubbedFlagMethod = sinon.stub(flag, 'showMsg');
            ctx.mock('jira/flag', flag);

            this.message = ctx.require('jira/message');

            this.flagCalledWith = function (body, expectedOptions) {
                sinon.assert.calledWith(this.stubbedFlagMethod, '', body);

                var actualOptions = this.stubbedFlagMethod.lastCall.args[2];

                expectedOptions = expectedOptions || {};
                if ('type' in expectedOptions) {
                    equal(actualOptions.type, expectedOptions.type);
                }
                if ('close' in expectedOptions) {
                    equal(actualOptions.close, expectedOptions.close);
                }
            };
        },
        teardown: function () {
            this.stubbedFlagMethod.restore();
        }
    });

    test("Calls jira.flag & sets correct defaults", function () {
        var body = 'body';

        this.message.showMsg(body);
        this.flagCalledWith(body);
    });

    test("Uses Info, Success, Warning & Error types", function () {
        var body = 'body';

        // Success
        this.message.showSuccessMsg(body);
        this.flagCalledWith(body, {type: 'success'});

        // Warning
        this.message.showWarningMsg(body);
        this.flagCalledWith(body, {type: 'warning'});

        // Error
        this.message.showErrorMsg(body);
        this.flagCalledWith(body, {type: 'error'});

        // Success in options argument
        this.message.showMsg(body, {type: 'success'});
        this.flagCalledWith(body, {type: 'success'});
    });

    test("A closeable value of false makes the message disappear automatically", function () {
        var body = 'body';

        this.message.showMsg(body, {closeable: false});
        this.flagCalledWith(body, {close: 'auto'});
    });

    test("Respects timeout value", function () {
        var body = 'body';

        this.message.showMsg(body, {timeout: 10});
        this.flagCalledWith(body, {close: 'auto'});

        this.message.showMsg(body, {timeout: 0});
        this.flagCalledWith(body, {close: 'manual'});

        this.message.showMsg(body, {timeout: -1});
        this.flagCalledWith(body, {close: 'manual'});
    });

    test("Gives preference to timeout value over closeable", function () {
        var body = 'body';

        this.message.showMsg(body, {timeout: -1, closeable: false});
        this.flagCalledWith(body, {close: 'never'});

        this.message.showMsg(body, {timeout: 0, closeable: false});
        this.flagCalledWith(body, {close: 'never'});

        this.message.showMsg(body, {timeout: 10, closeable: false});
        this.flagCalledWith(body, {close: 'auto'});

        this.message.showMsg(body, {timeout: -1, closeable: true});
        this.flagCalledWith(body, {close: 'manual'});

        this.message.showMsg(body, {timeout: 0, closeable: true});
        this.flagCalledWith(body, {close: 'manual'});

        this.message.showMsg(body, {timeout: 10, closeable: true});
        this.flagCalledWith(body, {close: 'auto'});
    });

    test("Adds an id to the created flag if it is present in the options", function() {
        this.stubbedFlagMethod.returns("<div/>");

        var createdFlag = this.message.showMsg('message', {id: "expectedId"});

        equal(createdFlag.attr("id"), "expectedId");
    });

    test("Does not add an id to the created flag if it is not present in the options", function() {
        this.stubbedFlagMethod.returns("<div/>");

        var createdFlag = this.message.showMsg('message', {});

        equal(createdFlag.attr("id"), null);
    });
});
