<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<ww:bean name="'com.atlassian.jira.util.JiraDateUtils'" id="dateUtils"/>
<html>
<head>
    <title><ww:text name="'cloneissue.title'"/></title>
    <ww:if test="/currentTask/finished == false">
        <meta http-equiv="refresh" content="2">
    </ww:if>
</head>
<body>
<div id="cloneissueprogressform">
    <page:applyDecorator id="cloneissueprogressform" name="jiraform">
        <page:param name="action">CloneIssueProgress.jspa</page:param>
        <page:param name="formName">cloneissueprogressform</page:param>
        <page:param name="method">get</page:param>
        <page:param name="columns">1</page:param>
        <page:param name="width">100%</page:param>
        <page:param name="title"><ww:text name="'cloneissue.title'"/></page:param>
        <page:param name="submitId">refresh_submit</page:param>
        <page:param name="submitName"><ww:text name="'admin.common.words.refresh'"/></page:param>
        <tr bgcolor="#ffffff">
            <td>
                <ui:component template="taskdescriptor.jsp" name="'/currentTask'"/>
            </td>
        </tr>
        <ui:component name="'taskId'" template="hidden.jsp"/>
    </page:applyDecorator>
</div>
</body>
</html>
