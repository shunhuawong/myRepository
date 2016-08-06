AJS.test.require('jira.webresources:role-pickers', function () {

    var RolePickerUtil = require('jira/field/role-picker-util');

    function createGroups(header) {
        return [
            {
                header: header,
                roles: [
                    {
                        name: "role1",
                        html: "<test>1</test>"
                    },
                    {
                        name: "role2",
                        html: "<test>2</test>"
                    }
                ]
            }
        ];
    }

    test('Roles formatted into ItemDescriptor', function () {
        var groups = createGroups("HEADER");
        var group = groups[0];

        var formattedData = RolePickerUtil.formatResponse(groups);
        strictEqual(formattedData.length, 1, 'There should only be one GroupDescriptor');

        var groupDescriptor = formattedData[0].properties;
        strictEqual(groupDescriptor.label, group.header, 'Expected provided header to be returned');

        var selectionItems = groupDescriptor.items;
        strictEqual(selectionItems.length, group.roles.length, 'Expected all roles to be transformed into ItemDescriptor');

        strictEqual(selectionItems[0].properties.value, group.roles[0].name, 'properties.value does not match expected name');
        strictEqual(selectionItems[1].properties.value, group.roles[1].name, 'properties.value does not match expected name');

        strictEqual(selectionItems[0].properties.html, group.roles[0].html, 'properties.html does not match expected name');
        strictEqual(selectionItems[1].properties.html, group.roles[1].html, 'properties.html does not match expected name');

        strictEqual(selectionItems[0].properties.highlighted, true, 'Item expected to be highlighted');
        strictEqual(selectionItems[1].properties.highlighted, true, 'Item expected to be highlighted');
    });

});