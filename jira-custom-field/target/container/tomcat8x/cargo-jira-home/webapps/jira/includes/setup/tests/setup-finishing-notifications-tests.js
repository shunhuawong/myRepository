AJS.test.require("jira.webresources:jira-setup", function() {
    var $ = require("jquery");
    var View = require("jira/setup/setup-finishing-notifications-view");

    var markup = JIRA.Templates.Setup.layoutContent({
        content: JIRA.Templates.Setup.Finishing.pageContent({})
    });

    module("JIRA setup finishing notifications", {
        viewClassname: "jira-setup-finishing-notifications-view",

        setup: function() {
            this.sandbox = sinon.sandbox.create({
                useFakeServer: true,
                useFakeTimers: true
            });
            this.sandbox.spy(AJS, "format");

            $("#qunit-fixture").append(
                $("<div></div>")
                    .addClass(this.viewClassname)
                    .html(markup)
            );
        },

        initializeView: function(){
            this.view = new View({
                el: "." + this.viewClassname
            });

            this.sandbox.stub(this.view, "_navigateToJiraLockedPage");
        },

        teardown: function() {
            this.sandbox.restore();
            this.view.close();
            this.view.remove();
        },

        respondWithNotFoundError: function(){
            this.sandbox.server.requests[0].respond(404, {"Content-Type": "application/json"}, JSON.stringify({}));
        },

        respondWithServerError: function(){
            this.sandbox.server.requests[0].respond(503, {"Content-Type": "application/json"}, JSON.stringify({}));
        },

        respondWithSuccess: function(){
            this.sandbox.server.requests[0].respond(200, {"Content-Type": "application/json"}, JSON.stringify({}));
        },

        assertSetupLevel: function(level){
            equal(this.view._setupLevel, level, "setup level is set to " + level);
        },

        steps: {
            "databasePending": [
                {key: "database", status: "pending"},
                {key: "plugins", status: "awaiting"},
                {key: "environment", status: "awaiting"},
                {key: "finishing", status: "awaiting"}
            ],
            "databaseFailure": [
                {key: "database", status: "failure"},
                {key: "plugins", status: "awaiting"},
                {key: "environment", status: "awaiting"},
                {key: "finishing", status: "awaiting"}
            ],
            "finishingPending": [
                {key: "database", status: "success"},
                {key: "plugins", status: "success"},
                {key: "environment", status: "success"},
                {key: "finishing", status: "pending"}
            ]
        }
    });

    test("if currently pending step is correctly found", function() {
        this.initializeView();

        this.view._steps = this.steps.databasePending;
        equal(this.view._findCurrentlyPendingStep().key, "database", "database is a current pending step");

        this.view._steps = this.steps.databaseFailure;
        ok(!this.view._findCurrentlyPendingStep(), "there is no pending step");

        this.view._steps = this.steps.finishingPending;
        equal(this.view._findCurrentlyPendingStep().key, "finishing", "finishing is a current pending step");
    });

    test("triggerSetup redirects to JiraLockedError page if server responds with 5xx", function(){
        this.initializeView();
        this.view.triggerSetup();

        this.respondWithServerError();

        sinon.assert.calledOnce(this.view._navigateToJiraLockedPage);
    });

    test("_pullState redirects to JiraLockedError page if server responds with 5xx", function(){
        this.initializeView();
        this.view._pullState();

        this.respondWithServerError();

        sinon.assert.calledOnce(this.view._navigateToJiraLockedPage);
    });

    test("_makeRequestFinishingSetup redirects to JiraLockedError page if server responds with 5xx", function(){
        this.initializeView();
        this.view._makeRequestFinishingSetup();

        this.respondWithServerError();

        sinon.assert.calledOnce(this.view._navigateToJiraLockedPage);
    });

    test("triggerSetup doesn't proceed with success / error handlers if the request has been aborted", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_triggerSetupSuccessHandler");
        this.sandbox.spy(this.view, "_triggerSetupErrorHandler");

        this.view.triggerSetup();
        this.view._jqXhrInFlight.abort();

        sinon.assert.notCalled(this.view._triggerSetupSuccessHandler);
        sinon.assert.notCalled(this.view._triggerSetupErrorHandler);
    });

    test("_pullState doesn't proceed with success / error handlers if the request has been aborted", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_pullStateSuccessHandler");
        this.sandbox.spy(this.view, "_pullStateErrorHandler");

        this.view._pullState();
        this.view._jqXhrInFlight.abort();

        sinon.assert.notCalled(this.view._pullStateSuccessHandler);
        sinon.assert.notCalled(this.view._pullStateErrorHandler);
    });

    test("_makeRequestFinishingSetup doesn't proceed with success / error handlers if the request has been aborted", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_makeRequestFinishingSetupSuccessHandler");
        this.sandbox.spy(this.view, "_makeRequestFinishingSetupErrorHandler");

        this.view._makeRequestFinishingSetup();
        this.view._jqXhrInFlight.abort();

        sinon.assert.notCalled(this.view._makeRequestFinishingSetupSuccessHandler);
        sinon.assert.notCalled(this.view._makeRequestFinishingSetupErrorHandler);
    });

    test("triggerSetup calls proper success handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_triggerSetupSuccessHandler");

        this.view.triggerSetup();
        this.respondWithSuccess();

        sinon.assert.calledOnce(this.view._triggerSetupSuccessHandler);
    });

    test("triggerSetup calls proper error handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_triggerSetupErrorHandler");

        this.view.triggerSetup();
        this.respondWithNotFoundError();

        sinon.assert.calledOnce(this.view._triggerSetupErrorHandler);
    });

    test("_pullState calls proper success handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_pullStateSuccessHandler");

        this.view._pullState();
        this.respondWithSuccess();

        sinon.assert.calledOnce(this.view._pullStateSuccessHandler);
    });

    test("_pullState calls proper error handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_pullStateErrorHandler");

        this.view._pullState();
        this.respondWithNotFoundError();

        sinon.assert.calledOnce(this.view._pullStateErrorHandler);
    });

    test("_makeRequestFinishingSetup calls proper success handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_makeRequestFinishingSetupSuccessHandler");

        this.view._makeRequestFinishingSetup();
        this.respondWithSuccess();

        sinon.assert.calledOnce(this.view._makeRequestFinishingSetupSuccessHandler);
    });

    test("_makeRequestFinishingSetup calls proper error handler", function(){
        this.initializeView();

        this.sandbox.spy(this.view, "_makeRequestFinishingSetupErrorHandler");

        this.view._makeRequestFinishingSetup();
        this.respondWithNotFoundError();

        sinon.assert.calledOnce(this.view._makeRequestFinishingSetupErrorHandler);
    });

    test("bootstrapStatePulling aborts current request", function(){
        this.initializeView();

        var abort = this.sandbox.stub();
        this.view._jqXhrInFlight = {abort: abort};
        this.view.bootstrapStatePulling();

        sinon.assert.calledOnce(abort);
    });

    test("bootstrapStatePulling calls triggerSetup if setup level is set to waitingToStart or triggering", function(){
        this.initializeView();
        this.sandbox.stub(this.view, "triggerSetup");

        this.view._setupLevel = "waitingToStart";
        this.view.bootstrapStatePulling();
        sinon.assert.calledOnce(this.view.triggerSetup);

        this.view._setupLevel = "triggering";
        this.view.bootstrapStatePulling();
        sinon.assert.calledTwice(this.view.triggerSetup);
    });

    test("bootstrapStatePulling calls _pullState if setup level is set to triggeringComplete or pullingState", function(){
        this.initializeView();
        this.sandbox.stub(this.view, "_pullState");

        this.view._setupLevel = "triggeringComplete";
        this.view.bootstrapStatePulling();

        sinon.assert.calledOnce(this.view._pullState);

        this.view._setupLevel = "pullingState";
        this.view.bootstrapStatePulling();

        sinon.assert.calledTwice(this.view._pullState);
    });

    test("bootstrapStatePulling calls _makeRequestFinishingSetup if setup level is set to finishing", function(){
        this.initializeView();
        this.sandbox.stub(this.view, "_makeRequestFinishingSetup");

        this.view._setupLevel = "finishing";
        this.view.bootstrapStatePulling();

        sinon.assert.calledOnce(this.view._makeRequestFinishingSetup);
    });

    test("bootstrapStatePulling doesn't take any action if setup level is set to triggeringError, finishingError or complete", function(){
        this.initializeView();

        this.sandbox.stub(this.view, "_makeRequestFinishingSetup");
        this.sandbox.stub(this.view, "_pullState");
        this.sandbox.stub(this.view, "triggerSetup");

        this.view._setupLevel = "triggeringError";
        this.view.bootstrapStatePulling();

        this.view._setupLevel = "finishingError";
        this.view.bootstrapStatePulling();

        this.view._setupLevel = "complete";
        this.view.bootstrapStatePulling();

        sinon.assert.notCalled(this.view._makeRequestFinishingSetup);
        sinon.assert.notCalled(this.view._pullState);
        sinon.assert.notCalled(this.view.triggerSetup);

    });

    test("default setup level is waitingToStart", function(){
        this.initializeView();

        this.assertSetupLevel("waitingToStart");
    });

    test("triggerSetup sets setup level to triggering", function(){
        this.initializeView();

        this.view.triggerSetup();

        this.assertSetupLevel("triggering");
    });

    test("_triggerSetupSuccessHandler sets setup level to triggeringComplete", function(){
        this.initializeView();
        this.sandbox.stub(this.view, "bootstrapStatePulling");

        this.view._triggerSetupSuccessHandler();

        this.assertSetupLevel("triggeringComplete");
    });

    test("_triggerSetupErrorHandler sets setup level to triggeringError", function(){
        this.initializeView();

        this.view._triggerSetupErrorHandler();

        this.assertSetupLevel("triggeringError");
    });

    test("pullState sets setup level to pullingState", function(){
        this.initializeView();

        this.view._pullState();

        this.assertSetupLevel("pullingState");
    });

    test("_makeRequestFinishingSetup sets setup level to finishing", function(){
        this.initializeView();

        this.view._makeRequestFinishingSetup();

        this.assertSetupLevel("finishing");
    });

    test("_makeRequestFinishingSetupErrorHandler sets setup level to finishingError", function(){
        this.initializeView();

        this.view._makeRequestFinishingSetupErrorHandler();

        this.assertSetupLevel("finishingError");
    });

    test("_makeRequestFinishingSetupSuccessHandler sets setup level to complete", function(){
        this.initializeView();

        this.view._makeRequestFinishingSetupSuccessHandler({});

        this.assertSetupLevel("complete");
    });
});