
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
	<title><ww:text name="'admin.schemes.issuesecurity.edit.issue.security.level'"/></title>
</head>

<body>

<page:applyDecorator name="jiraform">
    <page:param name="action">EditSecurityLevel.jspa</page:param>
    <page:param name="submitId">update_submit</page:param>
    <page:param name="submitName"><ww:text name="'common.forms.update'"/></page:param>
    <page:param name="cancelURI"><ww:url page="EditIssueSecurities!default.jspa"><ww:param name="'schemeId'" value="schemeId"/></ww:url></page:param>
    <page:param name="title"><ww:text name="'admin.schemes.issuesecurity.edit.security.level.title'"/></page:param>
    <page:param name="width">100%</page:param>

    <ui:textfield label="text('common.words.name')" name="'name'" size="'30'" maxlength=""/>
    <ui:textarea label="text('common.words.description')" name="'description'" cols="'30'" rows="'3'"/>

    <ui:component name="'schemeId'" template="hidden.jsp" />
    <ui:component name="'levelId'" template="hidden.jsp" />
</page:applyDecorator>

</body>
</html>
