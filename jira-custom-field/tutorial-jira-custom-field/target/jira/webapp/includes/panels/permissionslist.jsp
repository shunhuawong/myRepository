<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<h3>
    <ww:component name="'permissions'" template="help.jsp"/>
    <ww:text name="'admin.globalpermissions.jira.permissions'"/>
</h3>

<%-- table display of global permissions --%>
<jsp:include page="permission/list_table.jsp"/>

<%-- edit permissions panel --%>
<aui:component template="module.jsp" theme="'aui'">
    <aui:param name="'contentHtml'">
        <page:applyDecorator name="jiraform">
            <page:param name="action">GlobalPermissions.jspa</page:param>
            <page:param name="submitId">addpermission_submit</page:param>
            <page:param name="submitName"><ww:text name="'common.forms.add'"/></page:param>
            <page:param name="width">100%</page:param>
            <page:param name="title"><ww:text name="'admin.globalpermissions.add.permission'"/></page:param>
            <page:param name="autoSelectFirst">false</page:param>
            <%--<page:param name="description"><ww:text name="'admin.globalpermissions.add.a.new.permission'"/></page:param>--%>

            <ui:select label="text('admin.common.words.permission')" name="'globalPermType'" list="managablePermissions"
                       listKey="'key'" listValue="'text(value)'">
                <ui:param name="'headerrow'" value="text('admin.globalpermissions.please.select.a.permission')" />
                <ui:param name="'headervalue'" value="''" />
            </ui:select>
            <ww:property value="errors['groupName']">
                <%--Dealing with errors --%>
                <ww:if test=".">
                    <tr>
                        <td class="fieldLabelArea formErrors">&nbsp;</td>
                        <td class="fieldValueArea formErrors">
                            <span class="errMsg"><ww:property value="."/></span>
                        </td>
                    </tr>
                </ww:if>
            </ww:property>
            <tr>
                <td class="fieldLabelArea<ww:if test="errors['groupName']"> formErrors</ww:if>">
                    <ww:text name="'admin.common.words.group'"/>
                </td>
                <td id="group-single-selector-parent" class="fieldValueArea<ww:if test="errors['groupName']"> formErrors</ww:if>">
                    <select name="groupName" class="js-default-single-group-picker" id="groupName_select">
                        <option data-empty value=""><ww:text name="'admin.common.words.anyone'"/></option>
                    </select>
                </td>
            </tr>
            <ui:component name="'action'" value="'add'" template="hidden.jsp" theme="'single'" />
        </page:applyDecorator>
    </aui:param>
</aui:component>
<div id="default-groups-warning" class="aui-message aui-message-warning hidden">
    <p class="title">
        <strong><ww:text name="'admin.errors.permissions.grant.admin.to.default.group.title'"/></strong>
    </p>
    <p id="default-group-warning-message">
    </p>
</div>
