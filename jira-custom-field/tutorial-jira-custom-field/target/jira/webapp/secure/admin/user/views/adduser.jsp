<%@ page import="java.util.ArrayList" %>
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<%@ taglib uri="jiratags" prefix="jira" %>
<html>
<head>
	<title><ww:text name="'admin.adduser.add.new.user'"/></title>
    <meta name="admin.active.section" content="admin_users_menu/users_groups_section"/>
    <meta name="admin.active.tab" content="user_browser"/>
    <meta name="decorator" content="panel-admin"/>
    <jira:web-resource-require contexts="browse-user"/>
</head>
<body class="aui-page-focused aui-page-focused-medium">

    <page:applyDecorator id="user-create" name="auiform">
        <page:param name="action">AddUser.jspa</page:param>
        <page:param name="method">post</page:param>
        <page:param name="customButtons">true</page:param>

        <aui:component template="formHeading.jsp" theme="'aui'">
            <aui:param name="'text'"><ww:text name="'admin.adduser.add.new.user'"/></aui:param>
        </aui:component>

        <ww:property value="/userCountWebPanelHtml" escape="false"/>

        <page:applyDecorator name="auifieldgroup">
            <aui:textfield label="text('admin.adduser.email')" id="'email'" mandatory="true" maxlength="255" name="'email'" theme="'aui'">
                <aui:param name="'placeholder'"><ww:text name="'admin.adduser.email.placeholder'"/></aui:param>
            </aui:textfield>
        </page:applyDecorator>

        <page:applyDecorator name="auifieldgroup">
            <aui:textfield label="text('common.words.fullname')" id="'fullname'" mandatory="true" maxlength="255" name="'fullname'" theme="'aui'">
                <aui:param name="'placeholder'"><ww:text name="'admin.adduser.name.placeholder'"/></aui:param>
            </aui:textfield>
        </page:applyDecorator>

        <page:applyDecorator name="auifieldgroup">
            <aui:textfield label="text('common.words.username')" mandatory="true" maxlength="255" id="'username'" name="'username'" theme="'aui'">
                <aui:param name="'placeholder'"><ww:text name="'admin.adduser.username.placeholder'"/></aui:param>
            </aui:textfield>
        </page:applyDecorator>

        <ww:if test="/directories/size > 1">
            <page:applyDecorator name="auifieldgroup">
                <aui:select label="text('admin.user.directory')" id="'directoryId'" name="'directoryId'" list="/directories" listKey="'id'" listValue="'name'" theme="'aui'" />
            </page:applyDecorator>
        </ww:if>

        <!-- Hide the password fields if the user is being created in a user directory which cannot set a password -->
        <ww:if test="/hasPasswordWritableDirectory == true">
            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.form.passwordField'">
                <ui:param name="'labelContent'"><ww:text name="'common.words.password'" /></ui:param>
                <ui:param name="'id'">password</ui:param>
                <ui:param name="'placeholderText'"><ww:text name="'admin.adduser.password.placeholder'"/></ui:param>
                <ui:param name="'autocomplete'">off</ui:param>
                <ui:param name="'infoMessage'"><ww:text name="'admin.adduser.if.you.do.not.enter.a.password'"/></ui:param>
                <ui:param name="'errorTexts'" value="/passwordErrors" />
            </ui:soy>
        </ww:if>

        <page:applyDecorator name="auifieldset">
            <page:param name="type">group</page:param>
            <page:applyDecorator name="auifieldgroup">
                <page:param name="type">checkbox</page:param>
                <input type="checkbox" class="checkbox" name="sendEmail" id="sendEmail" value="true" <ww:if test="./sendEmail == true">checked="checked"</ww:if> />
                <label for="sendEmail" class="send-email-help" title="<ww:text name="'admin.adduser.send.password.email.description'"/>">
                    <ww:text name="'admin.adduser.send.password.email'" />
                    <span class="aui-icon aui-icon-small aui-iconfont-info"></span>
                </label>
            </page:applyDecorator>
        </page:applyDecorator>

        <ww:if test="/selectableApplications/size > 0">
            <ui:soy moduleKey="'jira.webresources:application-selector'" template="'JIRA.Templates.ApplicationSelector.applicationSelector'">
                <ui:param name="'legend'" value="text('admin.adduser.application.selection.heading')" />
                <ui:param name="'selectableApplications'" value="/selectableApplications" />
                <ui:param name="'additionalClasses'">group</ui:param>
            </ui:soy>
        </ww:if>
        <ww:if test="/hasCreatedUsers">
            <ww:iterator value="/createdUser">
                <ui:component name="'createdUser'" template="hidden.jsp" theme="'single'" value="." />
            </ww:iterator>
        </ww:if>
        <ww:property value="/applicationAccessWebPanelHtml" escape="false"/>
        <ww:property value="/webPanelHtml" escape="false"/>

    <div class="buttons-container form-footer">
        <page:applyDecorator name="auifieldset">
            <div class="checkbox">
                <aui:checkbox label="text('admin.adduser.create.another')" id="'createAnother'" name="'createAnother'" fieldValue="'true'" theme="'aui'">
                    <aui:param name="'labelBefore'">false</aui:param>
                </aui:checkbox>
            </div>
        </page:applyDecorator>

        <!-- need to use custom buttons, because auiform.jsp does not support having fieldset inside buttons section -->
        <div class="buttons">
            <aui:component template="formSubmit.jsp" theme="'aui'">
                <aui:param name="'submitButtonName'">Create</aui:param>
                <aui:param name="'submitButtonText'"><ww:text name="'admin.adduser.submit'"/></aui:param>
                <aui:param name="'submitButtonCssClass'">aui-button-primary</aui:param>
            </aui:component>
            <aui:component template="formCancel.jsp" theme="'aui'">
                <aui:param name="'cancelLinkURI'" value="/cancelUrl"/>
            </aui:component>
        </div>
    </div>
    </page:applyDecorator>
    <ww:if test="/directories/size > 1">
    <script>
    require(["jquery"], function ($) {
        var canDirectoryUpdatePasswordMap = {};

        <ww:iterator value="/canDirectoryUpdatePasswordMap/entrySet">
            canDirectoryUpdatePasswordMap['<ww:property value="./key"/>'] = <ww:property value="./value"/>;
        </ww:iterator>

        // Disable the password fields depending on the Directory option selected
        function directoryChanged() {
            var directorySelect = $('#user-create-directoryId');
            if (directorySelect)
            {
                var passwordField = $("#user-create-password");
                var confirmField = $("#user-create-confirm");

                var directoryId = directorySelect.val();
                var passwordEnabled = canDirectoryUpdatePasswordMap[directoryId];

                passwordField.attr("disabled", !passwordEnabled);
                confirmField.attr("disabled", !passwordEnabled);
            }
        }

        $('#user-create-directoryId').change(directoryChanged).change();
    });
    </script>
</ww:if>
</body>
</html>
