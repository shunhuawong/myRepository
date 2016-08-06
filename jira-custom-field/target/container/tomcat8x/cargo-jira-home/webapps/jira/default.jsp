<%@page session="false" %>
<%@ page import="com.atlassian.web.servlet.api.ServletForwarder" %>
<%@ page import="java.net.URI" %>
<%@ page import="static com.atlassian.jira.component.ComponentAccessor.getOSGiComponentInstanceOfType" %>
<%
    if (request != null)
    {
        final ServletForwarder forwarder = getOSGiComponentInstanceOfType(ServletForwarder.class);
        forwarder.forward(request, response, URI.create("/secure/MyJiraHome.jspa"));
        return;
    }
%>
<html>
	<head>
		<title>Go to JIRA</title>
	</head>
	<body>
		<b><a href="<%= request.getContextPath() %>/secure/MyJiraHome.jspa">Click here!</a></b> to go to JIRA.
    </body>
</html>

