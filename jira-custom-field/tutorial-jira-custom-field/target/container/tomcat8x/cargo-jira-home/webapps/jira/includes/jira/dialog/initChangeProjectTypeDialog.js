AJS.$(function() {
    var ChangeProjectTypeDialog = require('jira/project/admin/change-project-type-dialog');

    AJS.$(".change-project-type-link").each(function(index, item) {
        var $item = AJS.$(item);
        ChangeProjectTypeDialog({
            trigger:$item,
            projectId:$item.data("project-id"),
            onProjectTypeChanged: updateViewProjectPage
        });


    });

    /**
     * Call back function after project type is updated.
     * @param link : the link that triggered the change project type dialog
     * @param updatedProjectType: the updated ProjectTypeBean
     */
    function updateViewProjectPage(link, updatedProjectType){
        var $projectTypeElement = AJS.$(link).closest("tr").find(".cell-type-project-type");
        $projectTypeElement.html(JIRA.Templates.project.ChangeType.updateTargetElement(updatedProjectType));
    }
});