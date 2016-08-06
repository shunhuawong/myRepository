<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
	<title><ww:text name="'admin.schemes.issuesecurity.issue.security.schemes'"/></title>
    <meta name="admin.active.section" content="admin_issues_menu/misc_schemes_section"/>
    <meta name="admin.active.tab" content="security_schemes"/>
</head>

<body>
<page:applyDecorator name="jirapanel">
    <page:param name="title"><ww:text name="'admin.schemes.issuesecurity.issue.security.schemes'"/></page:param>
    <page:param name="width">100%</page:param>
    <page:param name="helpURL">security_schemes</page:param>
    <p><ww:text name="'admin.schemes.issuesecurity.description1'"/></p>
    <p><ww:text name="'admin.schemes.issuesecurity.description2'"/></p>
    <p><ww:text name="'admin.schemes.issuesecurity.table.below'"/></p>
</page:applyDecorator>

<ww:if test="schemeObjects/size == 0">
    <aui:component template="auimessage.jsp" theme="'aui'">
        <aui:param name="'messageType'">info</aui:param>
        <aui:param name="'messageHtml'">
            <ww:text name="'admin.schemes.issuesecurity.no.schemes.configure'"/>
        </aui:param>
    </aui:component>
</ww:if>
<ww:else>
<table class="aui aui-table-rowhover">
    <thead>
        <tr>
            <th>
                <ww:text name="'common.words.name'"/>
            </th>
            <th>
                <ww:text name="'common.concepts.projects'"/>
            </th>
            <th width="10%">
                <ww:text name="'common.words.operations'"/>
            </th>
        </tr>
    </thead>
    <tbody>
    <ww:iterator value="schemeObjects" status="'status'">
        <tr>
            <td>
                <b><a href="<ww:url page="EditIssueSecurities!default.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>"><ww:property value="name"/></a></b>
                <div class="description"><ww:property value="description"/></div>
            </td>
            <td>
                <ww:if test="/projects(.)/empty == false">
                    <ul>
                    <ww:iterator value="projects(.)">
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
                    <li><a id="<ww:property value="'change_' + id"/>" href="<ww:url page="EditIssueSecurities!default.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>" title="<ww:text name="'admin.schemes.issuesecurity.change.the.security.levels'"/>"><ww:text name="'admin.schemes.issuesecurity.security.levels'"/></a></li>
                    <li><a id="<ww:property value="'copy_' + id"/>" href="<ww:url page="CopyIssueSecurityScheme.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>" title="<ww:text name="'admin.schemes.issuesecurity.create.a.copy'"/>"><ww:text name="'common.words.copy'"/></a></li>
                    <li><a id="<ww:property value="'edit_' + id"/>" href="<ww:url page="EditIssueSecurityScheme!default.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>" title="<ww:text name="'admin.schemes.issuesecurity.edit.the.name.description.and.default.security.level'"/>"><ww:text name="'common.words.edit'"/></a></li>
                <%-- You cannot delete the default scheme (0) --%>
                <ww:if test="id != 0 && canDelete(.) == true">
                    <li><a id="del_<ww:property value="name"/>" href="<ww:url page="DeleteIssueSecurityScheme!default.jspa"><ww:param name="'schemeId'" value="id"/></ww:url>" title="<ww:text name="'admin.schemes.issuesecurity.delete.this.scheme'"/>"><ww:text name="'common.words.delete'"/></a></li>
                </ww:if>
                </ul>
            </td>
        </tr>
    </ww:iterator>
    </tbody>
</table>
</ww:else>
<div class="buttons-container aui-toolbar form-buttons noprint">
    <div class="toolbar-group">
        <span class="toolbar-item">
            <a class="toolbar-trigger" id="add_securityscheme" href="<ww:url page="AddIssueSecurityScheme!default.jspa"/>"><ww:text name="'admin.schemes.issuesecurity.add.issue.security.scheme'"/></a>
        </span>
    </div>
</div>
</body>
</html>
