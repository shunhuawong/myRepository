<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<%@ taglib uri="jiratags" prefix="jira" %>
<ww:bean name="'com.atlassian.jira.web.util.HelpUtil'" id="helpUtil" />
<html>
<head>
	<title><ww:text name="'admin.menu.usersandgroups.user.browser'"/></title>
    <meta name="admin.active.section" content="admin_users_menu/users_groups_section"/>
    <meta name="admin.active.tab" content="user_browser"/>
    <jira:web-resource-require modules="jira.webresources:userbrowser,
        com.atlassian.plugins.helptips.jira-help-tips:common" contexts="browse-user,jira.admin.userbrowser"/>
</head>
<body>
    <ui:soy moduleKey="'jira.webresources:soy-templates'" template="'JIRA.Templates.Headers.pageHeader'">
        <ui:param name="'mainContent'">
            <h2><ww:text name="'admin.menu.usersandgroups.user.browser'" /></h2>
        </ui:param>
        <ww:property value="/opsbarLinks" >
            <ww:if test="./empty == false">
                <ui:param name="'actionsContent'">
                    <div class="aui-buttons">
                        <ww:iterator value=".">
                            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.buttons.button'">
                                <ui:param name="'tagName'" value="'a'"/>
                                <ui:param name="'id'"><ww:property value="./id"/></ui:param>
                                <ui:param name="'text'"> <ww:property value="./label" escape="false" /></ui:param><!-- JRADEV-20811 aui.buttons.button escapes, so we shouldn't -->
                                <ww:if test="./params/('isSimpleLink') != true">
                                    <ui:param name="'extraClasses'">trigger-dialog</ui:param>
                                </ww:if>
                                <ui:param name="'extraAttributes'">href="<ww:property value="./url"/>" data-url="<ww:property value="@helpUtil/helpPath('add.new.users')/url" />" title="<ww:property value="./title"/>"</ui:param>
                            </ui:soy>
                        </ww:iterator>
                    </div>
                </ui:param>
            </ww:if>
        </ww:property>
    </ui:soy>
    <page:applyDecorator id="user-filter" name="auiform">
        <page:param name="action">UserBrowser.jspa</page:param>
        <page:param name="cssClass">top-label user-browser ajs-dirty-warning-exempt</page:param>

        <ww:property value="filter">
            <div class="aui-group user-browser__filter-header">
                <div class="aui-item">
                    <page:applyDecorator name="auifieldgroup">
                        <label for="'userSearchFilter'"><ww:text name="'admin.userbrowser.filter.users'"/></label>
                        <div class="user-browser__user-search">
                            <aui:textfield label="''" maxlength="255" id="'userSearchFilter'" name="'userSearchFilter'" theme="'aui'">
                                <aui:param name="'cssClass'">full-width-field</aui:param>
                                <aui:param name="'placeholder'"><ww:text name="'admin.userbrowser.search.placeholder'"/></aui:param>
                            </aui:textfield>
                            <span class="aui-icon aui-icon-small aui-iconfont-search-small"></span>
                        </div>
                    </page:applyDecorator>
                </div>
                <div class="aui-item user-group-filter">
                    <page:applyDecorator name="auifieldgroup">
                        <label for="user-filter-group"><ww:text name="'admin.userbrowser.in.group'"/></label>
                        <select class="js-default-single-group-picker" name="group" id="user-filter-group" data-container-class="full-width-field">
                            <option data-empty value=""><ww:text name="'common.filters.any'"/></option>
                            <ww:if test="group">
                                <option value="<ww:property value="group"/>" selected="selected" data-remove-on-unselect="true"><ww:property value="group"/></option>
                            </ww:if>
                        </select>
                    </page:applyDecorator>
                </div>
                <div class="aui-item">
                    <page:applyDecorator name="auifieldgroup">
                        <aui:select label="text('admin.userbrowser.application.access')" id="'user-filter-application'" name="'applicationFilter'" list="/applicationRoles" listKey="'value'" listValue="'name'" theme="'aui'">
                            <aui:param name="'cssClass'">full-width-field</aui:param>
                            <aui:param name="'defaultOptionText'" value="text('common.filters.allusers')" />
                            <aui:param name="'defaultOptionValue'" value="''" />
                        </aui:select>
                    </page:applyDecorator>
                </div>
                <div class="aui-item user-browser__pagination">
                    <page:applyDecorator name="auifieldgroup">
                        <aui:select label="text('admin.userbrowser.users.per.page')" id="'usersPerPage'" name="'max'" list="/maxValues" listKey="'.'" listValue="'.'" theme="'aui'">
                            <aui:param name="'cssClass'">short-field</aui:param>
                            <aui:param name="'defaultOptionText'" value="text('common.words.all')" />
                            <aui:param name="'defaultOptionValue'" value="'1000000'" />
                        </aui:select>

                        <span class="user-browser__buttons">
                            <aui:component template="formSubmit.jsp" theme="'aui'">
                                <aui:param name="'submitButtonText'"><ww:text name="'navigator.tabs.filter'"/></aui:param>
                            </aui:component>
                            <aui:component template="formCancel.jsp" theme="'aui'">
                                <aui:param name="'cancelLinkText'"><ww:text name="'admin.userbrowser.reset.filter'"/></aui:param>
                                <aui:param name="'cancelLinkURI'">UserBrowser.jspa?emailFilter=&group=&max=<ww:property value="filter/max"/></aui:param>
                            </aui:component>
                        </span>
                    </page:applyDecorator>
                </div>
            </div>
        </ww:property>
    </page:applyDecorator>
    <div class="aui-group count-pagination">
        <div class="results-count aui-item">
            <ww:text name="'admin.userbrowser.displaying.users'">
                <ww:param name="'value0'"><span class="results-count-start"><ww:property value="niceStart" /></span></ww:param>
                <ww:param name="'value1'"><span class="results-count-end"><ww:property value="niceEnd" /></span></ww:param>
                <ww:param name="'value2'"><span class="results-count-total"><ww:property value="users/size" /></span></ww:param>
            </ww:text>
        </div>
        <div class="pagination aui-item">
            <ww:if test="filter/start > 0">
                <a class="icon icon-previous" href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="filter/previousStart" /></ww:url>"><span>&lt;&lt; <ww:text name="'common.forms.previous'"/></span></a>
            </ww:if>
            <ww:property value = "pager/pages(/browsableItems)">
                <ww:if test="size > 1">
                    <ww:iterator value="." status="'pagerStatus'">
                        <ww:if test="currentPage == true"><strong><ww:property value="pageNumber" /></strong></ww:if>
                        <ww:else>
                            <a href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="start" /></ww:url>"><ww:property value="pageNumber" /></a>
                        </ww:else>
                    </ww:iterator>
                </ww:if>
            </ww:property>
            <ww:if test="filter/end < users/size">
                <a class="icon icon-next" href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="filter/nextStart" /></ww:url>"><span><ww:text name="'common.forms.next'"/> &gt;&gt;</span></a>
            </ww:if>
        </div>
    </div>
    <table class="aui aui-table-rowhover" id="user_browser_table">
        <thead>
            <tr>
                <th>
                    <ww:text name="'admin.userbrowser.full.name'"/>
                </th>
                <th>
                    <ww:text name="'common.words.username'"/>
                </th>
                <th>
                    <ww:text name="'login.details'"/>
                </th>
                <th>
                    <ww:text name="'common.words.group.name'"/>
                </th>
                <th>
                    <ww:text name="'common.words.applications'"/>
                </th>
                <th>
                    <ww:text name="'admin.user.directory'"/>
                </th>
                <th width="10%"></th>
            </tr>
        </thead>
        <tbody>
            <ww:iterator value="currentPage" status="'status'">
                <tr class="vcard user-row" data-focused="<ww:property value="/userFocused(.)"/>" data-user="<ww:property value="name"/>">
                    <td data-cell-type="fullname">
                        <a id="<ww:property value="name"/>" rel="<ww:property value="name"/>" class="user-hover user-avatar" href="<ww:url page="ViewUser.jspa"><ww:param name="'name'" value="name"/></ww:url>">
                            <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.avatar.avatar'">
                                <ui:param name="'size'" value="'xsmall'" />
                                <ui:param name="'avatarImageUrl'" value="avatarUrl(name)/toString()" />
                                <ui:param name="'accessibilityText'"><ww:text name="'user.profile.for'"><ww:param name="'value0'"><ww:property value="displayName" escape="false"/></ww:param></ww:text></ui:param>
                            </ui:soy>
                            <span class="fn"><ww:if test="active==false"><del></ww:if><ww:property value="displayName"/><ww:if test="active==false"></del></ww:if></span>
                        </a>
                    </td>
                    <td data-cell-type="username"><div>
                        <span class="username"><ww:if test="active==false"><del></ww:if><ww:property value="name"/><ww:if test="active==false"></del><br>(<ww:text name="'admin.common.words.inactive'"/>)</ww:if></span>
                        <br/>
                        <a href="mailto:<ww:property value="emailAddress"/>"><span class="email"><ww:property value="emailAddress"/></span></a>
                    </div></td>
                    <td data-cell-type="login-details" class="minNoWrap">
                        <ww:if test="/everLoggedIn(.) == true">
                            <strong><ww:text name="'common.concepts.count'"/>:</strong> <ww:property value="/loginCount(.)" /><br />
                            <strong><ww:text name="'common.concepts.last'"/>:</strong> <ww:property value="/lastLogin(.)" /><br />
                            <br />
                        </ww:if>
                        <ww:else>
                            <ww:text name="'login.never.in'"/><br />
                        </ww:else>
                        <ww:if test="/elevatedSecurityCheckRequired(.) == true">
                            <strong><i><ww:text name="'login.elevated.security.check.required'"/></i></strong><br />
                            <strong><ww:text name="'login.last.failed.login'"/>:</strong> <span id="lastFailedLogin"><ww:property value="/lastFailedLogin(.)" /></span><br />
                            <strong><ww:text name="'login.current.failed.login.count'"/>:</strong> <span id="currentFailedLoginCount"><ww:property value="/currentFailedLoginCount(.)" /></span><br />
                            <strong><ww:text name="'login.total.failed.login.count'"/>:</strong> <span id="totalFailedLoginCount"><ww:property value="/totalFailedLoginCount(.)" /></span><br />
                            <a data-link-type="reset-login-count" href="<ww:url page="ResetFailedLoginCount.jspa"><ww:param name="'name'" value="name" /><ww:param name="'returnUrl'" value="'/secure/admin/user/UserBrowser.jspa'"/></ww:url>"><ww:text name="'admin.resetfailedlogin.title'"/></a>
                        </ww:if>
                    </td>
                    <td data-cell-type="user-groups">
                        <ul class="toggle-list simple-list">
                            <ww:iterator value="/groupsForUser(.)">
                                <li><a href="<ww:url page="ViewGroup.jspa"><ww:param name="'name'" value="."/></ww:url>"><ww:property value="."/></a></li>
                            </ww:iterator>
                        </ul>
                        <a class="toggle-list__show-more" href="#"><ww:text name="'common.words.show.more'"/></a>
                        <a class="toggle-list__show-less" href="#"><ww:text name="'common.words.show.less'"/></a>
                    </td>
                    <td data-cell-type="user-application-roles">
                        <ul class="simple-list">
                            <ww:iterator value="/applicationRolesForUser(.)">
                                <li>
                                    <ww:if test="active == false"><del></ww:if>
                                    <ww:property value="./name"/>
                                    <ww:if test="active == false"></del></ww:if>
                                </li>
                            </ww:iterator>
                        </ul>
                    </td>
                    <td data-cell-type="user-directory"><ww:property value="/directoryForUser(.)"/></td>
                    <td data-cell-type="operations">
                        <ww:if test="/remoteUserPermittedToEditSelectedUser(.) == true">
                            <a class="aui-button aui-button-link trigger-dialog edit-profile-link" id="edituser_link_<ww:property value="name"/>" href="<ww:url page="EditUser!default.jspa"><ww:param name="'editName'" value="name" /><ww:param name="'returnUrl'" value="'UserBrowser.jspa'" /></ww:url>">
                                <ww:text name="'common.words.edit'"/>
                            </a>
                        </ww:if>
                        <a href="#user-actions-<ww:property value="name"/>" aria-owns="user-actions-<ww:property value="name"/>" aria-haspopup="true" class="aui-button aui-button-subtle aui-button-compact aui-dropdown2-trigger aui-dropdown2-trigger-arrowless aui-style-default details-button">
                            <span class="aui-icon aui-icon-small aui-iconfont-more">
                                <ww:text name="'common.words.operations'"/>
                            </span>
                        </a>
                        <div id="user-actions-<ww:property value="name"/>" class="aui-dropdown2 aui-style-default">
                            <ul class="aui-list-truncate">
                                <ww:if test="/remoteUserPermittedToEditSelectedUsersGroups(.) == true">
                                    <li><a class="trigger-dialog editgroups_link" id="editgroups_<ww:property value="name"/>" href="<ww:url page="EditUserGroups!default.jspa"><ww:param name="'name'" value="name" /><ww:param name="'returnUrl'" value="'UserBrowser.jspa'" /></ww:url>">
                                        <ww:text name="'admin.userbrowser.actions.edit.groups'"/>
                                    </a></li>
                                </ww:if>
                                <li><a id="projectroles_link_<ww:property value="name"/>" href="<ww:url page="ViewUserProjectRoles!default.jspa"><ww:param name="'name'" value="name" /><ww:param name="'returnUrl'" value="'UserBrowser.jspa'" /></ww:url>">
                                    <ww:text name="'admin.userbrowser.actions.view.project.roles'"/>
                                </a></li>
                                <ww:if test="/remoteUserPermittedToEditSelectedUser(.) == true">
                                    <li><a class="trigger-dialog" id="deleteuser_link_<ww:property value="name"/>" href="<ww:url page="DeleteUser!default.jspa"><ww:param name="'name'" value="name" /><ww:param name="'returnUrl'" value="'UserBrowser.jspa'" /></ww:url>">
                                        <ww:text name="'admin.userbrowser.actions.delete.user'"/>
                                    </a></li>
                                </ww:if>
                            </ul>
                        </div>
                    </td>
                </tr>
            </ww:iterator>
        </tbody>
    </table>
    <ww:if test="users/size == 0">
        <div class="jira-adbox jira-adbox-medium no-results user-browser__row-empty">
            <h3><ww:text name="'admin.userbrowser.not.found'"/></h3>
            <p class="no-results-hint"><ww:text name="'admin.userbrowser.not.found.hint'"/></p>
        </div>
    </ww:if>
    <div class="aui-group count-pagination">
        <div class="pagination aui-item">
            <ww:if test="filter/start > 0">
                <a class="icon icon-previous" href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="filter/previousStart" /></ww:url>"><span>&lt;&lt; <ww:text name="'common.forms.previous'"/></span></a>
            </ww:if>
            <ww:property value = "pager/pages(/browsableItems)">
                <ww:if test="size > 1">
                    <ww:iterator value="." status="'pagerStatus'">
                        <ww:if test="currentPage == true"><strong><ww:property value="pageNumber" /></strong></ww:if>
                        <ww:else>
                            <a href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="start" /></ww:url>"><ww:property value="pageNumber" /></a>
                        </ww:else>
                    </ww:iterator>
                </ww:if>
            </ww:property>
            <ww:if test="filter/end < users/size">
                <a class="icon icon-next" href="<ww:url page="UserBrowser.jspa"><ww:param name="'start'" value="filter/nextStart" /></ww:url>"><span><ww:text name="'common.forms.next'"/> &gt;&gt;</span></a>
            </ww:if>
        </div>
    </div>
</body>
</html>
