AJS.test.require("jira.webresources:util-lite", function() {
    module("Navigator#isIE", {
        setup: function() {
            this.sandbox = sinon.sandbox.create();
            this.context = AJS.test.context();
            this.defaultUserAgent = window.navigator.userAgent;
        },
        teardown: function() {
            this.sandbox.restore();

            stubUserAgent(this.defaultUserAgent);
        }
    });

    test("has an API for checking the browser's family", function() {
        var Navigator = this.context.require("jira/util/navigator");

        equal(typeof Navigator.isIE, "function", "Internet Explorer");
        equal(typeof Navigator.isEdge, "function", "Edge");
        equal(typeof Navigator.isWebkit, "function", "Webkit-based");
        equal(typeof Navigator.isSafari, "function", "Safari");
        equal(typeof Navigator.isChrome, "function", "Google Chrome");
        equal(typeof Navigator.isMozilla, "function", "Mozilla (Firefox)");
        equal(typeof Navigator.isOpera, "function", "Opera");
    });

    test("has an API for checking the browser's version", function() {
        var Navigator = this.context.require("jira/util/navigator");
        var $ = this.context.require("jquery");

        equal(typeof Navigator.majorVersion, "function", "Can check browser's major version number");
        equal(typeof Navigator.majorVersion(), "number", "returns a number");
    });

    test("using workaround for Edge detection", function() {
        stubUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        var Navigator = this.context.require("jira/util/navigator");
        var $ = this.context.require("jquery");

        ok(Navigator.isIE(), "detected IE");
        ok(Navigator.isEdge(), "detected Edge");
        equal(Navigator.majorVersion(), 12, "Edge major version is 12");
        equal($.browser.version, 12, "$.browser.version");
        equal($.browser.msie, true, "$.browser.msie");
        equal($.browser.mozilla, false, "$.browser.mozilla");
    });

    test("detect Edge UA as IE", function() {
        stubUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10");
        var Navigator = this.context.require("jira/util/navigator");
        var $ = this.context.require("jquery");

        ok(Navigator.isIE(), "detected IE");
        ok(Navigator.isEdge(), "detected Edge");
        ok(Navigator.majorVersion(), 12, "Edge major version is 12");
        equal($.browser.version, 12, "$.browser.version");
        equal($.browser.msie, true, "$.browser.msie");
        equal($.browser.mozilla, false, "$.browser.mozilla");
    });

    test("do not detect Edge given MSIE 11 UA", function() {
        stubUserAgent("Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.3; Trident/7.0; Touch)");
        var Navigator = this.context.require("jira/util/navigator");
        var $ = this.context.require("jquery");

        ok(Navigator.isIE(), "detected IE");
        ok(!Navigator.isEdge(), "not detected Edge");
    });

    var stubUserAgent = function(userAgent) {
        navigator.__defineGetter__('userAgent', function(){
            return userAgent;
        });
    };
});
