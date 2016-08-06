(function(jptDialogController) {
    "use strict";

    require(["jquery", "jira/loading/loading"],
        (function ($, Loading) {
            Loading.showLoadingIndicator();
            $(function () {
                AJS.bind("remove.dialog", function () {
                    Loading.showLoadingIndicator();
                    setTimeout(function () {
                        window.location.href = contextPath + "/secure/MyJiraHome.jspa";
                    }, 0);
                });
                Loading.hideLoadingIndicator();

                var projectTypeKey = $('#projectTypeKey').data('project-type-key');
                jptDialogController.openWithFirstProjectTemplateOfTypePreSelected(projectTypeKey);
            });
        }));
})(JPT.DialogController);

