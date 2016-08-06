define('jira/field/role-picker-util', [
        'jquery',
        'jira/ajs/list/group-descriptor',
        'jira/ajs/list/item-descriptor'
], function(
        $,
        GroupDescriptor,
        ItemDescriptor
) {
    "use strict";

    var RolePickerUtil = {};

    RolePickerUtil.formatResponse = function (data) {
        var ret = [];

        $(data).each(function(i, suggestions) {

            var groupDescriptor = new GroupDescriptor({
                weight: i, // order of roles in suggestions dropdown
                label: suggestions.header
            });
            $(suggestions.roles).each(function(){
                groupDescriptor.addItem(new ItemDescriptor({
                    value: this.name, // value of item added to select
                    label: this.name, // title of lozenge
                    title: this.name, // tooltip
                    html: this.html,
                    highlighted: true
                }));
            });

            ret.push(groupDescriptor);
        });

        return ret;
    }

    return RolePickerUtil;
});
