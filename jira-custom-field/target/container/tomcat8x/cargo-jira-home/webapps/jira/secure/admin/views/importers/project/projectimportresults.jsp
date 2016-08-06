<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
    <title>
        <ww:text name="'admin.project.import.results.title'"/>
    </title>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/import_export_section"/>
    <meta name="admin.active.tab" content="project_import"/>
</head>
<body>

<div id="project-import-panel">
    <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.progressTracker.progressTracker'">
        <ui:param name="'steps'" value="/progressTrackerSteps"/>
    </ui:soy>

    <page:applyDecorator name="auiform">
        <page:param name="action">ProjectImportResults!ViewNewProject.jspa</page:param>
        <page:param name="useCustomButtons">true</page:param>
        <page:param name="cssClass">dont-default-focus</page:param>
        <h2><ww:text name="'admin.project.import.results.title'"/></h2>
        <p>
            <!-- This is the case where the import completed AND there were no errors -->
            <ww:if test="/projectImportResults/importCompleted == true  && /projectImportResults/errors/size() == 0">
                <ww:text name="'admin.project.import.results.desc.completed'">
                    <ww:param name="'value0'"><ww:property value="/prettyImportDuration" /></ww:param>
                </ww:text>
            </ww:if>
            <!-- This is the case where the import DID complete AND the import was was successful but there were some errors, but these were below the limit-->
            <ww:elseIf test="/projectImportResults/importCompleted == true && /projectImportResults/errors/size() > 0">
                <ww:text name="'admin.project.import.results.desc.completed.with.errors'">
                    <ww:param name="'value0'"><ww:property value="/prettyImportDuration" /></ww:param>
                </ww:text>
                <aui:component template="auimessage.jsp" theme="'aui'">
                    <aui:param name="'messageType'">warning</aui:param>
                    <aui:param name="'messageHtml'">
                        <p>
                            <ww:text name="'admin.project.import.results.complete.with.errors'"/>
                        </p>
                    </aui:param>
                </aui:component>
            </ww:elseIf>
            <!-- This is the case where the import just did not complete and the import was NOT successful-->
            <ww:elseIf test="/projectImportResults/importCompleted == false ">
                <ww:text name="'admin.project.import.results.desc.not.completed'">
                    <ww:param name="'value0'"><ww:property value="/prettyImportDuration" /></ww:param>
                </ww:text>
                <ww:if test="/projectImportResults/importedProject != null">
                    <p/>
                    <ww:text name="'admin.project.import.results.desc.not.completed.delete.project'">
                        <ww:param name="'value0'"><a href="<%=request.getContextPath()%>/secure/project/DeleteProject!default.jspa?pid=<ww:property value="/projectImportResults/importedProject/id"/>"></ww:param>
                        <ww:param name="'value1'"></a></ww:param>
                    </ww:text>
                </ww:if>
            </ww:elseIf>
        </p>
        <div class="aui-group">
            <div class="aui-item">
                <div id="systemfields">
                    <h3 class="results_header"><ww:text name="'common.concepts.projectsummary'"/></h3>
                    <table class="aui">
                        <ww:if test="/projectImportResults/importedProject == null">
                            <tr>
                                <td colspan="2"><ww:text name="'admin.project.import.results.no.project.created'"/></td>
                            </tr>
                        </ww:if>
                        <ww:else>
                            <tr>
                                <th><ww:text name="'common.concepts.key'"/>:</th>
                                <td><a href="ProjectImportResults!ViewNewProject.jspa"><ww:property value="/projectImportResults/importedProject/key"/></a>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'common.concepts.project.type'"/>:</th>
                                <td><ww:property value="/formattedProjectType(/projectImportResults/importedProject/projectTypeKey)"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.desc'"/>:</th>
                                <td><ww:property value="/projectImportResults/importedProject/description"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.lead'"/>:</th>
                                <td><ww:property value="/projectImportResults/importedProject/lead/displayName"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.url'"/>:</th>
                                <td><ww:property value="/projectImportResults/importedProject/url"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.sender.address'"/>:</th>
                                <td><ww:property value="/projectEmail(/projectImportResults/importedProject)" />&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.default.assignee'"/>:</th>
                                <td><ww:property value="/assigneeTypeString(/projectImportResults/importedProject/assigneeType)"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.components'"/>:</th>
                                <td><ww:property value="/projectImportResults/importedProject/projectComponents/size()"/>&nbsp;</td>
                            </tr>
                            <tr>
                                <th><ww:text name="'admin.project.import.select.project.proj.versions'"/>:</th>
                                <td><ww:property value="/projectImportResults/importedProject/versions/size()"/>&nbsp;</td>
                            </tr>
                            <ww:iterator value="/projectImportResults/results">
                                <tr>
                                    <th><ww:property value="./left"/>:</th>
                                    <td><ww:property value="./right"/>&nbsp;</td>
                                </tr>
                            </ww:iterator>
                        </ww:else>
                    </table>
                    <ww:if test="/projectImportResults/errors/size() > 0">
                        <h3 class="results_header"><ww:text name="'panel.errors'"/></h3>
                        <div class="notification"><ww:text name="'admin.project.import.results.view.your.logs'"/>&nbsp;</div>
                        <table class="aui">
                            <ww:iterator value="/projectImportResults/errors">
                                <tr>
                                    <td><span class="aui-icon aui-icon-error">Error</span>&nbsp;<ww:property value="."/></td>
                                </tr>
                            </ww:iterator>
                        </table>
                    </ww:if>
                </div>
            </div>
            <div class="aui-item">
                <div id="customfields">
                    <h3 class="results_header"><ww:text name="'admin.common.words.users'"/></h3>
                    <table class="aui">
                        <tr>
                            <ww:if test="/projectImportResults/usersCreatedCount == 0 && /projectImportResults/expectedUsersCreatedCount == 0">
                                <td colspan="2"><ww:text name="'admin.project.import.results.no.users.created'"/></td>
                            </ww:if>
                            <ww:else>
                                <th><ww:text name="'admin.common.words.users'"/>:</th>
                                <td>
                                    <ww:text name="'admin.project.import.results.x.out.of.x'">
                                        <ww:param name="'value0'"><ww:property value="/projectImportResults/usersCreatedCount"/></ww:param>
                                        <ww:param name="'value1'"><ww:property value="/projectImportResults/expectedUsersCreatedCount"/></ww:param>
                                    </ww:text>
                                </td>
                            </ww:else>
                        </tr>
                    </table>
                    <h3 class="results_header"><ww:text name="'admin.projects.project.roles'"/></h3>
                    <table class="aui">
                        <ww:if test="/projectImportResults/roles/size() > 0">
                            <ww:iterator value="/projectImportResults/roles">
                                <tr>
                                    <th><ww:property value="."/>:</th>
                                    <td><ww:property value="/projectImportResults/usersCreatedCountForRole(.)"/> <ww:text name="'admin.project.import.results.users'"/>, <ww:property value="/projectImportResults/groupsCreatedCountForRole(.)"/> <ww:text name="'admin.project.import.results.groups'"/>&nbsp;</td>
                                </tr>
                            </ww:iterator>
                        </ww:if>
                        <ww:else>
                            <tr>
                                <td colspan="2"><ww:text name="'admin.project.import.results.no.members.created'"/></td>
                            </tr>
                        </ww:else>
                    </table>
                    <h3 class="results_header"><ww:text name="'admin.project.import.select.project.proj.isssues'"/></h3>
                    <table class="aui">
                        <tr>
                            <ww:if test="/projectImportResults/issuesCreatedCount == 0 && /projectImportResults/expectedIssuesCreatedCount == 0">
                                <td colspan="2"><ww:text name="'admin.project.import.results.no.issues.created'"/></td>
                            </ww:if>
                            <ww:else>
                                <th><ww:text name="'admin.project.import.results.issues.created'"/>:</th>
                                <td>
                                    <ww:text name="'admin.project.import.results.x.out.of.x'">
                                        <ww:param name="'value0'"><ww:property value="/projectImportResults/issuesCreatedCount"/></ww:param>
                                        <ww:param name="'value1'"><ww:property value="/projectImportResults/expectedIssuesCreatedCount"/></ww:param>
                                    </ww:text>
                                </td>
                            </ww:else>
                        </tr>
                        <tr>
                            <ww:if test="/projectImportResults/attachmentsCreatedCount == 0 && /projectImportResults/expectedAttachmentsCreatedCount == 0">
                                <td colspan="2"><ww:text name="'admin.project.import.results.no.attachments.created'"/></td>
                            </ww:if>
                            <ww:else>
                                <th><ww:text name="'common.concepts.attachments.files'"/>:</th>
                                <td>
                                    <ww:text name="'admin.project.import.results.x.out.of.x'">
                                        <ww:param name="'value0'"><ww:property value="/projectImportResults/attachmentsCreatedCount"/></ww:param>
                                        <ww:param name="'value1'"><ww:property value="/projectImportResults/expectedAttachmentsCreatedCount"/></ww:param>
                                    </ww:text>
                                </td>
                            </ww:else>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <br>
        <div class="buttons">
            <aui:component template="formSubmit.jsp" theme="'aui'">
                <aui:param name="'submitButtonName'"><ww:text name="'admin.common.words.ok'"/></aui:param>
                <aui:param name="'submitButtonText'"><ww:text name="'admin.common.words.ok'"/></aui:param>
            </aui:component>
        </div>

    </page:applyDecorator>
</div>

</body>
</html>
