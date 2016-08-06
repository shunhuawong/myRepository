AJS.test.require('jira.webresources:projectpermissions', function() {
    var GrantModel = require('jira/project/permissions/grantmodel');

    module('GrantModel validation');

    test('A grant that does not belong to any security type will not throw an error', function() {
        var model = new GrantModel();

        strictEqual(model.validate(), undefined, 'empty model should successfully validate');
    });

    test('A grant that belongs to a security type other than single user should validate even if empty data', function() {
        var model = new GrantModel({
            securityType: 'group'
        });

        strictEqual(model.validate(), undefined, 'model with security type group should successfully validate');
    });

    test('A single user grant with no value defined should return an error', function() {
        var model = new GrantModel({
            securityType: 'user'
        });

        strictEqual(model.validate(), 'a.user.must.be.selected', 'single user model with undefined value should not validate');
    });

    test('A single user grant with null as its value should return an error', function() {
        var model = new GrantModel({
            securityType: 'user',
            securityTypeParamVal: null
        });

        strictEqual(model.validate(), 'a.user.must.be.selected', 'single user model with null value should not validate');
    });

    test('A single user grant with a plain String as its value should return an error', function() {
        var model = new GrantModel({
            securityType: 'user',
            securityTypeParamVal: 'admin'
        });

        strictEqual(model.validate(), 'a.user.must.be.selected', 'single user model with plain String value should not validate');
    });

    test('A single user grant should only validate when the param value is an array and the first element is the username', function() {
        var model = new GrantModel({
            securityType: 'user',
            securityTypeParamVal: ['admin']
        });

        strictEqual(model.validate(), undefined, 'single user model with correct param value should successfully validate');
    });
});
