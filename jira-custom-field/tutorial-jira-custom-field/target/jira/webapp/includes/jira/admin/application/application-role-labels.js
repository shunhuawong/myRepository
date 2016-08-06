define("jira/admin/application/application-role-labels", [
    "jquery",
    "jira/skate",
    "jira/admin/application/group-labels-store",
    "jira/admin/group-browser/group-label-lozenge"
], function (
    $,
    skate,
    GroupLabelsStore
) {
    var ApplicationRoleLabels = skate("application-role-labels", {
        type: skate.type.ELEMENT,
        attached: function (element) {
            //storing handler to bound element to be able to detach it afterwards
            element.syncLabelsHandler = element.updateLabels.bind(element);
            GroupLabelsStore.syncLabels(
                element.getGroupName(),
                element.getRoleKey(),
                element.syncLabelsHandler
            );
        },
        detached: function (element) {
            GroupLabelsStore.removeHandler(element.syncLabelsHandler);
            GroupLabelsStore.fetchLabels();
        },
        prototype: {
            getGroupName: function() {
                return $(this).attr("data-group-name");
            },
            getRoleKey: function() {
                return $(this).attr("data-role-key");
            },
            updateLabels: function(labels) {
                this.innerHTML = labels
                    .filter(function (label) {
                        // either it is admin label or multi app
                        return label.type === 'ADMIN' || label.type === 'MULTIPLE';
                    }, this).map(function (label) {
                        return JIRA.Templates.groupLabelLozenge({label: label});
                    }).join(' ');

                // used in web driver tests
                $(this).attr("updated", '');
                JIRA.trace("role.editors.labels");
            }
        }
    });

    return ApplicationRoleLabels;
});
