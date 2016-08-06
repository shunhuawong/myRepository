AJS.test.require(["jira.webresources:page-loading-indicator"], function() {
    var Loading = require("jira/loading/loading");

    module("Loading");

    test("isVisible() correctly reflects the state", function () {
        ok(!Loading.isVisible());
        Loading.showLoadingIndicator();
        ok(Loading.isVisible());
        Loading.hideLoadingIndicator();
    });

    test("supports delaying loading indicator", function () {
        ok(!Loading.isVisible(), "Loading indicator should be hidden initially.");

        Loading.showLoadingIndicator({
            delay: 20
        });

        stop();

        setTimeout(function () {
            start();
            ok(!Loading.isVisible(), "Loading indicator should still be hidden, due to the delay.");
            stop();
        }, 10);

        setTimeout(function () {
            start();
            ok(Loading.isVisible(), "Loading indicator should be visible, since the delay has elapsed.");
            Loading.hideLoadingIndicator();
        }, 30);
    });
});
