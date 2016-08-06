<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<head>
	<title><ww:text name="'admin.schemes.permissions.add.permission.schemes'"/></title>
    <meta name="admin.active.section" content="admin_issues_menu/misc_schemes_section"/>
    <meta name="admin.active.tab" content="permission_schemes"/>
</head>
<body>
    <page:applyDecorator id="add-permissions-scheme" name="auiform">
        <page:param name="action">AddPermissionScheme.jspa</page:param>
        <page:param name="method">post</page:param>
        <page:param name="submitButtonText"><ww:text name="'common.forms.add'"/></page:param>
        <page:param name="submitButtonName"><ww:text name="'common.forms.add'"/></page:param>
        <page:param name="cancelLinkURI">ViewPermissionSchemes.jspa</page:param>

        <aui:component template="formHeading.jsp" theme="'aui'">
            <aui:param name="'text'"><ww:text name="'admin.schemes.permissions.add.permission.schemes'"/></aui:param>
        </aui:component>

        <page:applyDecorator name="auifieldgroup">
            <aui:textfield label="text('common.words.name')" id="'newSchemeName'" mandatory="true" name="'name'" theme="'aui'" />
        </page:applyDecorator>

        <page:applyDecorator name="auifieldgroup">
            <aui:textarea label="text('common.words.description')" id="'description'" mandatory="false" rows="4" name="'description'" theme="'aui'" />
        </page:applyDecorator>
    </page:applyDecorator>
</body>
</html>
