<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<div id="<ww:property value="./value/key" />" class="module">
    <div class="mod-header">
        <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.message.info'">
            <ui:param name="'content'">
                <p>
                    <ww:if test="./value/parentIssueKeys/size > 0 && ./value/parentIssueKey != null">
                        <ww:text name="'bulk.migrate.confirm.subheading.with.parent'">
                            <ww:param name="'value0'"><strong><ww:property value="./value/selectedIssues/size()" /></strong></ww:param>
                            <ww:param name="'value1'"><strong><ww:property value="./key/issueTypeObject/nameTranslation" /></strong></ww:param>
                            <ww:param name="'value2'"><strong><ww:property value="./key/projectObject/name" /></strong></ww:param>
                            <ww:param name="'value3'"><ww:iterator value="./value/parentIssueKeys" status="'status'"><strong><ww:property value="." /></strong><ww:if test="@status/last == false">, </ww:if></ww:iterator></ww:param>
                        </ww:text>
                    </ww:if>
                    <ww:else>
                        <ww:text name="'bulk.migrate.confirm.subheading'">
                            <ww:param name="'value0'"><strong><ww:property value="./value/selectedIssues/size()" /></strong></ww:param>
                            <ww:param name="'value1'"><strong><ww:property value="./key/issueTypeObject/nameTranslation" /></strong></ww:param>
                            <ww:param name="'value2'"><strong><ww:property value="./key/projectObject/name" /></strong></ww:param>
                        </ww:text>
                    </ww:else>
                </p>
            </ui:param>
        </ui:soy>
    </div>
    <div class="mod-content">
        <ww:property value="./value" >
            <table class="aui be-project-type-issue">
                <thead>
                    <tr>
                        <th><ww:text name="'bulk.move.move'"/></th>
                        <th class="cell-type-collapsed"></th>
                        <th><ww:text name="'bulk.move.to'"/></th>
                    </tr>
                </thead>
                <tbody>
                    <ww:property id="trClass" value="" />
                    <ww:if test="/allowProjectEdit(.) == true">
                        <ww:property id="trClass" value="'project-selector-container'" />
                    </ww:if>
                    <tr class="<ww:property value="@trClass"/>">
                        <td style="max-width: 200px; width: 200px; word-wrap: break-word;">
                            <img alt="" src="<ww:url value="'/secure/projectavatar'" atltoken="false"><ww:param name="'pid'" value="../key/projectObject/id" /><ww:param name="'size'" value="'small'" /></ww:url>" height="24" width="24"/>
                            <span class="from-project-name"><ww:property value="../key/projectObject/name" /></span>
                        </td>
                        <td>
                            <img src="<%= request.getContextPath() %>/images/icons/arrow-move.svg" alt="<ww:text name="'bulk.move.targetproject'"/>">
                        </td>
                        <ww:if test="/allowProjectEdit(.) == true">
                            <ww:property value="/fieldHtml('project', .)" escape="'false'" />
                        </ww:if>
                        <ww:else>
                            <td data-target-project="<ww:property value="targetProject/name" />">
                                <ww:property value="targetProject/name" />
                                <ui:component name="/projectFieldName(.)" value="targetProject/id" template="hidden.jsp" >
                                    <ui:param name="'id'"><ww:property value="./key" />project</ui:param>
                                    <ui:param name="'cssClass'">project-field-readonly</ui:param>
                                </ui:component>
                            </td>
                        </ww:else>
                    </tr>
                    <tr class="issue-type-selector-container">
                        <td>
                            <ww:component name="'issuetype'" template="constanticon.jsp">
                              <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
                              <ww:param name="'iconurl'" value="../key/issueTypeObject/iconUrl" />
                              <ww:param name="'alt'"><ww:property value="../key/issueTypeObject/name" /></ww:param>
                            </ww:component>
                            <span class="from-issue-type"><ww:property value="../key/issueTypeObject/nameTranslation" /></span>
                        </td>
                        <td>
                            <img src="<%= request.getContextPath() %>/images/icons/arrow-move.svg" alt="<ww:text name="'bulk.move.targetissuetype'"/>">
                        </td>
                        <ww:property value="fieldHtml('issuetype', .)" escape="'false'" />
                    </tr>
                    <ww:if test="/parentIssueInherited(.)==true">
                        <tr>
                            <td>
                                <ww:text name="'issue.field.parent'" />
                            </td>
                            <td>
                                <img src="<%= request.getContextPath() %>/images/icons/arrow-move.svg" alt="<ww:text name="'bulk.move.targetproject'"/>">
                            </td>
                            <td data-target-parent-issue="<ww:property value="parentIssueKey" />">
                                <ww:property value="parentIssueKey" />
                                <ui:component name="/issueParentFieldName(.)" value="parentIssueKey" template="hidden.jsp" >
                                    <ui:param name="'id'"><ww:property value="./key" />parentIssueKey</ui:param>
                                    <ui:param name="'cssClass'">project-field-readonly</ui:param>
                                </ui:component>
                            </td>
                        </tr>
                    </ww:if>
                    <ww:elseIf test="/parentSelectPresent(.)==true">
                        <tr class="parent-issue-key-selector-container">
                            <td colspan="2">
                                <ww:text name="'convert.issue.to.subtask.selectparentissue'"/>:
                            </td>
                            <td>
                                <select class="aui-field-singleissuepicker hidden" name="<ww:property value="key+'parentIssueKey'"/>"
                                        id="<ww:property value="'issuepicker_for_'+key+'project'" />"
                                        data-remove-on-un-select="true"
                                        data-ajax-options.query="true"
                                        data-ajax-options.url="<%= request.getContextPath() %>/rest/api/2/issue/picker"
                                        data-skip-keys="<ww:property value="issueKeys(rootBulkEditBean)" />"
                                        data-ajax-options.data.show-sub-tasks="false"
                                        data-ajax-options.data.show-sub-task-parent="false"
                                        data-ajax-options.data.current-project-id="<ww:property value="singleProject/key" />"
                                        >
                                    <ww:property id="option" value="issuepickerDataSuggestion(parentIssueKey)"/>
                                    <option data-field-label="<ww:property value="@option/label" />" data-icon="<ww:property value="@option/icon" />" selected="selected" value="<ww:property value="@option/value" />"><ww:property value="@option/value" /></option>
                                </select>
                                <div class="description">
                                    <ww:text name="'linkjiraissue.issuekey.desc'" />
                                </div>
                                <ww:if test="errors[key+'parentIssueKey']!=null)">
                                    <div class="error"><ww:property value="errors[key+'parentIssueKey']" /></div>
                                </ww:if>
                            </td>
                        </tr>
                    </ww:elseIf>
                </tbody>
            </table>
        </ww:property>
        <ww:if test="(./value/subTaskCollection == false || ./value/parentBulkEditBean == null) && !@showSameAsBulkEditBean">
            <ww:property value="true" id="showSameAsBulkEditBean"/>
            <div class="checkbox">
                <input type="checkbox" class="checkbox" name="sameAsBulkEditBean" id="sameAsBulkEditBean" value="<ww:property value="./value/key" />" onclick="toggle('<ww:property value="./value/key" />')" />
                <label for="sameAsBulkEditBean">
                    <ww:text name="'bulk.migrate.choosecontext.same.all'" />
                </label>
            </div>
        </ww:if>
    </div>
</div>