<%@ page import="com.atlassian.plugin.webresource.WebResourceManager" %>
<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<%
    WebResourceManager webResourceManager = ComponentAccessor.getComponent(WebResourceManager.class);
    webResourceManager.requireResource("jira.webresources:view-permission-schemes");
%>

<html>
<head>
	<title><ww:text name="'admin.schemes.permissions.permission.schemes'"/></title>
    <meta name="admin.active.section" content="admin_issues_menu/misc_schemes_section"/>
    <meta name="admin.active.tab" content="permission_schemes"/>
</head>

<body>
    <header class="aui-page-header">
        <div class="aui-page-header-inner">
            <div class="aui-page-header-image">
                <div class="aui-avatar aui-avatar-large aui-avatar-project">
                    <div class="aui-avatar-inner jira-icon48-permissions"></div>
                </div>
            </div>
            <div class="aui-page-header-main">
                <h2><ww:text name="'admin.permission.project.schemes'"/></h2>
            </div>
            <div class="aui-page-header-actions">
                <div class="aui-buttons">
                    <a id="add_permissions_scheme" class="aui-button" href="<ww:url atltoken="false" page="AddPermissionScheme!default.jspa"/>">
                        <span class="aui-icon aui-icon-small aui-iconfont-add"></span>
                        <span class="sentence-case"><ww:text name="'admin.schemes.permissions.add.permission.schemes'"/></span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    <p>
        <ww:text name="'admin.schemes.permissions.description'"/>
    </p>
    <p>
        <ww:text name="'admin.schemes.permissions.description2'"/>
    </p>
    <ww:text name="'admin.schemes.permissions.table.below'">
        <ww:param name="'value0'"><a href="<%= request.getContextPath() %>/secure/admin/jira/GlobalPermissions!default.jspa"></ww:param>
        <ww:param name="'value1'"></a></ww:param>
    </ww:text>


    <p>
        <ww:soy moduleKey="'jira.webresources:view-permission-schemes'" template="'JIRA.Templates.ViewPermissionSchemes.help'">
        </ww:soy>
    </p>

    <ww:if test="schemeObjects/size == 0">
        <aui:component template="auimessage.jsp" theme="'aui'">
            <aui:param name="'messageType'">info</aui:param>
            <aui:param name="'messageHtml'"><ww:text name="'admin.schemes.permissions.no.schemes.configured'"/></aui:param>
        </aui:component>
    </ww:if>
    <ww:else>
    <table id="permission_schemes_table" class="aui jira-admin-table">
        <thead>
            <tr>
                <th class="project-permissions-header-cell"><ww:text name="'common.words.name'"/></th>
                <th><ww:text name="'common.concepts.projects'"/></th>
                <th><ww:text name="'common.words.operations'"/></th>
            </tr>
        </thead>
        <tbody>
        <ww:iterator value="schemeObjects" status="'status'">
            <tr>
                <td>
                    <p class="title">
                        <a href="EditPermissions!default.jspa?schemeId=<ww:property value="id"/>">
                            <ww:property value="name"/>
                        </a>
                    </p>
                    <p class="description"><small><ww:property value="description"/></small></p>
                </td>
                <td>
                    <ww:if test="/projects(.)/empty == false">
                        <ul>
                        <ww:iterator value="/projects(.)">
                            <li><a href="<%= request.getContextPath() %>/plugins/servlet/project-config/<ww:property value="./key"/>/summary"><ww:property value="name" /></a></li>
                        </ww:iterator>
                        </ul>
                    </ww:if>
                    <ww:else>
                        &nbsp;
                    </ww:else>
                </td>
                <td>
                    <ul class="operations-list">
                        <li><a id="<ww:property value="id"/>_edit" href="EditPermissions!default.jspa?schemeId=<ww:property value="id"/>" title="<ww:text name="'admin.schemes.permissions.change.permissions.for.scheme'"/>"><ww:text name="'admin.common.words.permissions'"/></a></li>
                        <li><a id="<ww:property value="id"/>_copy" href="<ww:url page="CopyPermissionScheme.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>" title="<ww:text name="'admin.schemes.permissions.make.a.copy.of.scheme'"/>"><ww:text name="'common.words.copy'"/></a></li>
                        <li><a id="<ww:property value="id"/>_edit_details" href="EditPermissionScheme!default.jspa?schemeId=<ww:property value="id"/>" title="<ww:text name="'admin.schemes.permissions.edit.name.and.description.of.scheme'"/>"><ww:text name="'common.words.edit'"/></a></li>
                    <%-- You cannot delete the default permission scheme (0) --%>
                    <ww:if test="id != 0">
                        <li><a id="del_<ww:property value="name"/>" href="DeletePermissionScheme!default.jspa?schemeId=<ww:property value="id"/>" title="<ww:text name="'admin.schemes.permissions.delete.this.scheme'"/>"><ww:text name="'common.words.delete'"/></a></li>
                    </ww:if>
                    </ul>
                </td>
            </tr>
        </ww:iterator>
        </tbody>
    </table>
    </ww:else>
</body>
</html>
