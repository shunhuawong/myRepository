if (!AJS.isDevMode) {
    AJS.isDevMode = function() {
        return AJS.Meta.get("dev-mode");
    }
}

// 30 second timeout on all requests by default.
AJS.$.ajaxSetup({timeout: 30000});

define("jira/setup/setup-license", ["jquery", "jira/flag"], function($, Flag){

    var $existingLicenseForm;
    var $licenseInputContainer;
    var $macLink;

    function showFormError(title, msg) {
        AJS.messages.error("#formError", {
            title: title,
            body: msg,
            closeable: false
        });
        AJS.$("#formError").scrollIntoView();
    }

    function generalErrorLogging() {
        showFormError(AJS.I18n.getText("setupLicense.error.unknown.title"), AJS.I18n.getText("setupLicense.error.unknown.desc", "<a href='https://support.atlassian.com' target='_blank'>", "</a>"));
    }

    function showForm() {
        $licenseInputContainer.children().detach();
        $licenseInputContainer.append($existingLicenseForm).removeClass("hidden");
    }

    var startPage = function(){

        var licenseKey;
        var serializeObject = function(obj)
        {
            var o = {};
            var a = obj.serializeArray();
            AJS.$.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };

        // prepare the form
        $existingLicenseForm = $(JIRA.Templates.LicenseSetup.renderExistingLicenseForm({
            serverId: AJS.Meta.get('server-id')
        }));
        $existingLicenseForm.submit(_.compose(
            formSubmitCleanup,
            existingLicenseFormSubmit,
            showSpinner,
            disableSubmit,
            clearErrorsOnForm,
            preventDefaultOnEvent,
            disableMacLink
        ));
        $macLink = $existingLicenseForm.find('#generate-mac-license');
        $macLink.attr("href", $('#mac-redirect').data('mac-redirect-url'));
        fillFormWithLicenseFromMac();

        $licenseInputContainer = AJS.$("#license-input-container");

        function getEventRef(e) {
            return e.target || e.srcElement;
        }

        function verifyLicense(licenseKey) {
            return AJS.$.ajax({
                url: contextPath + "SetupLicense!validateLicense.jspa?licenseToValidate=" + licenseKey,
                type: "POST"
            });
        }

        function errorVerifyingLicense(jqXHR, textStatus) {
            if (jqXHR.status === 403) {
                var licenseErrors = JSON.parse(jqXHR.responseText);
                showFormErrorList(AJS.I18n.getText("setup.importlicense.validation.failure.header"), licenseErrors.errors);
            } else {
                generalErrorLogging(jqXHR, textStatus);
            }
        }

        function submitLicenseKey() {
            AJS.$("#setupLicenseKey").val(licenseKey);
            AJS.$("#setupLicenseForm").submit();
        }

        function existingLicenseFormSubmit(e) {
            clearErrorsOnForm();

            var mainDeferred = jQuery.Deferred();
            var formValues = serializeObject(AJS.$(getEventRef(e)));
            var licenseVerificationDeferred = verifyLicense(formValues.licenseKey);

            licenseVerificationDeferred.fail(errorVerifyingLicense);
            licenseVerificationDeferred.fail(function() { mainDeferred.reject(); });

            licenseVerificationDeferred.done(function() {
                licenseKey = formValues.licenseKey;
                mainDeferred.resolve();
            });

            return mainDeferred;
        }

        function showFormErrorList(title, msgList) {
            var errorStr = "";
            _.map(msgList, function(msg) {
                errorStr += msg + "<br />";
            });
            AJS.messages.error("#formError", {
                title: title,
                body: errorStr,
                closeable: false
            });
            AJS.$("#formError").scrollIntoView();
        }

        function preventDefaultOnEvent(e) {
            e.preventDefault();
            return e;
        }

        //function clearGeneralErrorsOnForm(e) {
        //    AJS.$(".aui-message.error").remove();
        //    return e;
        //}

        function clearErrorsOnForm(e) {
            AJS.$(".error").remove();
            clearWarningsOnForm();
            return e;
        }

        function clearWarningsOnForm() {
            AJS.$(".warn").remove();
        }

        function disableSubmit(e) {
            AJS.$(getEventRef(e)).find(":submit").attr("disabled", "disabled");
            return e;
        }

        function showSpinner(e) {
            var spinnerMessage = getSpinnerMessage(e);
            AJS.$(getEventRef(e)).find(".throbbers-placeholder").append(JIRA.Templates.LicenseSetup.renderSpinner({msg: spinnerMessage}));
            return e;
        }

        function getSpinnerMessage(){
            return AJS.I18n.getText("setupLicense.existing.license.spinner");
        }

        function formSubmitCleanup(deferred) {
            deferred
                .fail(function() {
                    $licenseInputContainer.find(":submit").removeAttr("disabled");
                    $macLink.off("click");
                    $licenseInputContainer.find(".throbber-message").remove();
                })
                .done(function(){
                    submitLicenseKey();
                });
        }

        function disableMacLink(event) {
            $macLink.click(function(e) { e.preventDefault(); });
            return event;
        }

        function fillFormWithLicenseFromMac() {
            var macLicense = $("#setupLicenseKey").val();
            if (macLicense.trim())  {
                setTimeout(function() { Flag.showSuccessMsg(
                    AJS.I18n.getText("setupLicense.flag.title"),
                    AJS.I18n.getText("setupLicense.flag.text"),
                    { close : "auto" }
                )}, 1000);
                $existingLicenseForm.find('#licenseKey').text(macLicense);
            }
        }

        showForm();
    };

    // while this file is not fully converted to an AMD module, let's export methods we want to test
    return {
        startPage: startPage
    };
});