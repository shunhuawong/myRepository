<%--
All changes in this jsp must be mirrored in head-common.jsp
--%>
<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ page import="static com.atlassian.jira.component.ComponentAccessor.*" %>
<%@ page import="com.atlassian.jira.web.pagebuilder.JspDecoratorUtils" %>
<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<%@ taglib uri="jiratags" prefix="jira" %>
<%@ taglib uri="webwork" prefix="ww" %>
<%
    HeaderFooterRendering headerFooterRendering = getComponent(HeaderFooterRendering.class);

    // There's no reason to delay an early brow flush, so we leave this for the chin flush (micro optimisation).
    headerFooterRendering.includeGoogleSiteVerification(out);

    // Extra metadata and resources might have been required since the head-pre was written, so we need to drain
    // and write them out.
    headerFooterRendering.includeMetadata(out);
    headerFooterRendering.includeResources(out);
%>
<title><%= headerFooterRendering.getPageTitle(JspDecoratorUtils.getHead()) %></title>
<link rel="search" type="application/opensearchdescription+xml" href="<%= request.getContextPath()%>/osd.jsp" title="<%= headerFooterRendering.getPageTitle(JspDecoratorUtils.getHead()) %>"/>

