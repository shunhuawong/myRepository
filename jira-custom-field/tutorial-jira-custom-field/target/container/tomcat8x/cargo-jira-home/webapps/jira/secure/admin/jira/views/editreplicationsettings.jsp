<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<head>
    <title><ww:text name="'admin.replicationsettings.edit'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/advanced_menu_section/advanced_section"/>
    <meta name="admin.active.tab" content="replication"/>
    <meta name="decorator" content="panel-admin"/>
</head>


<body>

<page:applyDecorator id="edit-replication" name="auiform">
    <page:param name="action">EditReplicationSettings.jspa</page:param>
    <page:param name="method">post</page:param>
    <page:param name="submitButtonText"><ww:text name="'common.forms.update'"/></page:param>
    <page:param name="submitButtonName"><ww:text name="'common.forms.update'"/></page:param>
    <page:param name="cancelLinkURI">ReplicationSettings!default.jspa</page:param>

    <aui:component template="formHeading.jsp" theme="'aui'">
        <aui:param name="'text'"><ww:text name="'admin.replicationsettings.edit'"/></aui:param>
    </aui:component>

    <ww:if test="/systemAdministrator == true">
        <page:applyDecorator name="auifieldset">
            <page:param name="type">group</page:param>
            <page:param name="legend"><ww:text name="'admin.replicationsettings.enable.features'"/></page:param>

            <page:applyDecorator name="auifieldgroup">
                <page:param name="type">checkbox</page:param>
                <aui:checkbox id="'attachmentsEnabled'" label="text('admin.systeminfo.attachments')" name="'attachmentsEnabled'" fieldValue="'true'" theme="'aui'"/>
            </page:applyDecorator>

            <page:applyDecorator name="auifieldgroup">
                <page:param name="type">checkbox</page:param>
                <aui:checkbox id="'indexSnapshotsEnabled'" label="text('admin.replicationsettings.index.snapshots.enabled')" name="'indexSnapshotsEnabled'" fieldValue="'true'" theme="'aui'"/>
            </page:applyDecorator>

            <page:applyDecorator name="auifieldgroup">
                <page:param name="type">checkbox</page:param>
                <aui:checkbox id="'avatarsEnabled'" label="text('admin.replicationsettings.avatars.enabled')" name="'avatarsEnabled'" fieldValue="'true'" theme="'aui'"/>
            </page:applyDecorator>

            <page:applyDecorator name="auifieldgroup">
                <page:param name="type">checkbox</page:param>
                <aui:checkbox id="'pluginsEnabled'" label="text('admin.plugins.installed.plugins')" name="'pluginsEnabled'" fieldValue="'true'" theme="'aui'"/>
            </page:applyDecorator>



        </page:applyDecorator>
    </ww:if>

</page:applyDecorator>
</body>
</html>
