AJS.test.require(["jira.webresources:util"], function () {

    var _ = require("underscore");
    var AjaxUtil = require("jira/ajs/ajax/ajax-util");

    module("AjaxUtil");

    var createXHR = function (status, response) {
        return {
            status: status,
            responseText: _.isObject(response) ? JSON.stringify(response) : response
        };
    };

    test("isWebSudoFailure classifies XHR result", function () {
        var websudoValidResponse = {"message": "This resource requires WebSudo.", "status-code": 401};

        ok(AjaxUtil.isWebSudoFailure(createXHR(401, websudoValidResponse)), "Websudo detected.");

        ok(!AjaxUtil.isWebSudoFailure(createXHR(401, null)), "Websudo not detected when null responseText.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(401, undefined)), "Websudo not detected when undefined responseText.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(401, "something")), "Websudo not detected when responseText not relevant.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(401, true)), "Websudo not detected when responseText wrong type.");

        ok(!AjaxUtil.isWebSudoFailure(createXHR(400, "websudo")), "Websudo not detected on wrong status code.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(null, "websudo")), "Websudo not detected on null status code.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(undefined, "websudo")), "Websudo not detected on undefined status code.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR("401", "websudo")), "Websudo not detected when status code wrong type.");
        ok(!AjaxUtil.isWebSudoFailure(createXHR(200, websudoValidResponse)), "Websudo not detected on 200 status ever.");

        ok(!AjaxUtil.isWebSudoFailure(createXHR(null, undefined)), "Websudo not detected bad status and responseText.");
        ok(!AjaxUtil.isWebSudoFailure(null), "Websudo not detected null XHR passed.");
        ok(!AjaxUtil.isWebSudoFailure(undefined), "Websudo not detected undefined XHR passed.");
        ok(!AjaxUtil.isWebSudoFailure(true), "Websudo not detected when truthy value passed.");
        ok(!AjaxUtil.isWebSudoFailure(false), "Websudo not detected when wrong type passed.");
        ok(!AjaxUtil.isWebSudoFailure(10101), "Websudo not detected when number passed.");
    });

    test("getErrorMessageFromXHR uses ErrorCollection in body to generate message", function () {

        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errorMessages: ["Error"]})),
                "Error",
                "Single errorMessage used.");

        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errorMessages: ["Error", "Error 2"]})),
                "Error Error 2",
                "Multiple errorMessages used.");

        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errors: {error: "Error"}})),
                "Error",
                "Single error used.");

        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errors: {error: "Error", error2: "Error 2"}})),
                "Error Error 2",
                "Multiple errors used.");

        //Empty errorMessages should use errors.
        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errorMessages:[], errors: {error: "Error", error2: "Error 2"}})),
                "Error Error 2",
                "Multiple errors used when errorMessages empty");

        //Ignore error messages.
        equal(AjaxUtil.getErrorMessageFromXHR(
                createXHR(401, {errorMessages:["NonEmpty"], errors: {error: "Error", error2: "Error 2"}})),
                "NonEmpty",
                "Ignore error messages when errorMessage available.");
    });

    test("getErrorMessageFromXHR uses XHR to generate message when ErrorCollection not available.", function () {

        equal(
            AjaxUtil.getErrorMessageFromXHR(createXHR(401, undefined)),
            "common.ajax.unauthorised.alert",
            "Error message returned when no error collection.");

        equal(
            AjaxUtil.getErrorMessageFromXHR(createXHR(204, "<xml>badErrorCollection<a></a></xml>")),
            "common.ajax.servererror",
            "Error message returned with bad error collection.");
    });
});
