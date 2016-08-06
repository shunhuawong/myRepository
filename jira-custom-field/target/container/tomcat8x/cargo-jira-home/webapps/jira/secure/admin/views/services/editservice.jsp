
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
	<title><ww:text name="'admin.services.edit.service'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/advanced_menu_section/advanced_section"/>
    <meta name="admin.active.tab" content="services"/>       
</head>

<body>

<h1><ww:text name="'admin.services.edit.service'"/>: <ww:property value="service/name" /></h1>

<form method="post" id="edit-service" class="aui" name="jiraform" action="EditService.jspa">
    <fieldset>

    <ww:if test="description != ''">
        <p>
            <b><ww:text name="'common.words.description'"/>:</b><br/>
            <ww:property value="text(description)" escape="false" />
        </p>
    </ww:if>
    <p><ww:text name="'admin.services.edit.instructions'"/></p>
    <ww:if test="service/serviceClass == 'com.atlassian.jira.service.services.file.FileService'">
        <ww:text name="'admin.services.edit.file.service.directory'">
            <ww:param><ww:property value="/fileServiceBasePath"/></ww:param>
        </ww:text>
    </ww:if>
    <ww:if test="/removedPath != null">
        <aui:component template="auimessage.jsp" theme="'aui'">
            <aui:param name="'messageType'">warning</aui:param>
            <aui:param name="'messageHtml'">
                <p><ww:text name="'admin.services.edit.removed.path.msg'"/> <strong><ww:property value="/removedPath"/></strong></p>
            </aui:param>
        </aui:component>
     </ww:if>
    <ww:if test="/validMailParameters == false">
        <%@include file="/includes/admin/email/badmailprops.jsp"%>
    </ww:if>



    <ww:iterator value="/objectConfigurationKeys" >
        <%@ include file="/includes/panels/objectconfiguration_form.jsp"  %>
    </ww:iterator>

    <div class="field-group">
        <ui:component name="'cron.editor.name'" label="text('admin.services.schedule')" template="croneditor.jsp">
            <ui:param name="'cronEditorBean'" value="/cronEditorBean"/>
            <ui:param name="'parameterPrefix'">service.schedule</ui:param>
        </ui:component>
    </div>

	<ui:component name="'id'" template="hidden.jsp" />
    <ui:component name="'atl_token'" value="/xsrfToken" template="hidden.jsp"/>
    <ww:iterator value="/hiddenParameters" status="''">
        <ui:component name="./key" value="./value" template="hidden.jsp" />
    </ww:iterator>
    
    </fieldset>

    <div class="buttons-container">
        <input id="update_submit" class="aui-button" type="submit" name="<ww:text name="'common.forms.update'"/>" value="<ww:text name="'common.forms.update'"/>"/>
        <a class="aui-button aui-button-link" id="cancelButton" href="<ww:url page="ViewServices!default.jspa"><ww:param name="'name'" value="name" /></ww:url>" title="<ww:property value="text('common.forms.cancel')"/> (<ww:property value="@modifierKey"/> + <ww:text name="'common.forms.cancel.accesskey'" />)">
            <ww:property value="text('common.forms.cancel')"/>
        </a>
    </div>

</form>

</body>
</html>
