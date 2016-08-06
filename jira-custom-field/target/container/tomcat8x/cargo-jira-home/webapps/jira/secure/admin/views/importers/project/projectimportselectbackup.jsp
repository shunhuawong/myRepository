<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
    <head>
        <title><ww:text name="'admin.project.import.select.backup.title'"/></title>
        <meta name="admin.active.section" content="admin_system_menu/top_system_section/import_export_section"/>
        <meta name="admin.active.tab" content="project_import"/>
    </head>
        <body>
        <div id="project-import-panel">
            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.progressTracker.progressTracker'">
                <ui:param name="'steps'" value="/progressTrackerSteps"/>
            </ui:soy>
            <h2><ww:text name="'admin.project.import.select.backup.title'"/></h2>
            <p><ww:text name="'admin.project.import.select.backup.overview'" /></p>
            <ul>
                <li>
                    <ww:text name="'admin.project.import.select.backup.docs'">
                        <ww:param name="'value0'"><a href="<ww:property value="/docsLink"/>"></ww:param>
                        <ww:param name="'value1'"></a></ww:param>
                    </ww:text>
                </li>
                <li><ww:text name="'admin.project.import.select.backup.test.instance'" /></li>
                <li>
                    <ww:text name="'admin.project.import.select.backup.first'" >
                        <ww:param name="'value0'"><a href="<%=request.getContextPath()%>/secure/admin/XmlBackup!default.jspa"></ww:param>
                        <ww:param name="'value1'"></a></ww:param>
                    </ww:text>
                </li>
            </ul>
            <ww:if test="/showResumeLinkStep2 == true">
                    <aui:component template="auimessage.jsp" theme="'aui'">
                        <aui:param name="'messageType'">info</aui:param>
                        <aui:param name="'messageHtml'">
                            <p>
                                <ww:text name="'admin.project.import.select.backup.resume.step2'">
                                    <ww:param name="'value0'"><a href='<%=request.getContextPath()%>/secure/admin/ProjectImportSelectProject!default.jspa'></ww:param>
                                    <ww:param name="'value1'"></a></ww:param>
                                </ww:text>
                            </p>
                        </aui:param>
                    </aui:component>
            </ww:if>
            <ww:if test="/showResumeLinkStep3 == true">
                    <aui:component template="auimessage.jsp" theme="'aui'">
                        <aui:param name="'messageType'">info</aui:param>
                        <aui:param name="'messageHtml'">
                            <p>
                                <ww:text name="'admin.project.import.select.backup.resume.step3'">
                                    <ww:param name="'value0'"><ww:property value="/selectedProjectName"/></ww:param>
                                    <ww:param name="'value1'"><a href='<%=request.getContextPath()%>/secure/admin/ProjectImportSummary!reMapAndValidate.jspa'></ww:param>
                                    <ww:param name="'value2'"></a></ww:param>
                                </ww:text>
                            </p>
                        </aui:param>
                    </aui:component>
            </ww:if>
            <page:applyDecorator id="project-import" name="auiform">
                <page:param name="action">ProjectImportSelectBackup.jspa</page:param>
                <page:param name="submitButtonName">Add</page:param>
                <page:param name="submitButtonText"><ww:text name="'common.forms.next'"/></page:param>
                <page:param name="helpURL">restore_project</page:param>
                <ww:text name="'admin.project.import.select.backup.filename.desc'"/><br>
                <ww:text name="'admin.project.import.select.backup.filename.fileloc'"/> <b><ww:property value="/defaultImportPath"/></b>
                <ww:if test="/defaultImportAttachmentsPath != null">
                    <br><ww:text name="'admin.project.import.select.backup.attachment.desc'"/> <ww:property value="/defaultImportAttachmentsPath"/>
                </ww:if>
                <br><br>
                <page:applyDecorator name="auifieldgroup">
                    <aui:textfield label="text('admin.project.import.select.backup.filename.label')" name="'backupPath'" mandatory="'true'" theme="'aui'" />
                </page:applyDecorator>
            </page:applyDecorator>
        </div>
    </body>
</html>
