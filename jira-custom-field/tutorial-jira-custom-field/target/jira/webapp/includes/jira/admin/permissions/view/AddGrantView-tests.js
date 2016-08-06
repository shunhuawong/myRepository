AJS.test.require('jira.webresources:projectpermissions', function() {

    var $ = require('jquery');
    var _ = require('underscore');

    var AddGrantView = require('jira/project/permissions/addgrantview');
    var GrantModel = require('jira/project/permissions/grantmodel');
    var SecurityTypes = require('jira/project/permissions/securitytypes');

    module('projectpermissions/add-grant-view');


    /**
     * Create a stub security type with given details
     * @param securityType
     * @param displayName
     * @param isPrimary
     * @param values
     * @param userPermissions
     * @returns {GrantModel}
     */
    function createSecurityTypeModel(securityType, displayName, isPrimary, values, help) {
        return new GrantModel({
            securityType: securityType,
            displayName: displayName,
            primary: isPrimary,
            values: values,
            help: help
        });
    }

    /**
     * Create a stub user security type with given values and permissions
     * @param values
     * @param userPermissions
     * @returns {GrantModel}
     */
    function createUserSecurityTypeModel(values, help) {
        return createSecurityTypeModel('user', 'User', false, values, help);
    }

    /**
     * Create a stub user security type with browse user permissions.
     * @returns {GrantModel}
     */
    function createUserSecurityTypeModelWithBrowse() {
        return createUserSecurityTypeModel([], null);
    }

    /**
     * Create a stub user security type with no browse user permissions.
     * @returns {GrantModel}
     */
    function createUserSecurityTypeModelWithNoBrowse() {
        return createUserSecurityTypeModel([], {
            infoText: "No permission",
            helpText: "More help",
            helpUrl: "url"
        });
    }


    function createViewWithModelWithSecurityType(securityType) {
        return new AddGrantView({
            model: new GrantModel({
                securityType: securityType,
                displayName: "Test1",
                primary: false,
                values: [{
                    value: "val1",
                    displayValue: "dispVal1"
                }, {
                    value: "val2",
                    displayValue: "dispVal2"
                }]
            })
        });
    }

    test('A user with no browse user permission shows info icon', function() {
        var view = new AddGrantView({
            model: createUserSecurityTypeModelWithNoBrowse()
        });

        view.render();

        ok(view.$el.find('.aui-icon.icon-help').length > 0);
    });

    test('A user with browse user permission does not show info icon ', function() {
        var view = new AddGrantView({
            model: createUserSecurityTypeModelWithBrowse()
        });

        view.render();

        ok(view.$el.find('.aui-icon.icon-help').length === 0);
    });

    test('Selecting radio button toggles display of any textboxes', function() {
        var view = new AddGrantView({
            model: createUserSecurityTypeModelWithBrowse()
        });

        view.render();

        //Appends to fixture otherwise click events don't work and can't test if visible.
        $('#qunit-fixture').append(view.$el);

        ok(!view.$el.find('#user-single-select').is(':visible'), 'Input view should not be visible');

        view.$el.find('.security-type-item-radio-btn').click();

        ok(view.$el.find('#user-single-select').is(':visible'), 'After radio click, input view should be visible');
    });

    test('Test event was added and initial value is stored in the model', function() {
        var securityTypesThatRequiredInputValue =
            [
                SecurityTypes.USER_CF,
                SecurityTypes.GROUP_CF,
                SecurityTypes.PROJECT_ROLE,
                SecurityTypes.APPLICATION_ROLE,
                SecurityTypes.GROUP,
                SecurityTypes.SINGLE_USER
            ];

        _.each(securityTypesThatRequiredInputValue, function (secType) {

            var view = createViewWithModelWithSecurityType(secType);

            var renderInput = view.renderInput();
            ok(renderInput, 'Expected render input for ' + secType);
            ok(renderInput.model.$element.data("events").selected);

            if (SecurityTypes.SINGLE_USER == secType) {
                strictEqual(view.model.get("securityTypeParamVal"), null, 'No value set for single user there is no default');
            } else {
                strictEqual(view.model.get("securityTypeParamVal").length, 1, 'Expecting only the first value');
                var securityTypeParamVal = view.model.get("securityTypeParamVal")[0];
                if (SecurityTypes.APPLICATION_ROLE == secType) {
                    strictEqual(securityTypeParamVal, "", 'Expected empty string representing Any logged in user');
                } else if (SecurityTypes.GROUP == secType) {
                    strictEqual(securityTypeParamVal, "", 'Expected empty string representing Anyone');
                } else {
                    strictEqual(securityTypeParamVal, "val1", 'Expecting the first value');
                }
            }

        });

    });
});
