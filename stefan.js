$!webResourceManager.requireResource("com.atlassian.auiplugin:aui-experimental-table-sortable")
$!webResourceManager.requireResource("com.atlassian.auiplugin:aui-select2")

<div id="nodes"></div>

<script type="text/underscore-template" id="nodesTableTemplate">
    <table id="nodesTable" class="aui">
        <thead>
        <tr>
            <th id="key">Issue Key</th>
            <th>Name</th>
            <th >Revision</th>
            <th>Assignee</th>
            <th>Status</th>
            <th class="aui-table-column-unsortable">Actions</th>
        </tr>
        </thead>
        <tbody></tbody>
    </table>
</script>
<script type="text/underscore-template" id="nodesTableRowTemplate">
    <tr id="<%=selected.issueKey%>">
        <td>
            <a href="<%=selected.issueKey%>"><%=selected.issueKey%></a>
        </td>
        <td>
            <%=node.name%>
        </td>
        <td>
            <select class="node-revisions">
                <% _.each(node.nodeRevisions, function(nodeRevision) {%>
                <option value='<%=nodeRevision.issueKey%>' doc="<%=node.name%>"
                <% if(nodeRevision.selected) {%>
                selected
                <%}%>
                >
                <% if(nodeRevision.revisionNumber) {%>
                <%=nodeRevision.revisionNumber%>
                <%} else {%>
                Working
                <%}%>

                </option>
                <%});

                %>

            </select>
        </td>
        <td><%=selected.assignee%></td>
        <td>
            <span class="aui-lozenge jira-issue-status-lozenge-<%=selected.status.color%>"><%=selected.status.name%></span>
        </td>
        <td>
            <a id="<%=selected.issueKey%>" href="#actions"
               aria-owns="actions-<%=selected.issueKey%>" aria-haspopup="false"
               class="actions aui-style-default aui-button aui-button-subtle aui-dropdown2-trigger-arrowless aui-dropdown2-trigger">
                <span class="aui-icon aui-icon-small aui-iconfont-more">...</span></a>
            <div id="actions-<%=selected.issueKey%>" class="aui-style-default aui-dropdown2">
                <div class="aui-dropdown2-section">
                    <ul class="aui-list-truncate">
                    </ul>
                </div>
            </div>
        </td>
    </tr>
    <%
    _.each(documents, function(doc) {
    var revision = _.findWhere(doc.documentRevisions, {selected: true})
    %>

    <tr>
        <td><%=revision.issueKey%></td>
        <td><a href="$confluenceUrl/display/$spaceKey/<%=revision.page.title%>"><%=doc.name%></a></td>
        <td><%=revision.revisionNumber%></td>
        <td><%=revision.assignee%></td>
        <td><span class="aui-lozenge jira-issue-status-lozenge-<%=selected.status.color%>"><%=revision.status.name%></span></td>
        <td></td>
    <tr>
        <%
        });
        %>

    ##    <% })%>
</script>


