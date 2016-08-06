<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.plugin.webresource.UrlMode" %>
<%@ page import="com.atlassian.plugin.webresource.WebResourceManager" %>
<%@ taglib prefix="decorator" uri="http://www.opensymphony.com/sitemesh/decorator" %>
<!DOCTYPE html>
<html lang="<%= ComponentAccessor.getJiraAuthenticationContext().getI18nHelper().getLocale().getLanguage() %>">
<head>
<%
    WebResourceManager webResourceManager = ComponentAccessor.getWebResourceManager();
    webResourceManager.requireResourcesForContext("jira.inline.dialog");
    webResourceManager.requireResourcesForContext("atl.inline.dialog");
    webResourceManager.includeResources(out, UrlMode.RELATIVE);
%>
</head>
<body class="aui-layout aui-theme-default page-type-inlinedialog">
<decorator:body />
<%@ include file="/includes/decorators/xsrftoken.jsp" %>
</body>
</html>