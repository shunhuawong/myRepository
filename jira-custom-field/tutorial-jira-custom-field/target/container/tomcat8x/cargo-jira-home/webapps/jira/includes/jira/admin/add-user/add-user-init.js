;require([
    "jira/admin/application-selector",
    "jira/skate",
    "jquery",
    "aui/inline-dialog2", //Initialise the inlineDialog2. This is all that is required
    "aui/form-notification" //Initialise form notifications. This is all that is required
], function(
    ApplicationSelector,
    skate,
    $
) {
    var applicationPickerSelector = ".application-picker";

    $(function () {
        var $applicationSelector = $(applicationPickerSelector);
        var applicationSelectorElement = $applicationSelector[0];
        var applicationSelector = new ApplicationSelector({
            el: $applicationSelector
        });

        // skate is slow, we need to help it catch up (otherwise custom elements would not get initialized)
        applicationSelectorElement && skate.init(applicationSelectorElement);
        applicationSelector.selectApplicationsBasedOnURL();

        var $sendEmailLabel = $('.send-email-help');
        $sendEmailLabel.tooltip({
            gravity: "w",
            trigger: 'manual',
            className: 'aui-form-notification-tooltip aui-form-notification-tooltip-info'
        });
        $('#sendEmail')
            .focus(function() {
                $sendEmailLabel.tipsy("show");
            })
            .blur(function() {
                $sendEmailLabel.tipsy("hide");
            });
    });
});
