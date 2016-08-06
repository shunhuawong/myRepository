AJS.test.require("jira.webresources:jira-setup", function(){
    var $ = require("jquery");
    var Flag = require("jira/flag");

    module("setup-license.js", {
        setup: function() {
            this.fixture = $("#qunit-fixture");
            this.fixture.append(JIRA.Templates.LicenseSetup.pageMockForQUnit({
                macLicense: "AAA"
            }));

            this.sandbox = sinon.sandbox.create({
                useFakeServer: true
            });

            this.sandbox.stub(Flag, "showSuccessMsg");

            this.setupLicenseModule = require("jira/setup/setup-license");
        },

        teardown: function(){
            this.sandbox.restore();

            $("#qunit-fixture").empty();
        },

        find: function(selector){
            return this.fixture.find(selector);
        },

        getSubmitButton: function(){
            return this.find("input[type=submit]").eq(0);
        },

        startPage: function(){
            this.setupLicenseModule.startPage();
        }
    });

    test("existing license form: submit button should be enabled by default", function(){
        this.startPage();

        ok(!this.getSubmitButton().is(":disabled"), "submit button is enabled");
    });

    test("existing license form: submit button is disabled while form is being submitted", function(){
        this.startPage();

        this.find("#importLicenseForm").submit();

        ok(this.getSubmitButton().is(":disabled"), "submit button is disabled");

        this.sandbox.server.requests[0].respond(403, {"Content-Type": "application/json"}, "{}");

        ok(!this.getSubmitButton().is(":disabled"), "submit button is enabled");
    });

    test("m.a.c license is copied into the textarea", function(){
        this.startPage();

        equal(this.find("#licenseKey").html(), "AAA", "License from m.a.c was not copied to the textarea");
    });
});
