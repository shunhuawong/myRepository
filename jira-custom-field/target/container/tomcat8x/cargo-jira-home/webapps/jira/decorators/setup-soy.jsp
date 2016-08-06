<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.config.properties.APKeys" %>
<%@ page import="com.atlassian.jira.config.properties.ApplicationProperties" %>
<%@ page import="com.atlassian.jira.plugin.webresource.JiraWebResourceManager" %>
<%@ page import="com.atlassian.jira.web.util.ProductVersionDataBeanProvider" %>
<%@ page import="com.atlassian.plugin.webresource.UrlMode" %>
<%@ page import="com.atlassian.plugin.webresource.WebResourceManager" %>
<%@ page import="com.opensymphony.util.TextUtils" %>
<%@ page import="java.util.Map" %>
<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<%@ taglib uri="jiratags" prefix="jira" %>
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui"%>
<%
    final ApplicationProperties applicationProperties = ComponentAccessor.getComponentOfType(ApplicationProperties.class);
    final String jiraTitle = applicationProperties.getDefaultBackedString(APKeys.JIRA_TITLE);
    final String jiraLogoUrl = applicationProperties.getDefaultBackedString(APKeys.JIRA_LF_LOGO_URL);
%>
<!DOCTYPE html>
<html lang="<%= ComponentAccessor.getJiraAuthenticationContext().getI18nHelper().getLocale().getLanguage() %>">
<head>
    <title><%= TextUtils.htmlEncode(jiraTitle) %> - <decorator:title/></title>
    <meta http-equiv="Content-Type" content="<%= applicationProperties.getContentType() %>" />
    <link rel="shortcut icon" href="<%=request.getContextPath()%>/favicon.ico" />
    <decorator:head/>
    <%
        final JiraWebResourceManager webResourceManager = (JiraWebResourceManager) ComponentAccessor.getComponent(WebResourceManager.class);
        webResourceManager.requireResource("jira.webresources:jira-setup");
        webResourceManager.includeResources(out, UrlMode.RELATIVE);

        webResourceManager.putMetadata("dev-mode", String.valueOf(Boolean.getBoolean("jira.dev.mode") || Boolean.getBoolean("atlassian.dev.mode")));

        for (Map.Entry<String, String> metaDataEntry : webResourceManager.getMetadata().entrySet())
        {
            out.write("<meta name=\"ajs-");
            out.write(TextUtils.htmlEncode(metaDataEntry.getKey()));
            out.write("\" content=\"");
            out.write(TextUtils.htmlEncode(metaDataEntry.getValue()));
            out.write("\">\n");
        }
    %>
    <meta name="ajs-setup-session-id" content="<ww:property value="/setupSessionId"/>"/>
    <meta name="ajs-server-id" content="<ww:property value="/serverId"/>"/>
    <meta name="ajs-instant-setup" content="<ww:property value="/instantSetup"/>"/>
    <meta name="ajs-setup-analytics-iframe-url" content="<ww:property value="/analyticsIframeUrl"/>"/>
</head>
<body id="jira" class="aui-layout aui-theme-default <decorator:getProperty property="body.class" />" <%= ComponentAccessor.getComponent(ProductVersionDataBeanProvider.class).get().getBodyHtmlAttributes() %>>
<div id="page">
    <header id="header" role="banner">
        <nav class="aui-header" role="navigation">
            <div class="aui-header-inner">
                <div class="aui-header-primary">
                    <h1 id="logo" class="aui-header-logo">
                        <img src="<%=request.getContextPath() + TextUtils.htmlEncode(jiraLogoUrl)%>" alt="<%=TextUtils.htmlEncode(jiraTitle)%>"/>
                    </h1>
                </div>
            </div>
        </nav>
    </header>
    <section id="content" role="main">
        <decorator:body />
    </section>
    <footer id="footer" role="contentinfo"></footer>
</div>
</body>
</html>
