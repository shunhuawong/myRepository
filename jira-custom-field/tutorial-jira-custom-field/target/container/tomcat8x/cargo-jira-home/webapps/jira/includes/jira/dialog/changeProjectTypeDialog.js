define('jira/project/admin/change-project-type-dialog',[
    'jquery',
    'underscore',
    'jira/message',
    'jira/ajs/select/single-select',
    'wrm/context-path'
], function(
    $,
    _,
    message,
    SingleSelect,
    contextPath
) {
    function _getProjectInformation(projectId) {
        return $.ajax({
            url : contextPath() + "/rest/internal/2/projects/" + projectId + "/changetypedata",
            dataType: "json",
            contentType: "application/json",
            type:  "GET"
        });
    }

    function handleChangeProjectType(options){
        var $projectTypeSelect = $(".project-type-select", options.dialogBody);
        var selectedProjectTypeKey = $projectTypeSelect.val()[0];
        var selectedProjectType = _.findWhere(options.projectTypes, {key: selectedProjectTypeKey});
        $(".dialog-change-button", options.dialogBody).attr('disabled', 'disabled');

        $($.ajax({
            url : contextPath() + "/rest/api/2/project/" + options.projectId + "/type/" + selectedProjectTypeKey,
            dataType: "json",
            contentType: "application/json",
            type:  "PUT"
        }).done(function(){
            options.changeProjectTypeDialog.hide();

            if(options.onProjectTypeChanged) {
                options.onProjectTypeChanged(options.trigger, selectedProjectType);
            }

            message.showSuccessMsg(JIRA.Templates.project.ChangeType.successMsg({
                projectName:options.projectName,
                projectTypeName: selectedProjectType.formattedKey
            }));

            AJS.EventQueue.push({
                name: "administration.projecttype.change",
                properties: {
                    projectId: options.projectId,
                    sourceProjectType: _normalizeProjectTypeKey(options.sourceProjectType),
                    destinationProjectType: _normalizeProjectTypeKey(selectedProjectTypeKey)
                }
            });
        }).fail(function(){
            $(".aui-dialog2-content",options.dialogBody).prepend(aui.message.error({
                content: AJS.I18n.getText("admin.projects.change.project.type.error", '<a href="https://support.atlassian.com/">', "</a>")
            }));
        })).throbber({target:$(".throbber", options.dialogBody)});
    }

    /**
     * Transform project type key to a format accepted as an analytics event property value
     * E.g. service_desk is not accepted as it contains _
     */
    function _normalizeProjectTypeKey(projectTypeKey) {
        return projectTypeKey && projectTypeKey.replace("_", "");
    }

    function toggleChangeButton(selectedType, currentType, $dialogBody){
        if(selectedType == currentType ){ // eslint-disable-line eqeqeq
            $dialogBody.find(".dialog-change-button").attr("disabled", "disabled");
        }else{
            $dialogBody.find(".dialog-change-button").removeAttr("disabled");
        }
    }
    /**
     * init the change project dialog
     * @param {Object} options
     * {projectIdOrKey: the project to be changed,
     * trigger: the link to trigger this dialog,
     * onProjectTypeChanged: the function to be called after project type is changed. }
     */
    function initDialog(options) {
        var $dialogBody = $(JIRA.Templates.project.ChangeType.changeProjectTypeDialog({projectId:options.projectId}));
        var changeProjectTypeDialog = AJS.dialog2($dialogBody);

        changeProjectTypeDialog.on("show", function() {
            $(".aui-dialog2-content", $dialogBody).html(JIRA.Templates.project.ChangeType.dialogSpinner());
            $(".dialog-spinner", $dialogBody).spin();

            $(".dialog-change-button", $dialogBody).unbind("click").addClass("hidden");
        });

        $(options.trigger).click(function(e) {
            e.preventDefault();

            changeProjectTypeDialog.show();

            _getProjectInformation(options.projectId).done(function(resp) {
                $dialogBody.find(".aui-dialog2-content").html(JIRA.Templates.project.ChangeType.changeProjectTypeForm(resp));
                new SingleSelect({
                    element: $(".project-type-select", $dialogBody),
                    revertOnInvalid: true,
                    width: 165
                });
                $dialogBody.find(".dialog-change-button").removeClass("hidden");

                toggleChangeButton($(".project-type-select", $dialogBody).val(), resp.project.projectTypeKey, $dialogBody) ;

                var $changeData = {
                    dialogBody: $dialogBody,
                    changeProjectTypeDialog: changeProjectTypeDialog,
                    projectName: resp.project.name,
                    projectTypes: resp.projectTypes,
                    trigger: options.trigger,
                    projectId: options.projectId,
                    onProjectTypeChanged: options.onProjectTypeChanged,
                    sourceProjectType: resp.project.projectTypeKey
                };

                $(".dialog-change-button", $dialogBody).click(function(e) {
                    e.preventDefault();
                    handleChangeProjectType($changeData);

                });

                $(".change-project-type-form", $dialogBody).on("submit", function(e) {
                    e.preventDefault();
                    handleChangeProjectType($changeData);
                });

                $(".project-type-select", $dialogBody).on("change", function(e) {
                    toggleChangeButton($(this).val(), resp.project.projectTypeKey, $dialogBody) ;
                });

            }).fail(function() {
                $(".aui-dialog2-content",$dialogBody).html(aui.message.error({
                    content: AJS.I18n.getText("admin.projects.change.project.type.data.error", '<a href="https://support.atlassian.com/">', "</a>")
                }));
            });
        });

        $(".dialog-close-button", $dialogBody).click(function(e) {
            e.preventDefault();
            changeProjectTypeDialog.hide();
        });
    }

    return function(options) {
        initDialog(options);
    };
});
