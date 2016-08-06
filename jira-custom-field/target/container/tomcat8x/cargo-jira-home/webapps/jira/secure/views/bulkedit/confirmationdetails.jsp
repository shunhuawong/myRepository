<%--
    The root context of this include must be a BulkEditBean.
    Also require the action to have:
    * getNameTranslation(IssueType) - provided in BulkMigrate
    * getFieldName(field)
    * getNewViewHtml(field)
--%>

<!-- Issue Targets Table - Target Project and Issue Type -->

<ww:property id="issueToSubtaskClass" value="''" />
<ww:if test="/subtaskToIssue(.) == true">
    <ww:property id="issueToSubtaskClass" value="' subtask-to-issue'" />
</ww:if>
<ww:property id="subtaskToIssueClass" value="''" />
<ww:if test="/issueToSubtask(.) == true">
    <ww:property id="subtaskToIssueClass" value="' issue-to-subtask'" />
</ww:if>
<ww:property id="subtaskToSubtaskClass" value="''" />
<ww:if test="/subtaskToSubtask(.) == true">
    <ww:property id="subtaskToSubtaskClass" value="' subtask-to-subtask'" />
</ww:if>

<table id="move_confirm_table" class="aui aui-table-rowhover bulk-group<ww:property value="@issueToSubtaskClass" /><ww:property value="@subtaskToIssueClass" /><ww:property value="@subtaskToSubtaskClass" />">
    <thead>
        <tr>
            <th colspan="2"><ww:text name="'bulk.move.issuetargets'" /></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="max-width: 200px; width: 200px; word-wrap: break-word;"><ww:text name="'bulk.move.targetproject'" /></td>
            <td data-target-project="<ww:property value="./targetProject/name" />">
                <img alt="" src="<ww:url value="'/secure/projectavatar'" atltoken="false"><ww:param name="'pid'" value="./targetProject/id" /><ww:param name="'size'" value="'small'" /></ww:url>" height="24" width="24"/>
                <ww:property value="./targetProject/name" />
            </td>
        </tr>
    <ww:if test="./targetIssueType">
        <tr>
            <td><ww:text name="'bulk.move.targetissuetype'" /></td>
            <td data-target-issuetype="<ww:property value="./targetIssueType/name" />">
                <ww:component name="'issuetype'" template="constanticon.jsp">
                  <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
                  <ww:param name="'iconurl'" value="./targetIssueType/iconUrl" />
                  <ww:param name="'alt'"><ww:property value="./targetIssueType/name" /></ww:param>
                </ww:component>
                <ww:property value="/nameTranslation(./targetIssueType)" />
            </td>
        </tr>
    </ww:if>

    <ww:if test="./parentIssueKey != null">
        <tr>
            <td><ww:text name="'convert.issue.to.subtask.details.targetparentissue'"/></td>
            <td data-parent-issue-key="<ww:property value="./parentIssueKey" />">
                <ww:property value="./parentIssueKey" />
            </td>
        </tr>
    </ww:if>

    </tbody>
</table>


<!-- Workflow/Status Table - Target Workflow and Status Mappings -->
<ww:property value="./statusMapHolder">
    <ww:if test=". != null && ./empty == false">
        <table id="status_map_table" class="aui aui-table-rowhover">
            <thead>
                <tr>
                    <th colspan="2"><ww:text name="'bulk.move.workflow'"/></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="max-width: 200px; width: 200px; word-wrap: break-word;"><ww:text name="'bulk.move.targetworkflow'" /></td>
                    <td><ww:property value="../targetWorkflow/name" /></td>
                </tr>
                <tr>
                    <td style="max-width: 200px; width: 200px; word-wrap: break-word;"><ww:text name="'bulk.move.status.mapping.confirm'" /></td>
                    <td>
                        <table class="bordered">
                            <tr>
                                <th nowrap><ww:text name="'bulk.move.status.original'" /></th>
                                <th>&nbsp;</th>
                                <th nowrap><ww:text name="'bulk.move.targetstatus'" /></th>
                            </tr>
                            <ww:iterator value=".">
                                <tr>
                                    <td width="1%" nowrap>
                                        <ww:component name="'status'" template="issuestatus.jsp" theme="'aui'">
                                            <ww:param name="'issueStatus'" value="/constantsManager/statusObject(./key)"/>
                                            <ww:param name="'isSubtle'" value="false"/>
                                            <ww:param name="'isCompact'" value="false"/>
                                        </ww:component>
                                    </td>
                                    <td width="1%">
                                        <img src="<%= request.getContextPath() %>/images/icons/arrow-move.svg" alt="?">
                                    </td>
                                    <td nowrap>
                                        <ww:component name="'status'" template="issuestatus.jsp" theme="'aui'">
                                            <ww:param name="'issueStatus'" value="/constantsManager/statusObject(./value)"/>
                                            <ww:param name="'isSubtle'" value="false"/>
                                            <ww:param name="'isCompact'" value="false"/>
                                        </ww:component>
                                    </td>
                                </tr>
                            </ww:iterator>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </ww:if>
</ww:property>


<!-- Updated Fields Table -->
<ww:property value="./moveFieldLayoutItems">
    <ww:if test=". != null && . /empty == false">
        <table id="field_map_table" class="aui aui-table-rowhover movedFields">
            <thead>
                <tr>
                    <th><ww:text name="'bulk.move.updatedfields'" /></th>
                    <th><ww:text name="'bulk.move.newvalue'"/></th>
                </tr>
            </thead>
            <tbody>
            <ww:iterator value=".">
                <tr>
                    <td style="max-width: 200px; width: 200px; word-wrap: break-word;"><ww:property value="/fieldName(./orderableField)" /></td>
                    <td>
                        <ww:if test="/fieldUsingSubstitutions(../.., ./orderableField) == true" >
                            <table id="<ww:property value="../../key" /><ww:property value="./orderableField/id" />">
                                <ww:iterator value="/substitutionsForField(../.., ./orderableField)/entrySet">
                                    <tr>
                                        <td width="1%" nowrap><ww:property value="/mappingViewHtml(../../.., ../orderableField, ./key, 'true')" escape="'false'" /></td>
                                        <td width="1%">
                                            <img src="<%= request.getContextPath() %>/images/icons/arrow-move.svg" alt="?">
                                        </td>
                                        <td nowrap><ww:property value="/mappingViewHtml(../../.., ../orderableField, ./value, 'false')" escape="'false'" /></td>
                                    </tr>
                                </ww:iterator>
                            </table>
                        </ww:if>
                        <ww:else>
                            <ww:property value="/newViewHtml(../.., ./orderableField)" escape="'false'" />
                        </ww:else>
                    </td>
                </tr>
            </ww:iterator>
            </tbody>
        </table>
    </ww:if>
</ww:property>

<!-- Removed Fields Table -->
<ww:property value="./removedFields">
    <ww:if test=". != null && . /empty == false">
        <table id="removed_fields_table" class="aui aui-table-rowhover">
            <thead>
                <tr>
                    <th><ww:text name="'bulk.move.removedfields'" /></th>
                </tr>
            </thead>
            <tbody>
            <ww:iterator value=".">
                <tr>
                    <td><ww:property value="/fieldName(.)" /></td>
                </tr>
            </ww:iterator>
            </tbody>
        </table>
    </ww:if>
</ww:property>
