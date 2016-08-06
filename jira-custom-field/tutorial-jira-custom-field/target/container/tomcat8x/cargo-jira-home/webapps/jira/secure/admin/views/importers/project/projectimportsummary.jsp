<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
    <title>
        <ww:text name="'admin.project.import.summary.title'">
            <ww:param name="'value0'"><ww:property value="/projectName"/></ww:param>
        </ww:text>
    </title>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/import_export_section"/>
    <meta name="admin.active.tab" content="project_import"/>
</head>

<body>

    <div id="project-import-panel">
        <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.progressTracker.progressTracker'">
            <ui:param name="'steps'" value="/progressTrackerSteps"/>
        </ui:soy>

        <page:applyDecorator id="project-import" name="auiform">
            <page:param name="action">ProjectImportSummary.jspa</page:param>
            <page:param name="cssClass">dont-default-focus</page:param>
            <h2><ww:text name="'admin.project.import.summary.title'"><ww:param name="'value0'"><ww:property value="/projectName"/></ww:param></ww:text></h2>
            <p><ww:text name="'admin.project.import.summary.desc'"/></p>
            <ww:if test="/mappingResult != null">
                <p>
                    <ww:text name="'admin.project.import.summary.refresh.validation'">
                        <ww:param name="'value0'"><a href="<%=request.getContextPath()%>/secure/admin/ProjectImportSummary!reMapAndValidate.jspa"></ww:param>
                        <ww:param name="'value1'"></a></ww:param>
                    </ww:text>
                </p>
            </ww:if>

            <div class="aui-group">
                <div class="aui-item">
                    <h3><ww:text name="'admin.project.import.summary.system.fields'"/></h3>
                    <ww:if test="/mappingResult != null">
                        <ww:property value="/systemFieldsValidateMessages" id="fieldlist"/>
                        <jsp:include page="/includes/admin/importers/projectimportsummary_field_list.jsp" />
                    </ww:if>
                </div>
                <div class="aui-item">
                    <h3><ww:text name="'admin.project.import.summary.custom.fields'"/></h3>
                    <ww:if test="/mappingResult != null && /customFieldsValidateMessages/size() == 0">
                        <p>
                            <span class="aui-icon aui-icon-small aui-iconfont-info">Not validated</span>
                            <ww:text name="'admin.project.import.summary.no.custom.fields'"/>
                        </p>
                    </ww:if>
                    <ww:elseIf test="/mappingResult != null">
                        <ww:property value="/customFieldsValidateMessages" id="fieldlist"/>
                        <jsp:include page="/includes/admin/importers/projectimportsummary_field_list.jsp" />
                    </ww:elseIf>

                    <h3><ww:text name="'admin.project.import.summary.plugins'"/></h3>
                    <ww:if test="/mappingResult != null  && /pluginsValidateMessages/size() == 0">
                        <p>
                            <span class="aui-icon aui-icon-small aui-iconfont-info">Not validated</span>
                            <ww:text name="'admin.project.import.summary.no.plugins'"/>
                        </p>

                    </ww:if>
                    <ww:elseIf test="/mappingResult != null">
                        <ww:property value="/pluginsValidateMessages" id="fieldlist"/>
                        <jsp:include page="/includes/admin/importers/projectimportsummary_field_list.jsp" />
                    </ww:elseIf>
                </div>
            </div>
            <br>
            <page:param name="useCustomButtons">true</page:param>
            <ww:if test="/mappingResult != null">
                <input class="aui-button" id="prevButton" name="prevButton" title="<ww:property value="text('common.forms.previous')"/>" type="submit" value="<ww:property value="text('common.forms.previous')"/>"/>
                <ww:if test="/canImport == true">
                    <aui:component template="formSubmit.jsp" theme="'aui'">
                        <aui:param name="'submitButtonName'"><ww:text name="'common.forms.import'"/></aui:param>
                        <aui:param name="'submitButtonText'"><ww:text name="'common.forms.import'"/></aui:param>
                        <aui:param name="'submitButtonCssClass'">aui-button-primary</aui:param>
                    </aui:component>
                </ww:if>
                <ww:else>
                    <input class="aui-button" id="refreshValidationButton" name="refreshValidationButton" title="<ww:property value="text('admin.project.import.summary.refresh.validation.button')"/>" type="submit" value="<ww:property value="text('admin.project.import.summary.refresh.validation.button')"/>"/>
                </ww:else>
            </ww:if>
            <aui:component template="formCancel.jsp" theme="'aui'">
                <aui:param name="'cancelLinkURI'">ProjectImportSelectBackup!cancel.jspa</aui:param>
            </aui:component>
        </page:applyDecorator>
    </div>

</body>
</html>
