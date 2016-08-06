<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<ww:bean name="'com.atlassian.jira.util.JiraDateUtils'" id="dateUtils" />
<html>
<head>
	<title><ww:text name="'admin.project.import.progress.title'"/></title>
    <ww:if test="hasErrorMessages == 'false'">
        <meta http-equiv="refresh" content="5">
    </ww:if>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/import_export_section"/>
    <meta name="admin.active.tab" content="project_import"/>
</head>
<body>
    <div id="project-import-panel">
        <div>
            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.progressTracker.progressTracker'">
                <ui:param name="'steps'" value="/progressTrackerSteps"/>
            </ui:soy>
            <br>
            <page:applyDecorator id="project-import" name="auiform">
                <page:param name="action"><ww:property value="/submitUrl"/></page:param>
                <page:param name="cssClass">top-label dont-default-focus</page:param>
                <ww:if test="hasErrorMessages == 'false'">
                    <page:param name="submitButtonName"><ww:text name="'admin.common.words.refresh'"/></page:param>
                    <page:param name="submitButtonText"><ww:text name="'admin.common.words.refresh'"/></page:param>
                </ww:if>
                <ww:else>
                    <page:param name="cancelLinkURI">ProjectImportSelectBackup!default.jspa</page:param>
                </ww:else>
                <tr bgcolor="#ffffff"><td>
                    <ui:component template="taskdescriptor.jsp" name="'/ourTask'"/>
                </td></tr>
                <ui:component name="'redirectOnComplete'" template="hidden.jsp"/>
            </page:applyDecorator>
        </div>
    </div>
</body>
</html>
