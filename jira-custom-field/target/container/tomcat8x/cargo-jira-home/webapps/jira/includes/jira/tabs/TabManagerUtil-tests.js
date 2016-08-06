AJS.test.require(["jira.webresources:manageshared"], function(){
    var TabManagerUtil = require("jira/tabs/tab-manager/util");

    module("TabManagerUtil", {
        setup: function(){
            this.initializeUtil("/initial/url?returnUrl=location&view=search");
        },

        initializeUtil: function(initialUrl){
            this.util = new TabManagerUtil(initialUrl, "view", /view=[^&]*/);
        }
    });

    test("test constructCompleteUrl()", function(){
        equal(this.util.constructCompleteUrl("/initial/url?view=filter"), "/initial/url?returnUrl=location&view=filter");
        equal(this.util.constructCompleteUrl("/initial/url"), "/initial/url?returnUrl=location");

        // links' hrefs should contain only one parameter in query string
        equal(this.util.constructCompleteUrl("/initial/url?view=filter&other=value"), "/initial/url?returnUrl=location&view=filter");
    });

    test("test getTabParamFromUrl()", function(){
        equal(this.util.getTabParamFromUrl("/initial/url?view=filter"), "view=filter");
        equal(this.util.getTabParamFromUrl("/initial/url?param=value"), "");
    });

    test("test updateInitialUrl()", function(){
        var href = "/initial/url?view=something";
        var noParam = "/initial/url?something=else";

        this.initializeUtil("/initial/url");
        equal(this.util.updateInitialUrl(href), "/initial/url?view=something");

        this.initializeUtil("/initial/url");
        equal(this.util.updateInitialUrl(noParam), "/initial/url");

        this.initializeUtil("/initial/url?view=value");
        equal(this.util.updateInitialUrl(href), "/initial/url?view=something");

        this.initializeUtil("/initial/url?view=value&param=thing");
        equal(this.util.updateInitialUrl(href), "/initial/url?view=something&param=thing");
    });
});