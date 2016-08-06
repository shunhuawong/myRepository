<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ page import="static com.atlassian.jira.component.ComponentAccessor.*" %>
<section class="footer-body">
<%
    HeaderFooterRendering footerRendering = getComponent(HeaderFooterRendering.class);
    footerRendering.includeFooters(out, request);
    // include web panels
    footerRendering.includeWebPanels(out, "atl.footer");
%>
    <div id="footer-logo"><a rel="nofollow" href="http://www.atlassian.com/">Atlassian</a></div>
</section>
<jsp:include page="/includes/decorators/global-translations.jsp" />