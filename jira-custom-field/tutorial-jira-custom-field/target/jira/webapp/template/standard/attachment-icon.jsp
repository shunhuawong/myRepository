<%@ page import="com.atlassian.jira.component.ComponentAccessor"%>
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<ui:soy moduleKey="'com.atlassian.jira.jira-view-issue-plugin:soy-templates'" template="'JIRA.Templates.ViewIssue.renderAttachmentLegacyIcon'">
    <ui:param name="'mimetype'"><ww:property value="parameters['mimetype']" /></ui:param>
    <ui:param name="'baseurl'"><ww:property value="applicationProperties/string('jira.baseurl')"/></ui:param>
</ui:soy>