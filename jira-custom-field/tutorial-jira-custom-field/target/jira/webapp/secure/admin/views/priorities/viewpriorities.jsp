<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<head>
	<title><ww:text name="'admin.issuesettings.priorities.view.priorities'"/></title>
    <meta name="admin.active.section" content="admin_issues_menu/issue_attributes"/>
    <meta name="admin.active.tab" content="priorities"/>
    <script>
        function openWindow()
        {
            var vWinUsers = window.open('<%= request.getContextPath() %>/secure/popups/IconPicker.jspa?fieldType=priority&formName=jiraform','IconPicker', 'status=no,resizable=yes,top=100,left=200,width=580,height=650,scrollbars=yes');
            vWinUsers.opener = self;
            vWinUsers.focus();
        }
    </script>
</head>
<body>
<page:applyDecorator name="jirapanel">
    <page:param name="title"><ww:text name="'admin.issuesettings.priorities.view.priorities'"/></page:param>
    <page:param name="width">100%</page:param>
    <p><ww:text name="'admin.issuesettings.priorities.the.table.below'"/></p>
    <ww:if test="/translatable == true">
        <ul class="optionslist">
            <li>
            <ww:text name="'admin.issuesettings.priorities.translate.priorities'">
                <ww:param name="'value0'"><b><a href="ViewTranslations!default.jspa?issueConstantType=priority"></ww:param>
                <ww:param name="'value1'"></a></b></ww:param>
            </ww:text>
            </li>
        </ul>
    </ww:if>
</page:applyDecorator>
<table class="aui aui-table-rowhover">
    <thead>
        <tr>
            <th>
                <ww:text name="'common.words.name'"/>
            </th>
            <th>
                <ww:text name="'common.words.description'"/>
            </th>
            <th>
                <ww:text name="'iconpicker.label.icon'"/>
            </th>
            <th>
                <ww:text name="'admin.common.words.color'"/>
            </th>
            <th>
                <ww:text name="'admin.issuesettings.order'"/>
            </th>
            <th width="10%">
                <ww:text name="'common.words.operations'"/>
            </th>
        </tr>
    </thead>
    <tbody>
    <ww:iterator value="/constantsManager/priorities" status="'status'">
        <tr>
            <td><b><ww:property value="name"/></b><ww:if test="../default(.) == true"> (<ww:text name="'admin.common.words.default'"/>)</ww:if></td>
            <td><ww:property value="description"/></td>
            <td>
            <ww:component name="'priority'" template="constanticon.jsp">
              <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
              <ww:param name="'iconurl'" value="iconUrl" />
              <ww:param name="'alt'"><ww:property value="name" /></ww:param>
            </ww:component>
            </td>
            <td>
                <table><tr><td bgcolor="<ww:property value="./statusColor"/>"><img src="<%= request.getContextPath() %>/images/border/spacer.gif" border="0" width="16" height="16" alt=""/></td></tr></table>
            </td>
            <td>
                <ww:if test="@status/first != true"><a href="<ww:url page="PriorityUp.jspa"><ww:param name="'up'" value="id" /></ww:url>"><span class="icon-default aui-icon aui-icon-small aui-iconfont-up"><ww:text name="'admin.issuesettings.priorities.move.priority.up'"/></span></a></ww:if>
                <ww:if test="@status/last != true"><a href="<ww:url page="PriorityDown.jspa"><ww:param name="'down'" value="id" /></ww:url>"><span class="icon-default aui-icon aui-icon-small aui-iconfont-down"><ww:text name="'admin.issuesettings.priorities.move.priority.down'"/></span></a></ww:if>
            </td>
            <td>
                <ul class="operations-list">
                    <li><a href="EditPriority!default.jspa?id=<ww:property value="id"/>"><ww:text name="'common.words.edit'"/></a></li>
                    <li><a href="DeletePriority!default.jspa?id=<ww:property value="id"/>"><ww:text name="'common.words.delete'"/></a></li>
                <ww:if test="../default(.) == false">
                    <li><a href="<ww:url page="MakeDefaultPriority.jspa"><ww:param name="'make'" value="id" /></ww:url>"><ww:text name="'admin.common.words.default'"/></a></li>
                </ww:if>
                </ul>
            </td>
        </tr>
    </ww:iterator>
    </tbody>
</table>

<aui:component template="module.jsp" theme="'aui'">
    <aui:param name="'contentHtml'">
        <page:applyDecorator name="jiraform">
            <page:param name="action">AddPriority.jspa</page:param>
            <page:param name="submitId">add_submit</page:param>
            <page:param name="submitName"><ww:text name="'common.forms.add'"/></page:param>
            <page:param name="width">100%</page:param>
            <page:param name="title"><ww:text name="'admin.issuesettings.priorities.add.new.priority'"/></page:param>
            <page:param name="helpURL">priorities</page:param>

            <ui:textfield label="text('common.words.name')" name="'name'" size="'30'" >
                <ui:param name="'mandatory'" value="'true'" />
            </ui:textfield>

            <ui:textfield label="text('common.words.description')" name="'description'" size="'60'" />

            <ui:component label="text('admin.common.phrases.icon.url')" name="'iconurl'" template="textimagedisabling.jsp">
                <ui:param name="'imagefunction'">openWindow()</ui:param>
                <ui:param name="'size'">60</ui:param>
                <ui:param name="'mandatory'">true</ui:param>
                <ui:param name="'description'"><ww:text name="'admin.common.phrases.relative.to.jira'"/></ui:param>
            </ui:component>

            <ui:component label="text('admin.issuesettings.priorities.status.color')" name="'statusColor'" template="colorpicker.jsp">
                <ui:param name="'size'">40</ui:param>
                <ui:param name="'mandatory'" value="'true'" />
            </ui:component>
            <ui:component name="'preview'" value="'false'" template="hidden.jsp" theme="'single'"  />

        </page:applyDecorator>
    </aui:param>
</aui:component>
</body>
</html>
