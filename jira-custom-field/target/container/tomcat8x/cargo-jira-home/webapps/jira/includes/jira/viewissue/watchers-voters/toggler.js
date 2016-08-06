define('jira/viewissue/watchers-voters/toggler', ['require'], function(require) {
    var SmartAjax = require('jira/ajs/ajax/smart-ajax');
    var Messages = require('jira/flag');
    var $ = require('jquery');
    var contextPath = require('wrm/context-path');

    var toggleVotingAndWatching = function(trigger, className, resultContainer, issueOpTrigger, i18n) {

        var classNameOn = className + "-on";
        var classNameOff = className + "-off";
        var restPath = "/voters";
        var spinner = trigger.next('.icon');
        var data;
        var method = "POST";

        if(trigger.hasClass(classNameOn)) {
            method = "DELETE";
        }

        if(className.indexOf("watch") !== -1) {
            restPath = "/watchers";
        }
        trigger.removeClass(classNameOn).removeClass(classNameOff);

        if (method === "POST") {
            // If we are a post we want to include dummy data to prevent JRA-20675 BUT we cannot have data for DELETE
            // otherwise we introduce JRA-23257
            data = {
                dummy: true
            };
        }

        $(SmartAjax.makeRequest({
            url:contextPath() + "/rest/api/1.0/issues/" + trigger.attr("rel") + restPath,
            type: method,
            dataType: "json",
            data: data,
            contentType: "application/json",
            complete: function (xhr, textStatus, smartAjaxResult) {
                var optIn = method === "POST";
                if (smartAjaxResult.successful) {
                    if(optIn) {
                        trigger.addClass(classNameOn);
                        trigger.text(i18n.titleOn);
                        issueOpTrigger.attr("title", i18n.titleOn).text(i18n.textOn);
                    } else {
                        trigger.addClass(classNameOff);
                        trigger.text(i18n.titleOff);
                        issueOpTrigger.attr("title", i18n.titleOff).text(i18n.textOff);
                    }

                    resultContainer.text(smartAjaxResult.data.count);
                    resultContainer[optIn ? "addClass" : "removeClass"](classNameOn);
                    resultContainer[optIn ? "removeClass" : "addClass"](classNameOff);
                } else {
                    if (!smartAjaxResult.aborted) {
                        displayErrorMessage(smartAjaxResult);
                    }
                    if(optIn) {
                        trigger.addClass(classNameOff);
                        trigger.text(i18n.titleOff);
                        issueOpTrigger.attr("title", i18n.titleOff).text(i18n.textOff);
                    } else {
                        trigger.addClass(classNameOn);
                        trigger.text(i18n.titleOn);
                        issueOpTrigger.attr("title", i18n.titleOn).text(i18n.textOn);
                    }
                }
            }
        })).throbber({target: spinner});
    };

    var displayErrorMessage = function(smartAjaxResult) {
        var message = SmartAjax.buildSimpleErrorContent(smartAjaxResult,{ alert : true });
        if (smartAjaxResult.hasData) {
            var data = JSON.parse(smartAjaxResult.data);
            if (data.errorMessages) {
                message = data.errorMessages[0];
            }
        }
        Messages.showErrorMsg(message, { closeable: true });
    };

    $(document).delegate("#toggle-vote-issue", "click", function(e) {
        e.preventDefault();
        $("#vote-toggle").click();
    });

    $(document).delegate("#toggle-watch-issue", "click", function(e) {
        e.preventDefault();
        $("#watching-toggle").click();
    });

    var addI18nErrorCodes = function(i18n) {
        $("input[type=hidden][id|=error]").each(function(index, elem) {
            var i18n_id = elem.id.replace("error-", "");
            i18n[i18n_id] = elem.value;
        });
    };

    $(document).delegate("#vote-toggle", "click", function(e) {
        e.preventDefault();
        var i18n = {
            titleOn: AJS.I18n.getText("issue.operations.simple.voting.alreadyvoted"),
            titleOff: AJS.I18n.getText("issue.operations.simple.voting.notvoted"),
            textOn: AJS.I18n.getText("issue.operations.simple.unvote"),
            textOff: AJS.I18n.getText("issue.operations.simple.vote"),
            actionTextOff: AJS.I18n.getText("common.concepts.vote"),
            actionTextOn: AJS.I18n.getText("common.concepts.voted")
        };
        var trigger = $(this);
        var resultContainer = $(document.querySelectorAll("#vote-data"));
        var issueOpTrigger = $(document.querySelectorAll("#toggle-vote-issue"));
        addI18nErrorCodes(i18n);
        toggleVotingAndWatching(trigger, "vote-state", resultContainer, issueOpTrigger, i18n);
    });

    $(document).delegate("#watching-toggle", "click", function(e) {
        e.preventDefault();
        var i18n = {
            titleOn: AJS.I18n.getText("issue.operations.simple.stopwatching"),
            titleOff: AJS.I18n.getText("issue.operations.simple.startwatching"),
            textOn: AJS.I18n.getText("issue.operations.unwatch"),
            textOff: AJS.I18n.getText("issue.operations.watch"),
            actionTextOff: AJS.I18n.getText("common.concepts.watch"),
            actionTextOn: AJS.I18n.getText("common.concepts.watching")
        };
        var trigger = $(this);
        var resultContainer = $(document.querySelectorAll("#watcher-data"));
        var issueOpTrigger = $(document.querySelectorAll("#toggle-watch-issue"));
        addI18nErrorCodes(i18n);
        toggleVotingAndWatching(trigger, "watch-state", resultContainer, issueOpTrigger, i18n);
    });
});
