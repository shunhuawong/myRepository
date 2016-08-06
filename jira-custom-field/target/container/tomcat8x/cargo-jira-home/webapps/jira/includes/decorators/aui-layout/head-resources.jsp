<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ page import="com.atlassian.web.servlet.api.LocationUpdater" %>

<!--[if IE]><![endif]--><%-- Leave this here - it stops IE blocking resource downloads - see http://www.phpied.com/conditional-comments-block-downloads/ --%>
<script type="text/javascript">var contextPath = '<%=request.getContextPath()%>';</script>
<%
    final LocationUpdater locationUpdater = ComponentAccessor.getOSGiComponentInstanceOfType(LocationUpdater.class);
    locationUpdater.updateLocation(out);

    HeaderFooterRendering headerAndFooter = ComponentAccessor.getComponent(HeaderFooterRendering.class);

    headerAndFooter.requireCommonResources();
    headerAndFooter.includeResources(out);
%>
<script type="text/javascript" src="<%=headerAndFooter.getKeyboardShortCutScript(request) %>"></script>
<%
    headerAndFooter.includeWebPanels(out, "atl.header.after.scripts");
%>
