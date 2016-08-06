;define("jira/license-banner", ["jquery", "jira/flag", "aui/banner"], function($, flag, banner) {
    "use strict";

    var rest = function (resource, trace) {
        return $.ajax({
            type: "POST",
            url: contextPath + "/rest/internal/1.0/licensebanner/" + resource,
            contentType: "application/json"
        }).always(function () {
            JIRA.trace(trace);
        });
    };

    var slideUpAndRemove = function ($el) {
        $el.slideUp(function () {
            $el.remove();
        });
    };

    var remindLater = function () {
        rest("remindlater", "license-later-done");
    };

    function showLicenseFlag (content) {
        if (content && content.length) {
            var licenseFlag = flag.showWarningMsg(null, content);
            if (licenseFlag) {
                var $licenseFlag = $(licenseFlag);

                $licenseFlag.on('aui-flag-close', remindLater);

                $(".icon-close").click(function (e) {
                    e.preventDefault();
                    $licenseFlag[0].close();
                    remindLater()
                    ;
                });
            }
        }
        JIRA.trace("license-flag-checked");
    }

    function showLicenseBanner(content) {
        if (content && content.length) {
            var $banner = banner({body: content});

            $("#license-banner-later").click(function (e) {
                e.preventDefault();

                slideUpAndRemove($banner);
                remindLater();
            });
        }
        JIRA.trace("license-banner-checked");
    }

    return {
        showLicenseFlag: showLicenseFlag,
        showLicenseBanner: showLicenseBanner
    };
});
