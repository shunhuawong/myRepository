<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.config.ReindexMessageManager" %>
<%@ page import="com.atlassian.jira.security.JiraAuthenticationContext" %>
<%@ page import="com.atlassian.jira.security.PermissionManager" %>
<%@ page import="com.atlassian.jira.security.Permissions" %>
<%@ page import="org.apache.commons.lang.StringUtils" %>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils" %>
<%
    ReindexMessageManager reindexMessageManager = ComponentAccessor.getComponentOfType(ReindexMessageManager.class);
    JiraAuthenticationContext authenticationContext = ComponentAccessor.getComponentOfType(JiraAuthenticationContext.class);
    final boolean isAdmin = ComponentAccessor.getComponentOfType(PermissionManager.class).hasPermission(Permissions.ADMINISTER, authenticationContext.getUser());
    final String message = reindexMessageManager.getMessage(authenticationContext.getUser());
    if (isAdmin && !StringUtils.isBlank(message))
    {
%>

<script language="JavaScript" type="text/javascript">
    AJS.$(function() {
        require(['jquery', 'jira/flag'], function ($, flag) {
            flag.showInfoMsg(null, "<%= StringEscapeUtils.escapeEcmaScript(message) %>", { dismissalKey: "<%= ReindexMessageManager.DISMISSAL_FLAG%>" });
        });
    })
</script>
<%
    }
%>
