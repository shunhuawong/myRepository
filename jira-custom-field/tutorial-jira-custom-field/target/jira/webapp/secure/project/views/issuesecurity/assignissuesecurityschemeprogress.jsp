<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<ww:bean name="'com.atlassian.jira.util.JiraDateUtils'" id="dateUtils"/>
<html>
<head>
    <title><ww:text name="'admin.iss.security.scheme'"/></title>
    <meta name="admin.active.section" content="atl.jira.proj.config"/>
    <ww:if test="/currentTask/finished == false">
        <meta http-equiv="refresh" content="5">
    </ww:if>
</head>
<body>
<div id="project-assign-issue-security-form">
    <page:applyDecorator name="jiraform">
        <page:param name="formName">assignissuesecurityprogressform</page:param>
        <page:param name="method">get</page:param>
        <page:param name="columns">1</page:param>
        <page:param name="width">100%</page:param>
        <page:param name="title"><ww:text name="'admin.iss.associate.security.scheme.to.project'"/></page:param>
        <page:param name="instructions">
            <ww:if test="/currentTask/finished == true && /currentTask/userWhoStartedTask == false">
                <aui:component template="auimessage.jsp" theme="'aui'">
                    <aui:param name="'messageType'">info</aui:param>
                    <aui:param name="'messageHtml'">
                        <p>
                            <ww:text name="'common.tasks.cant.acknowledge.task.you.didnt.start'">
                                <ww:param name="'value0'"><a
                                        href="<ww:property value="/currentTask/userURL"/>"><ww:property
                                        value="/currentTask/user/name"/></a></ww:param>
                            </ww:text>
                        </p>
                    </aui:param>
                </aui:component>
            </ww:if>
        </page:param>
        <tr bgcolor="#ffffff">
            <td>
                <ui:component template="taskdescriptor.jsp" name="'/currentTask'"/>
                <ww:if test="/currentTask/finished == true">
                    <page:param name="action">AcknowledgeTask.jspa</page:param>
                    <ww:if test="/currentTask/userWhoStartedTask == true">
                        <page:param name="submitId">acknowledge_submit</page:param>
                        <page:param name="submitName"><ww:text name="'common.words.acknowledge'"/></page:param>
                        <ui:component name="'taskId'" template="hidden.jsp"/>
                    </ww:if>
                    <ww:else>
                        <page:param name="submitId">done_submit</page:param>
                        <page:param name="submitName"><ww:text name="'common.words.done'"/></page:param>
                    </ww:else>
                </ww:if>
                <ww:else>
                    <page:param name="action">AssignIssueSecuritySchemeProgress.jspa</page:param>
                    <page:param name="submitId">refresh_submit</page:param>
                    <page:param name="submitName"><ww:text name="'admin.common.words.refresh'"/></page:param>
                </ww:else>
                <ui:component name="'taskId'" template="hidden.jsp"/>
                <ui:component name="'projectId'" template="hidden.jsp"/>
                <ui:component name="'destinationURL'" template="hidden.jsp"/>
            </td>
        </tr>
    </page:applyDecorator>
</div>
</body>
</html>
