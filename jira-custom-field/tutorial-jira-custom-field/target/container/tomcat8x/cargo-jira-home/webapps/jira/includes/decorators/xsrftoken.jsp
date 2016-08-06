<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.security.xsrf.XsrfTokenGenerator" %>
<%
    XsrfTokenGenerator xsrfTokenGenerator = ComponentAccessor.getComponent(XsrfTokenGenerator.class);
%>    
<meta id="atlassian-token" name="atlassian-token" content="<%=xsrfTokenGenerator.generateToken(request)%>">