<script type="application/javascript">
    var initialized = false;

    JIRA.ViewIssueTabs.onTabReady(_.debounce(function (data) {
        var nodesTable = AJS.$("#nodes");
        if (!initialized && nodesTable.length != 0) {
            initialized = true;
            var nodesTableView = new DocumentsTableView();
            nodesTableView.render();
        }
    }, 500));

    var DocumentsTableView = function () {
        return {
            data: {},
            lastSortColumn: null,
            template: function () {
                return AJS.$("#nodesTableTemplate").html();
            },

            rowTemplate: function (node) {
                return _.template(AJS.$("#nodesTableRowTemplate").html())(node);
            },
            render: function () {
                console.log("return")
                var that = this;
                AJS.$("#nodes").html(that.template());
                var nodesTableBody = AJS.$("#nodesTable tbody");

                var nodeRevisionService = new NodeRevisionsService();

                nodeRevisionService.getNodeRevisions(function (revisionNodes) {
                    data = revisionNodes;
                    var ajaxFunctions = [];

                    jQuery.each(revisionNodes, function (index, value) {
                        var selectedRevision = _.findWhere(value.nodeRevisions, {selected: true});
                        
// Вот здесь вытягиваются данные для таблицы
                        jQuery.ajax({
                            type: 'GET',
                            url: contextPath + "/rest/dcm-jira/1.0/document/structure",
                            data: {"issueId": selectedRevision.issueId},
                            success: function (structures) {
                                nodesTableBody.append(that.rowTemplate({
                                    node: value,
                                    selected: selectedRevision,
                                    documents: structures
                                }));

                            if(index == revisionNodes.length - 1) {
                                try {
                                
// Тут мы определяем стиль. Если его вынести за success, он не отрабатывает 
                                    AJS.$(".node-revisions").auiSelect2();
                                    var enable = $enable;
                                    AJS.$(".node-revisions").prop("disabled", !enable);
                                } catch (error) {
                                    console.log("SELECT2 ERROR: " + error);
                                }

                                AJS.$('.node-revisions').change(function () {
                                    var selectedIssueKey = $('option:selected', this).val();
                                    var nodeName = $('option:selected', this).attr("doc");

                                    var selectedDocument = _.findWhere(data, {name: nodeName});
                                    var selectedRevision = _.findWhere(selectedDocument.nodeRevisions, {issueKey: selectedIssueKey});

                                    var actionJson = {
                                        "issueId": $issueId,
                                        "selectedIssueId": selectedRevision.issueId
                                    };

                                    nodeRevisionService.updateNodeRevisions(actionJson, function () {
                                        that.render();
                                    });
                                });
                            }

                            },
                            error: function () {
                                nodesTableBody.append(that.rowTemplate({node: value, selected: selectedRevision}));
                            }
                        });

                    });


                    AJS.$(".actions").click(function () {
                        var actionsService = new ActionsService(this);
                        actionsService.setupActions();
                    });

                    AJS.$(".tablesorter-header").click(function () {
                        that.lastSortColumn = AJS.$('div span', this).text();
                    });

                        AJS.$("#nodesTable").addClass("aui-table-sortable");
                        AJS.tablessortable.setTableSortable(AJS.$("#nodesTable"));

                });
            }
        }
    }

    var NodeRevisionsService = function () {
        return {
            getNodeRevisions: function (callback) {
                jQuery.ajax({
                    type: 'GET',
                    url: contextPath + "/rest/dcm-jira/1.0/node/structure",
                    data: {"issueId": $issueId},
                    success: function (revisionNodes) {
                        callback(revisionNodes);
                    }
                });
            },

            updateNodeRevisions: function (action, callback) {
                jQuery.ajax({
                    contentType: 'application/x-www-form-urlencoded',
                    type: 'POST',
                    url: contextPath + "/rest/dcm-jira/1.0/node/revision/select",
                    data: action,
                    success: function () {
                        callback();
                    }
                });

            }
        }
    }

    var ActionsService = function (actions) {
        return {
            setupActions: function () {
                var that = this;

                var actionId = $(actions).attr('id');
                var actionSection = AJS.$("#actions-" + actionId + " .aui-list-truncate");

                actionSection.empty();

                jQuery.ajax({
                    contentType: 'application/json',
                    type: 'GET',
                    url: contextPath + "/rest/api/1.0/issues/" + actionId + "/ActionsAndOperations.json",
                    success: function (actionsData) {
                        var issueId = actionsData.id;
                        var token = actionsData.atlToken;
                        jQuery.each(actionsData.actions, function (index, value) {
                            var actionUrl = "/jira/secure/WorkflowUIDispatcher.jspa?id=" + issueId + "&action=" + value.action + "&atl_token=" + token;
                            actionSection.append("<li><a href='" + actionUrl + "'>" + value.name + "</a></li>")
                        });

                        jQuery.each(actionsData.operations, function (index, value) {
                            actionSection.append("<li><a href='" + value.url + "'>" + value.name + "</a></li>")
                        });
                    }
                });
            },
        }
    }
</script>
