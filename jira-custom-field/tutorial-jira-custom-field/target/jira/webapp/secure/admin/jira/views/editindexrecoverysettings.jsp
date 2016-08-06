<%@ page import="com.atlassian.plugin.webresource.WebResourceManager"%>
<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<%
    WebResourceManager webResourceManager = ComponentAccessor.getWebResourceManager();
    webResourceManager.requireResourcesForContext("atl.general");
%>
<head>
    <title><ww:text name="'admin.indexing.jira.indexing'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/advanced_menu_section/advanced_section"/>
    <meta name="admin.active.tab" content="indexing"/>
    <meta name="decorator" content="panel-admin"/>
</head>
<body>

<h1><ww:text name="'admin.index.recovery.edit.settings'"/></h1>

<form method="post" id="edit-service" class="aui" name="jiraform" action="EditIndexRecoverySettings.jspa">
    <fieldset>
        <div class="dialog">
            <fieldset class="group">
                <legend><ww:text name="'admin.index.recovery.enable'"/></legend>
                <page:applyDecorator name="auifieldgroup">
                    <page:param name="type">radio</page:param>
                    <%-- Set the checked state of the radio --%>
                    <ww:if test="recoveryEnabled == 'true'">
                        <ww:property id="recovery-enabled-checked" value="'true'"/>
                    </ww:if>
                    <aui:radio checked="@recovery-enabled-checked" id="recovery-enabled" label="text('admin.common.words.on')" value="true" list="null" name="'recoveryEnabled'" theme="'aui'" />
                </page:applyDecorator>
                <page:applyDecorator name="auifieldgroup">
                    <page:param name="type">radio</page:param>
                    <page:param name="description"><ww:text name="'admin.index.recovery.enable.description'"/></page:param>
                    <%-- Set the checked state of the radio --%>
                    <ww:if test="recoveryEnabled == 'false'">
                        <ww:property id="recovery-disabled-checked" value="'true'"/>
                    </ww:if>
                    <aui:radio checked="@recovery-disabled-checked" id="recovery-disabled" label="text('admin.common.words.off')" value="false" list="null" name="'recoveryEnabled'" theme="'aui'" />
                </page:applyDecorator>
            </fieldset>
        </div>
    </fieldset>

    <ui:component name="'cron.editor.name'" label="text('admin.services.schedule')" template="croneditor.jsp">
        <ui:param name="'cronEditorBean'" value="/cronEditorBean"/>
        <ui:param name="'parameterPrefix'">service.schedule</ui:param>
    </ui:component>

    <div class="buttons-container">
        <input class="aui-button" type="submit" name="<ww:text name="'common.forms.update'"/>" value="<ww:text name="'common.forms.update'"/>"/>
        <a class="aui-button aui-button-link" id="cancelButton" href="<ww:url page="IndexAdmin.jspa"><ww:param name="'name'" value="name" /></ww:url>" title="<ww:property value="text('common.forms.cancel')"/> (<ww:property value="@modifierKey"/> + <ww:text name="'common.forms.cancel.accesskey'" />)">
        <ww:property value="text('common.forms.cancel')"/>
        </a>
    </div>

    <ui:component name="'atl_token'" value="/xsrfToken" template="hidden.jsp"/>

    </form>
</body>
</html>
