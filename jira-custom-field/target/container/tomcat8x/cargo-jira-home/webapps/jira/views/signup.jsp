<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.plugin.webresource.WebResourceManager" %>
<%@ taglib prefix="ww" uri="webwork" %>
<%@ taglib prefix="ui" uri="webwork" %>
<%@ taglib prefix="aui" uri="webwork" %>
<%@ taglib prefix="page" uri="sitemesh-page" %>
<%@ taglib prefix="jira" uri="jiratags" %>
<%
    WebResourceManager webResourceManager = ComponentAccessor.getWebResourceManager();
    webResourceManager.requireResource("jira.webresources:captcha");
%>

<ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.page.document'">
    <ui:param name="'pageType'" value="'focused'"/>
    <ui:param name="'pageSize'" value="'medium'"/>
    <ui:param name="'extraClasses'" value="'page-type-login'"/>
    <ui:param name="'windowTitle'" value="text('signup.title')"/>
    <ui:param name="'headContent'">
        <jira:web-resource-require modules="jira.webresources:signup" />
    </ui:param>
    <ui:param name="'content'">
        <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.page.pagePanel'">
            <ui:param name="'content'">
                <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.page.pagePanelContent'">
                    <ui:param name="'content'">
                        <page:applyDecorator id="signup" name="auiform">
                            <aui:component template="formHeading.jsp" theme="'aui'">
                                <aui:param name="'text'"><ww:text name="'signup.heading'"/></aui:param>
                            </aui:component>
                            <page:param name="action">Signup.jspa</page:param>

                            <page:applyDecorator name="auifieldgroup">
                                <aui:textfield id="'email'" label="text('common.words.email')" mandatory="'true'" maxlength="'255'" name="'email'" theme="'aui'">
                                    <aui:param name="'placeholder'"><ww:text name="'signup.email.placeholder'"/></aui:param>
                                </aui:textfield>
                            </page:applyDecorator>
                            <page:applyDecorator name="auifieldgroup">
                                <aui:textfield id="'fullname'" label="text('common.words.fullname')" mandatory="'true'" maxlength="'255'" name="'fullname'" theme="'aui'">
                                    <aui:param name="'placeholder'"><ww:text name="'signup.fullname.placeholder'"/></aui:param>
                                </aui:textfield>
                            </page:applyDecorator>
                            <page:applyDecorator name="auifieldgroup">
                                <aui:textfield id="'username'" label="text('common.words.username')" mandatory="'true'" maxlength="'255'" name="'username'" theme="'aui'">
                                    <aui:param name="'placeholder'"><ww:text name="'signup.username.placeholder'"/></aui:param>
                                </aui:textfield>
                            </page:applyDecorator>
                            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.form.passwordField'">
                                <ui:param name="'labelContent'"><ww:text name="'common.words.password'" /></ui:param>
                                <ui:param name="'id'">signup-password</ui:param>
                                <ui:param name="'name'">password</ui:param>
                                <ui:param name="'placeholderText'"><ww:text name="'signup.password.placeholder'"/></ui:param>
                                <ui:param name="'autocomplete'">off</ui:param>
                                <ui:param name="'isRequired'">true</ui:param>
                                <ui:param name="'errorTexts'" value="/passwordError" />
                            </ui:soy>
                            <page:applyDecorator name="auifieldgroup">
                                <ww:if test="/passwordErrors/size > 0"><ul class="error"><ww:iterator value="/passwordErrors">
                                    <li><ww:property value="./snippet" escape="false"/></li>
                                </ww:iterator></ul></ww:if>
                            </page:applyDecorator>

                            <ww:if test="applicationProperties/option('jira.option.captcha.on.signup') == true">
                                <page:applyDecorator id="'captcha'" name="auifieldgroup">
                                    <aui:component label="text('signup.captcha.text')" id="'os_captcha'" name="'captcha'" template="captcha.jsp" theme="'aui'">
                                        <aui:param name="'captchaURI'"><%= request.getContextPath() %>/captcha</aui:param>
                                        <aui:param name="'iconText'"><ww:text name="'admin.common.words.refresh'"/></aui:param>
                                        <aui:param name="'iconCssClass'">icon-reload reload</aui:param>
                                    </aui:component>
                                </page:applyDecorator>
                            </ww:if>

                            <!-- need to use custom buttons, because auiform.jsp does not support having fieldset inside buttons section -->
                            <div class="buttons-container form-footer">
                                <div class="buttons">
                                    <aui:component template="formSubmit.jsp" theme="'aui'">
                                        <aui:param name="'submitButtonName'">Signup</aui:param>
                                        <aui:param name="'submitButtonText'"><ww:text name="'signup.heading'"/></aui:param>
                                        <aui:param name="'submitButtonCssClass'">aui-button-primary</aui:param>
                                    </aui:component>
                                    <aui:component template="formCancel.jsp" theme="'aui'">
                                        <aui:param name="'cancelLinkURI'"><ww:url value="'default.jsp'" atltoken="false"/></aui:param>
                                    </aui:component>
                                </div>
                            </div>
                        </page:applyDecorator>
                    </ui:param>
                </ui:soy>
            </ui:param>
        </ui:soy>
    </ui:param>
</ui:soy>
