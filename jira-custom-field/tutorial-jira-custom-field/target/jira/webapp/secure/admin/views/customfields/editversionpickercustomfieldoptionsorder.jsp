<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<ww:property id="command" value="text('admin.common.words.modify')" />

<html>
<head>
    <title><ww:text name="'admin.issuefields.customfields.edit.versionorder.title'">
        <ww:param name="'value0'"><ww:property value="/customField/name"/></ww:param>
    </ww:text></title>
</head>
<body>
<page:applyDecorator name="jiraform">
    <page:param name="title">
        <ww:text name="'admin.issuefields.customfields.edit.versionorder.title'">
            <ww:param name="'value0'"><strong><ww:property value="/customField/name"/></strong></ww:param>
        </ww:text></page:param>
    <page:param name="action">EditVersionPickerCustomFieldOptionsOrder.jspa</page:param>
    <page:param name="width">100%</page:param>
    <page:param name="cancelURI">ConfigureCustomField!default.jspa?customFieldId=<ww:property value="/customField/idAsLong"/></page:param>
    <page:param name="submitId">config_version_type_order_config</page:param>
    <page:param name="submitName"><ww:property value="@command" /></page:param>

    <ui:component name="'fieldConfigId'" template="hidden.jsp" theme="'single'"  />
    <ui:component name="'fieldConfigSchemeId'" template="hidden.jsp" theme="'single'"  />

    <ui:select label="text('admin.issuefields.customfields.edit.versionorder.orderby')" name="/customField/id" list="/versionOrderSelectList" listKey="'key'" listValue="'value'" value="/versionOrder" >
    </ui:select>
</page:applyDecorator>

</body>
</html>
