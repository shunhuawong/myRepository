<%@ taglib uri="webwork" prefix="ww" %>
<table id="global_perms" class="aui aui-table-rowhover">
    <thead>
        <ww:if test="key == 23">
            <%-- 23 == PROJECT_ADMIN permission (magic numbers ftlose) --%>
            <ww:if test="allowGlobalPerms == true">
            <tr>
                <th>
                    <ww:text name="'admin.globalpermissions.title'"/>
                </th>
                <th style="width: 240px;">
                    <ww:text name="'admin.common.words.users.groups'"/>
                </th>
            </tr>
            </ww:if>
        </ww:if>
        <ww:else>
            <tr>
                <th>
                    <ww:property value="project/string('name')" /> <ww:text name="'admin.common.words.permissions'"/>
                </th>
                <th style="width: 240px;">
                    <ww:text name="'admin.common.words.users.groups'"/>
                </th>
            </tr>
        </ww:else>
    </thead>
    <tbody>
        <ww:iterator value="globalPermTypes">
            <%-- elide USE permission --%>
            <ww:if test="key != 'USE'">
            <tr>
                <td>
                    <strong><ww:property value="text(value)"/></strong>
                    <div class="secondary-text">
                        <p><ww:property value="/description(key)" escape="false"/></p>
                            <%-- If permission is not managed by jira provide the link to external service  --%>
                        <ww:if test="/managedByJira(key) == false">
                            <p>
                                <a href="<ww:property value="/externalPermissionManagementUrl"/>"><ww:text name="'admin.globalpermissions.external.manage.link'"/></a>
                            </p>
                        </ww:if>
                    </div>
                </td>
                <td>
                    <ww:property value="/permissionGroups(key)">
                        <ww:if test=". != null && size > 0">
                            <ul>
                                <ww:iterator value=".">
                                    <li>
                                        <span>
                                            <ww:if test="group">
                                                <ww:property value="group" />
                                            </ww:if>
                                            <ww:else>
                                                <ww:text name="'admin.common.words.anyone'"/>
                                            </ww:else>
                                        </span>
                                        <ul class="operations-list" style="display: block;">
                                            <li><a href="<%= request.getContextPath() %>/secure/admin/user/UserBrowser.jspa?group=<ww:property value="group" />"><ww:text name="'admin.globalpermissions.view.users'"/></a></li>
                                            <ww:if test="/managedByJira(../key) == true">
                                                <li><a id="del_<ww:property value="../key" />_<ww:property value="group" />" href="<ww:url page="GlobalPermissions.jspa">
                                                    <ww:param name="'action'">confirm</ww:param>
                                                    <ww:param name="'globalPermType'" value="../key" />
                                                    <ww:param name="'groupName'" value="group"/><%-- if no group - then don't show it --%>
                                                    <ww:param name="'pid'" value="pid"/>
                                                    </ww:url>"><ww:text name="'common.words.delete'"/></a>
                                                </li>
                                            </ww:if>
                                        </ul>
                                    </li>
                                </ww:iterator>
                            </ul>
                        </ww:if>
                        <ww:else>
                            &nbsp;
                        </ww:else>
                    </ww:property>
                </td>
            </tr>
            </ww:if>
        </ww:iterator>
    </tbody>
</table>
