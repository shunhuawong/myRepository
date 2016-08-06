<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<decorator:usePage id="p"/>
<%
    ComponentAccessor.getComponent(HeaderFooterRendering.class).includeTopNavigation(out, request, p);
%>