<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ page import="com.atlassian.jira.web.pagebuilder.JspDecoratorUtils" %>
<%
    ComponentAccessor.getComponent(HeaderFooterRendering.class).includeTopNavigation(out, request, JspDecoratorUtils.getBody());
%>