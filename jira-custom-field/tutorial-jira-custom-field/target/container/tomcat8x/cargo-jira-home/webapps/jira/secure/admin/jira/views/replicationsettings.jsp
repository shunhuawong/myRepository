<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<head>
    <title><ww:text name="'admin.menu.system.replication'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/advanced_menu_section/advanced_section"/>
    <meta name="admin.active.tab" content="replication"/>
</head>
<body>

<header class="aui-page-header">
    <div class="aui-page-header-inner">
        <div class="aui-page-header-main">
            <h2><ww:text name="'admin.replicationsettings.title'"/></h2>
        </div>
        <ww:if test="/systemAdministrator == true">
            <div class="aui-page-header-actions">
                <div class="aui-buttons">
                    <a id="edit-replication-settings" class="aui-button trigger-dialog" href="EditReplicationSettings!default.jspa">
                        <span class="aui-icon aui-icon-small aui-iconfont-edit"></span>
                        <ww:text name="'admin.common.phrases.edit.settings'"/>
                    </a>
                </div>
                <aui:component name="'replicationsettings'" template="help.jsp" theme="'aui'" />
            </div>

        </ww:if>
    </div>
</header>

<ww:if test="/systemAdministrator == true && /clusterLicensed == false">
    <aui:component template="auimessage.jsp" theme="'aui'">
        <aui:param name="'messageType'">warning</aui:param>
        <aui:param name="'messageHtml'">
            <p>
                <ww:text name="'admin.replicationsettings.notlicensed'" />
            </p>
        </aui:param>
    </aui:component>
</ww:if>

<p><ww:text name="'admin.replicationsettings.description'"/></p>

<aui:component template="module.jsp" theme="'aui'">
    <aui:param name="'id'">ReplicationSettings</aui:param>
    <aui:param name="'contentHtml'">
        <table class="aui aui-table-rowhover" id="table-replication-settings">
            <tbody>

            <tr>
                <td width="40%" data-cell-type="label">
                    <strong><ww:text name="'admin.replicationsettings.enabled'"/></strong>
                </td>
                <td width="60%" data-cell-type="value">
                    <ww:if test="/replicationEnabled == true">
                        <strong class="status-active"><ww:text name="'admin.common.words.on'"/></strong>
                    </ww:if>
                    <ww:else>
                        <strong class="status-inactive"><ww:text name="'admin.common.words.off'"/></strong>
                    </ww:else>
                </td>
            </tr>

            <tr>
                <td width="40%" data-cell-type="label">
                    <strong><ww:text name="'admin.replicationsettings.folder'"/></strong>
                </td>
                <td width="60%" data-cell-type="value">
                    <ww:property value="replicationPath" />
                </td>
            </tr>

            <ww:if test="/replicationEnabled == true">
                <tr>
                    <td width="40%" data-cell-type="label">
                        <strong><ww:text name="'admin.systeminfo.attachments'"/></strong>
                    </td>
                    <td width="60%" data-cell-type="value">
                        <ww:if test="applicationProperties/option('jira.secondary.store.attachments.enabled') == true">
                            <strong class="status-active"><ww:text name="'admin.common.words.on'"/></strong>
                        </ww:if>
                        <ww:else>
                            <strong class="status-inactive"><ww:text name="'admin.common.words.off'"/></strong>
                        </ww:else>
                    </td>
                </tr>

                <tr>
                    <td width="40%" data-cell-type="label">
                        <strong><ww:text name="'admin.replicationsettings.index.snapshots.enabled'"/></strong>
                    </td>
                    <td width="60%" data-cell-type="value">
                        <ww:if test="applicationProperties/option('jira.secondary.store.index.snapshots.enabled') == true">
                            <strong class="status-active"><ww:text name="'admin.common.words.on'"/></strong>
                        </ww:if>
                        <ww:else>
                            <strong class="status-inactive"><ww:text name="'admin.common.words.off'"/></strong>
                        </ww:else>
                    </td>
                </tr>

                <tr>
                    <td width="40%" data-cell-type="label">
                        <strong><ww:text name="'admin.replicationsettings.avatars.enabled'"/></strong>
                    </td>
                    <td width="60%" data-cell-type="value">
                        <ww:if test="applicationProperties/option('jira.secondary.store.avatars.enabled') == true">
                            <strong class="status-active"><ww:text name="'admin.common.words.on'"/></strong>
                        </ww:if>
                        <ww:else>
                            <strong class="status-inactive"><ww:text name="'admin.common.words.off'"/></strong>
                        </ww:else>
                    </td>
                </tr>

                <tr>
                    <td width="40%" data-cell-type="label">
                        <strong><ww:text name="'admin.plugins.installed.plugins'"/></strong>
                    </td>
                    <td width="60%" data-cell-type="value">
                        <ww:if test="applicationProperties/option('jira.secondary.store.plugins.enabled') == true">
                            <strong class="status-active"><ww:text name="'admin.common.words.on'"/></strong>
                        </ww:if>
                        <ww:else>
                            <strong class="status-inactive"><ww:text name="'admin.common.words.off'"/></strong>
                        </ww:else>
                    </td>
                </tr>
            </ww:if>
            </tbody>
        </table>
    </aui:param>
</aui:component>

<page:applyDecorator id="replicate" name="auiform">
    <page:param name="action">ReplicationSettings.jspa</page:param>
    <page:param name="submitButtonName">ReplicateRequested</page:param>
    <page:param name="submitButtonText"><ww:text name="'admin.replicationsettings.replicate.title'"/></page:param>

    <ww:if test="/replicating == true || /replicationEnabled == false"><page:param name="submitButtonDisabled">true</page:param></ww:if>

    <header class="aui-page-header">
        <div class="aui-page-header-inner">
            <div class="aui-page-header-main">
                <h2><ww:text name="'admin.replicationsettings.replicate.title'"/></h2>
            </div>
            <div class="aui-page-header-actions">
                <aui:component name="'replicate'" template="help.jsp" theme="'aui'" />
            </div>
        </div>
    </header>

    <ww:if test="/replicating == true">
        <aui:component template="auimessage.jsp" theme="'aui'">
            <aui:param name="'messageType'">info</aui:param>
            <aui:param name="'messageHtml'">
                <p><ww:text name="'admin.replicationsettings.replicate.inprogress'" /></p>
            </aui:param>
        </aui:component>
    </ww:if>

    <p><ww:text name="'admin.replicationsettings.replicate.description'"/></p>

</page:applyDecorator>

</body>
</html>
