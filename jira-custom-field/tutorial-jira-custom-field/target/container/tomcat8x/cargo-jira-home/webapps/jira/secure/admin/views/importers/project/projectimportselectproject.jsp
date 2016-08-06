
<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
<head>
    <title>
        <ww:text name="'admin.project.import.select.project.title'"/>
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
        <page:param name="action">ProjectImportSelectProject.jspa</page:param>
        <page:param name="cancelLinkURI">ProjectImportSelectBackup!cancel.jspa</page:param>
        <ww:if test="/noBackupOverview == false">
            <page:param name="submitButtonName"><ww:text name="'common.forms.next'"/></page:param>
            <page:param name="submitButtonText"><ww:text name="'common.forms.next'"/></page:param>
            <h2><ww:text name="'admin.project.import.select.project.title'"/></h2>
            <p>
                <ww:text name="'admin.project.import.select.project.desc'">
                    <ww:param name="'value0'"><p></ww:param>
                    <ww:param name="'value1'"></p></ww:param>
                </ww:text>
            </p>

            <fieldset>
                <div class="field-group">
                    <label for="project_select"><ww:text name="'admin.project.import.select.project.label'"/></label>
                    <select class="select" name="projectKey" id="project_select" onchange="populateProjectInfo(); return false;" onkeyup="populateProjectInfo(); return false;">
                        <ww:iterator value="/backupOverview/projects">
                            <option value="<ww:property value="./project/key"/>" <ww:if test="./project/key/equals(/projectKey) == true">SELECTED</ww:if>><ww:property value="./project/name"/></option>
                        </ww:iterator>
                    </select>
                    <div class="description">
                        <div id="errorBox" class="aui-message hidden aui-message-error">
                            <ul></ul>
                        </div>
                        <div id="warningBox" class="aui-message hidden aui-message-warning">
                            <ul></ul>
                        </div>
                        <br>

                        <div id="projectDetails" style="display:none;">
                            <table id="projectDetailsTable" class="aui">
                                <tbody>
                                <tr>
                                    <td width="20%"><b><ww:text name="'admin.project.import.select.project.proj.name'"/>:</b></td>
                                    <td width="80%" id="prj_name"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.key'"/>:</b></td>
                                    <td id="prj_key"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'common.concepts.project.type'"/>:</b></td>
                                    <td id="prj_type"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.desc'"/>:</b></td>
                                    <td id="prj_desc"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.lead'"/>:</b></td>
                                    <td id="prj_lead"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.url'"/>:</b></td>
                                    <td id="prj_url"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.sender.address'"/>:</b></td>
                                    <td id="prj_send"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.default.assignee'"/>:</b></td>
                                    <td id="prj_ass"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.isssues'"/>:</b></td>
                                    <td id="prj_iss"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.components'"/>:</b></td>
                                    <td id="prj_comp"></td>
                                </tr>
                                <tr>
                                    <td><b><ww:text name="'admin.project.import.select.project.proj.versions'"/>:</b></td>
                                    <td id="prj_ver"></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
                <div class="group" id="overwriteelements">
                    <legend><span><ww:text name="'admin.project.import.select.project.overwrite.label'"/></span></legend>
                    <div class="checkbox">
                        <input class="checkbox" type="checkbox" name="overwrite" id="overwrite" checked="checked" value="true">
                        <label for="overwrite"><ww:text name="'admin.project.import.select.project.overwrite.desc'"/></label>
                    </div>
                </div>
            </fieldset>

        </ww:if>
    </page:applyDecorator>

</div>

<script type="text/javascript">
    // build an array of all the project values to fill the info box
    var projectInfo = new Array();
    <ww:iterator value="/backupOverview/projects" status="'status'">
    projectInfo[<ww:property value="@status/count" /> - 1] = <ww:property value="jsonProject(.)" escape="false" />;
    </ww:iterator>

    function populateProjectInfo()
    {
        // Always make sure we show the project details div
        document.getElementById("projectDetails").style.display = "";

        var index = document.getElementById("project_select").selectedIndex;
        var project = projectInfo[index];
        document.getElementById("prj_name").innerHTML = project.prj_name;
        document.getElementById("prj_type").innerHTML = project.prj_type;
        if (project.prj_type == "")
        {
            document.getElementById("prj_type").innerHTML = "&nbsp;";
        }
        if (project.prj_name == "")
        {
            document.getElementById("prj_name").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_key").innerHTML = project.prj_key;
        if (project.prj_key == "")
        {
            document.getElementById("prj_key").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_desc").innerHTML = project.prj_desc;
        if (project.prj_desc == "")
        {
            document.getElementById("prj_desc").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_lead").innerHTML = project.prj_lead;
        if (project.prj_lead == "")
        {
            document.getElementById("prj_lead").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_url").innerHTML = project.prj_url;
        if (project.prj_url == "")
        {
            document.getElementById("prj_url").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_send").innerHTML = project.prj_send;
        if (project.prj_send == "")
        {
            document.getElementById("prj_send").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_ass").innerHTML = project.prj_ass;
        if (project.prj_ass == "")
        {
            document.getElementById("prj_ass").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_iss").innerHTML = project.prj_iss;
        if (project.prj_iss == "")
        {
            document.getElementById("prj_iss").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_comp").innerHTML = project.prj_comp;
        if (project.prj_comp == "")
        {
            document.getElementById("prj_comp").innerHTML = "&nbsp;";
        }
        document.getElementById("prj_ver").innerHTML = project.prj_ver;
        if (project.prj_ver == "")
        {
            document.getElementById("prj_ver").innerHTML = "&nbsp;";
        }

        // Make the import submit disabled if the project is not importable
        if (!project.prj_imp) {
            jQuery("#next_submit").addClass("disabled").attr("disabled", "disabled");
        }else {
            jQuery("#next_submit").removeClass("disabled").removeAttr("disabled");
        }


        if (project.prj_imp && project.warnings.length === 0)
        {
            document.getElementById("overwriteelements").style.display = "";
        }
        else
        {
            document.getElementById("overwriteelements").style.display = "none";
        }

        populateMessages("#errorBox", project.errors);
        populateMessages("#warningBox", project.warnings);
    }

    function populateMessages(selector, messages)
    {
        var $container = jQuery(selector);
        var $ul = $container.find("ul");
        $ul.find("li").remove();
        if (messages.length > 0) {
            for (var i = 0; i < messages.length; i++) {
                $ul.append(jQuery("<li>").html(messages[i]));
            }
            $container.removeClass("hidden").show();
        } else {
            $container.hide();
        }
    }

    populateProjectInfo();
</script>


</body>
</html>
