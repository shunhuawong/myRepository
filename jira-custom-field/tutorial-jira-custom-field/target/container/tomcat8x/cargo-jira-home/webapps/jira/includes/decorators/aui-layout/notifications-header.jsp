<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.plugin.navigation.BannerRenderer" %>
<%@ include file="/includes/decorators/license-banner.jsp" %>
<%
    ComponentAccessor.getComponent(BannerRenderer.class).writeBanners(out);
%>
