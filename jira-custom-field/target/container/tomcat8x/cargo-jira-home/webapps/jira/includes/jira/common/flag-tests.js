AJS.test.require(["jira.webresources:messages"], function() {
    'use strict';

    module('JIRA Flags', {
        setup: function () {
            this.flagElement = document.createElement('div');
            this.auiFlagStub = sinon.stub().returns(this.flagElement);

            var ctx = AJS.test.mockableModuleContext();
            ctx.mock('aui/flag', this.auiFlagStub);

            this.claimStub = sinon.stub(WRM.data, 'claim');
            this.claimStub.returns(undefined);

            this.contextPathStub = sinon.stub(AJS, 'contextPath');
            this.contextPathStub.returns('/context-path');

            this.server = sinon.fakeServer.create();
            this.server.respondWith([204, '', '']);

            this.flag = ctx.require('jira/flag');

            this.flagShown = function (type, title, body, expectedOptions) {
                var actualOptions = this.auiFlagStub.lastCall.args[0];
                expectedOptions = expectedOptions || {};
                expectedOptions.type = type;
                expectedOptions.title = title;
                expectedOptions.body = body;

                for (var key in expectedOptions) {
                    if (expectedOptions.hasOwnProperty(key)) {
                        equal(actualOptions[key], expectedOptions[key],
                                'correct value of "' + key + '" in options argument');
                    }
                }
            };

            this.setSessionFlags = function (flags) {
                if (!flags || !flags.length) {
                    sessionStorage.removeItem("dismissedFlags");
                } else {
                    sessionStorage.setItem("dismissedFlags", JSON.stringify(flags));
                }
            };

            this.getSessionFlags = function () {
                return JSON.parse(sessionStorage.getItem("dismissedFlags")) || [];
            };

            this.closeFlag = function () {
                this.flagElement.dispatchEvent(new CustomEvent('aui-flag-close', { bubbles: true }));
            };

            this.dismissFlag = function () {
                this.flagElement.dismiss();
            };

            this.setSessionFlags(null);
        },
        teardown: function () {
            this.claimStub.restore();
            this.server.restore();
            this.contextPathStub.restore();
            this.setSessionFlags(null);
        }
    });

    test('Calls aui.flag & sets correct defaults', function () {
        var title = 'Title';
        var body = 'Body';
        this.flag.showMsg(title, body);
        this.flagShown('info', title, body);
    });

    test('Success message defaults to auto-close', function () {
        var title = 'Title';
        var body = 'Body';

        this.flag.showSuccessMsg(title, body);
        this.flagShown('success', title, body, {close: 'auto'});

        this.flag.showMsg(title, body, {type: 'success'});
        this.flagShown('success', title, body, {close: 'auto'});
    });

    test('Preserves explicitly-set close mode for success method', function () {
        var title = 'Title';
        var body = 'Body';

        this.flag.showSuccessMsg(title, body, {close: 'never'});
        this.flagShown('success', title, body, {close: 'never'});

        this.flag.showMsg(title, body, {type: 'success', close: 'never'});
        this.flagShown('success', title, body, {close: 'never'});
    });

    test('Uses Info, Success, Warning & Error types', function () {
        var title = 'Title';
        var body = 'Body';

        this.flag.showInfoMsg(title, body);
        this.flagShown('info', title, body);

        this.flag.showWarningMsg(title, body);
        this.flagShown('warning', title, body);

        this.flag.showErrorMsg(title, body);
        this.flagShown('error', title, body);

        // Success in options argument
        this.flag.showMsg(title, body, {type: 'success'});
        this.flagShown('success', title, body);
    });

    test('Does not show a dismissed flag', function () {
        this.claimStub.returns({ dismissed: ['i.was.dismissed'] });

        this.flag.showMsg('Title', 'Body', { dismissalKey: 'i.was.dismissed'});

        sinon.assert.notCalled(this.auiFlagStub);
    });

    test('Does not show a dismissed flag from earlier page load', function () {

        //given
        this.claimStub.returns(undefined);
        this.setSessionFlags(['i.was.dismissed']);

        //when
        this.flag.showMsg('Title', 'Body', { dismissalKey: 'i.was.dismissed'});

        //then
        sinon.assert.notCalled(this.auiFlagStub);
    });

    test('PUTs a dismissal to the appropriate URL on close', function () {
        this.flag.showMsg('Title', 'Body', { dismissalKey: 'was i dismissed?' });

        this.flagElement.dispatchEvent(new CustomEvent('aui-flag-close', { bubbles: true }));

        equal(this.server.requests.length, 1, 'One request was made');
        equal(this.server.requests[0].method, 'PUT', 'The dismissal request was PUT');
        equal(this.server.requests[0].url, '/context-path/rest/flags/1.0/flags/was%20i%20dismissed%3F/dismiss');
    });

    var assertSessionClearedOnSuccess = function (action) {
        var key = 'key';
        this.flag.showMsg('Title', 'Body', { dismissalKey: key});

        deepEqual(this.getSessionFlags(), [], "No flags on load.");

        action();

        deepEqual(this.getSessionFlags(), [key], "Flag added to the session during the load.");

        equal(this.server.requests.length, 1, 'One request was made');
        this.server.requests[0].respond(204, {}, null);

        deepEqual(this.getSessionFlags(), [], "Flag removed from the session after response.");
    };

    test('Dismissal removes session key on success', function () {
        assertSessionClearedOnSuccess.call(this, this.dismissFlag.bind(this));
    });

    test('Close removes session key on success', function () {
        assertSessionClearedOnSuccess.call(this, this.closeFlag.bind(this));
    });

    var assertSessionNotClearedOnFailure = function (action) {
        var key = 'key';
        this.flag.showMsg('Title', 'Body', { dismissalKey: key});

        deepEqual(this.getSessionFlags(), [], "No flags on load.");

        action();

        deepEqual(this.getSessionFlags(), [key], "Flag added to the session during the load.");

        equal(this.server.requests.length, 1, 'One request was made');
        this.server.requests[0].respond(500, {}, null);

        deepEqual(this.getSessionFlags(), [key], "Flag kept on error");
    };

    test('Dismissal leaves session key on error', function () {
        assertSessionNotClearedOnFailure.call(this, this.dismissFlag.bind(this));
    });

    test('Close leaves session key on error', function () {
        assertSessionNotClearedOnFailure.call(this, this.closeFlag.bind(this));
    });

    test('Explicit dismiss triggers rest call', function () {

        //when
        this.flag.showMsg('Title', 'Body', { dismissalKey: 'explicitly.dismissed' }).dismiss();

        //then
        equal(this.server.requests.length, 1, 'One request was made');
        equal(this.server.requests[0].method, 'PUT', 'The dismissal request was PUT');
        equal(this.server.requests[0].url, '/context-path/rest/flags/1.0/flags/explicitly.dismissed/dismiss');
    });

    test('Does not store dismissal of a flag without a key', function () {
        this.flag.showMsg('Title', 'Body');

        this.flagElement.dispatchEvent(new CustomEvent('aui-flag-close', { bubbles: true }));

        equal(this.server.requests.length, 0, 'No requests were made.');
    });

    test('Explicit dismiss does nothing on flag without a key', function () {
        //when
        this.flag.showMsg('Title', 'Body').dismiss();

        //then
        equal(this.server.requests.length, 0, 'No requests were made.');
    });

    test('Does not show a flag that was just dismissed', function () {
        this.flag.showMsg('Title', 'Body', { dismissalKey: 'just.dismissed' });

        this.flagElement.dispatchEvent(new CustomEvent('aui-flag-close', { bubbles: true }));

        this.flag.showMsg('Title', 'Body', { dismissalKey: 'just.dismissed' });
        sinon.assert.calledOnce(this.auiFlagStub);
    });

    module('JIRA Flags with DOM rendering', {
        setup: function () {
            this.jiraFlag = require('jira/flag');
        }
    });

    test('A message with a title should have the respective element', function () {
        var title = 'This is the title';
        var body = 'This is the body message';

        var $renderedFlag = AJS.$(this.jiraFlag.showMsg(title, body));

        strictEqual($renderedFlag.find('.title').size(), 1, "Title element should be present");
    });

    test('A message without a title should not have an empty title element', function () {
        var title = '';
        var body = 'This is another body message';

        var $renderedFlag = AJS.$(this.jiraFlag.showMsg(title, body));

        strictEqual($renderedFlag.find('.title').size(), 0, "No title element should be present");
    });
});
