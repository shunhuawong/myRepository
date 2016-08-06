AJS.test.require(["jira.webresources:application-roles-init"], function () {
    var contextPath = AJS.contextPath();
    require(["underscore", "backbone", "jquery"], function (_, Backbone, $) {

        var Bus = function () {
            return _.extend({}, Backbone.Events);
        };

        var format = function () {
            return _.toArray(arguments).join(",");
        };

        var GroupDescriptor = function (options) {
            this.options = options;
            this.items = [];
        };

        _.extend(GroupDescriptor.prototype, {
            addItem: function (item) {
                this.items.push(item);
            },
            assertDescriptor: function (total, groups) {
                equal(this.options.weight, 0, "Correct Weight");
                equal(this.items.length, groups.length, "There should be " + groups.length + "items.");
                for (var i = 0; i < this.items.length; i++) {
                    this.items[i].assertDescriptor(groups[i]);
                }
                if (total === groups.length) {
                    ok(_.isUndefined(this.options.label), "No label specified");
                }
                else {
                    var expected = format("application.access.configuration.groups.partial", groups.length, total);
                    equal(this.options.label, expected, "Label indicating partial results.");
                }
            }
        });

        var ItemDescriptor = function (options) {
            this.options = options;
        };

        _.extend(ItemDescriptor.prototype, {
            assertDescriptor: function (group) {
                equal(this.options.value, group, "Value should be " + group);
                equal(this.options.value, group, "Label should be " + group);
                equal(this.options.html, group, "Label should be " + group);
                equal(this.options.highlighted, true, "Item should be highlighted.");
            }
        });

        var SingleSelect = function (options) {
            this.options = options;
        };

        _.extend(SingleSelect.prototype, {
            clear: sinon.mock()
        });

        var SelectorPageObject = function () {
            this.element = $("#qunit-fixture");
        };

        _.extend(SelectorPageObject.prototype, {
            select: function () {
                return this.element.find("select.ss-group-picker");
            },
            val: function (group) {
                var sel = this.select();
                if (sel.find("option[value='" + group + "']").length === 0) {
                    $("<option>").attr("value", group).text(group).appendTo(sel).prop("selected", true);
                }
                sel.trigger("selected");
            },
            loadingVisible: function () {
                return this.element.find(".loading.icon").length > 0;
            }
        });

        var generateRestData = function (total, groups) {
            return {
                total: total,
                groups: _.map(groups, function (group) {
                    return {name: group, html: group};
                })
            };
        };

        var assertDescriptor = function (data, total, groups) {
            equal(data.length, 1, "There is only one element.");
            ok(data[0] instanceof GroupDescriptor, "The element is a GroupDescriptor");
            data[0].assertDescriptor(total, groups);
        };

        module('Group Selector Tests', {
            setup: function () {
                this.context = AJS.test.mockableModuleContext();
                this.context.mock('jira/ajs/select/single-select', SingleSelect);
                this.context.mock('jira/ajs/list/group-descriptor', GroupDescriptor);
                this.context.mock('jira/ajs/list/item-descriptor', ItemDescriptor);

                this.parser = new SelectorPageObject();
                this.region = new Backbone.Marionette.Region({
                    el: "#qunit-fixture"
                });

                this.format = AJS.format;
                AJS.format = format;
            },
            teardown: function () {
                AJS.format = this.format;
            }
        });

        test("Constructs single select correctly", function () {
            var Picker = this.context.require("jira/admin/application/grouppicker");
            var picker = new Picker({});
            this.region.show(picker);

            var select = picker.select;
            var options = select.options;

            equal(options.itemAttrDisplayed, "label", "Displaying the label.");
            equal(options.showDropdownButton, true, "Showing the dropdown.");
            ok(options.element.index(this.parser.select()) >= 0, "Element is the select list.");

            var ajax = options.ajaxOptions;

            deepEqual(ajax.data("query"), {query: "query"}, "Generate correct AJAX GET parameters.");
            equal(ajax.url, contextPath + "/rest/api/2/groups/picker", "Calls the right REST resource.");
            equal(ajax.query, true, "Queries the server on each keystroke.");
        });

        var testFormatResponse = function (callback) {
            var Picker = this.context.require("jira/admin/application/grouppicker");
            var picker = new Picker();
            this.region.show(picker);

            var formatResponse = picker.select.options.ajaxOptions.formatResponse;
            callback.call(this, formatResponse, picker);
        };

        test("formatResponse parses AJAX full response correctly", function () {
            testFormatResponse.call(this, function (formatResponse) {
                var data = formatResponse(generateRestData(2, ["jira-users", "jira-developers"]));
                assertDescriptor(data, 2, ["jira-users", "jira-developers"]);
            });
        });

        test("formatResponse parses partial AJAX response correctly", function () {
            testFormatResponse.call(this, function (formatResponse) {
                var data = formatResponse(generateRestData(5, ["jira-users", "jira-developers"]));
                assertDescriptor(data, 5, ["jira-users", "jira-developers"]);
            });
        });

        test("formatResponse excludes groups", function () {
            testFormatResponse.call(this, function (formatResponse, picker) {
                picker.excludeGroups("jira-users");
                var data = formatResponse(generateRestData(2, ["jira-users", "jira-developers"]));
                assertDescriptor(data, 1, ["jira-developers"]);
            });
        });

        test("formatResponse includes groups", function () {
            testFormatResponse.call(this, function (formatResponse, picker) {
                picker.excludeGroups("jira-users");
                picker.includeGroups("jira-users", "jira-administrators");

                var data = formatResponse(generateRestData(2, ["jira-users", "jira-developers"]));
                assertDescriptor(data, 2, ["jira-users", "jira-developers"]);
            });
        });

        test("formatResponse excludes groups partial", function () {
            testFormatResponse.call(this, function (formatResponse, picker) {
                picker.excludeGroups("jira-users");

                var data = formatResponse(generateRestData(5, ["jira-users", "jira-developers"]));
                assertDescriptor(data, 4, ["jira-developers"]);
            });
        });

        test("Updating single select triggers selectGroup event on bus", function () {
            var Picker = this.context.require("jira/admin/application/grouppicker");
            var bus = new Bus();
            var picker = new Picker({
                bus: bus
            });
            this.region.show(picker);

            var spy = this.spy();
            bus.on("selectGroup", spy);

            this.parser.val("jira-users");

            ok(spy.calledWith("jira-users"), "'selectGroup' Event triggered with right group.");
            ok(picker.select.clear.calledOnce, "Group selection cleared after event.");
        });

        asyncTest("test loading indicator shows and hides", function (assert) {
            var Picker = this.context.require("jira/admin/application/grouppicker");
            var picker = new Picker();
            this.region.show(picker);

            var test = this;

            //The show is delayed by 100ms so we must wait for it.
            picker.showLoading();
            window.setTimeout(function () {
                assert.ok(test.parser.loadingVisible(), "Loading indicator should be visible after 100ms.");
                picker.hideLoading();
                assert.ok(!test.parser.loadingVisible(), "Loading indicator should be hidden.");

                //Restart the tests.
                start();
            }, 150);
        });
    });

    require(["underscore", "backbone", "jquery"], function (_, Backbone, $) {
        var GroupSelector = Backbone.Marionette.ItemView.extend({
            initialize: function () {
                this.exclude = [];
                this.loading = 0;
            },
            excludeGroups: function () {
                this.exclude = _.union(this.exclude, _.toArray(arguments));
            },
            includeGroups: function () {
                this.exclude = _.difference(this.exclude, _.toArray(arguments));
            },
            template: function (data) {
                return $("<input>").data("view", data.view);
            },
            ui: {
                input: "input"
            },
            events: {
                "newGroup input": "_toAdd"
            },
            _toAdd: function () {
                this.options.bus.trigger("selectGroup", this.ui.input.val());
            },
            serializeData: function () {
                return {
                    view: this
                };
            },
            showLoading: function () {
                this.loading++;
                return this;
            },
            hideLoading: function () {
                this.loading--;
                return this;
            },
            isLoading: function () {
                return this.loading > 0;
            }
        });

        var EditorPageObject = function () {
            this.element = $("#qunit-fixture");
        };

        _.extend(EditorPageObject.prototype, {
            name: function () {
                return this.element.find("h3").text();
            },
            /** Gets an array of group names */
            groups: function () {
                var page = this;
                return this.element.find("span.application-role-name-group-name").map(function () {
                    return page._toName($(this));
                }).get();
            },
            /** Gets an array of group objects, containing group name and userCount */
            groupsDetail: function () {
                var page = this;
                return this.element.find("span.application-role-name-group-name").map(function () {
                    return {
                        name: page._toName($(this)),
                        userCount: page._toUserCount($(this))
                    };
                }).get();
            },
            /** Gets an object containing group name and userCount for this group */
            getGroupDetail: function(groupName) {
                return _.findWhere(this.groupsDetail(), { name: groupName });
            },
            getDefaults: function () {
                var page = this;
                return this.element.find(".application-role-default input:checked").map(function () {
                    return page._toName($(this));
                }).get();
            },
            isDefaultApplication: function () {
                return this.element.find(".default-app-lozenge").text() === "common.words.default";
            },
            groupsWithEditableDefault: function () {
                var page = this;
                return this.element.find(".application-role-default input:enabled").map(function () {
                    return page._toName($(this));
                }).get();
            },
            groupDefaultWarningPopupVisible: function (group) {
                var groupDefaultWarningPopupId = "#group-reuse-roleid-" + group.cid + "-default-warning";
                var el = $(groupDefaultWarningPopupId);
                if (!el.length) {
                    throw "Could not find default warning popup";
                }
                return el.attr('aria-hidden') === 'false';
            },
            groupAddWarningPopupVisible: function (group) {
                var groupWarningPopupId = "#group-reuse-roleid-" + group.cid + "-add-warning";
                var el = $(groupWarningPopupId);
                if (!el.length) {
                    throw "Could not find group warning popup";
                }
                return el.attr('aria-hidden') === 'false';
            },
            deleteable: function () {
                var page = this;
                return this.element.find("a.application-role-remove").map(function () {
                    return page._toName($(this));
                }).get();
            },
            addGroup: function (group) {
                var addGroupElement = this.element.find('.application-role-selector-container input');
                addGroupElement.val(group).trigger('newGroup');
                return this;
            },
            removeGroup: function (group) {
                var del = this._toRow(group).find("a.application-role-remove");
                if (!del.length) {
                    throw "Not allowed to delete group '" + group + "'.";
                }
                else {
                    del.click();
                }
                return this;
            },
            setDefault: function (group) {
                var el = this._getDefaultCheckbox(group);
                if (el.is(":checked")) {
                    throw "Group '" + group + "' is already default.";
                }
                el.click();
                return this;
            },
            unsetDefault: function (group) {
                var el = this._getDefaultCheckbox(group);
                if (!el.is(":checked")) {
                    throw "Group '" + group + "' is not currently a default.";
                }
                el.change();
                el.click();
                return this;
            },
            _toRow: function (group) {
                var page = this;
                var element = this.element.find(".application-role-name-group-name").filter(function () {
                    return page._toName($(this)) === group;
                });

                if (!element.length) {
                    throw "Unable to find group '" + group + "'.";
                }
                else {
                    return element.closest("tr");
                }
            },
            _toName: function (el) {
                if (el.hasClass(".application-role-name-group-name")) {
                    return el.text();
                }
                else {
                    var name = el.closest("tr").find(".application-role-name-group-name");
                    if (name.length) {
                        return name.text();
                    }
                    else {
                        return null;
                    }
                }
            },
            _toUserCount: function (el) {
                var sizeEl = el.closest("tr").find(".application-role-name-group-size");
                if (sizeEl.length) {
                    return parseInt(sizeEl.attr('data-value'));
                }
                else {
                    return null;
                }
            },
            emptyMessageShowing: function () {
                return !!this.element.find(".application-role-empty").length;
            },
            noDefaultGroupWarningShowing: function () {
                return this.element.find(".application-role-without-default-group").length > 0;
            },
            getExcludedGroups: function () {
                return this._getGroupSelector().exclude;
            },
            isLoading: function () {
                return this._getGroupSelector().isLoading();
            },
            _getGroupSelector: function () {
                var addGroupElement = this.element.find('.application-role-selector-container input');
                return addGroupElement.data("view");
            },
            _getDefaultCheckbox: function (group) {
                var el = this._toRow(group).find(".application-role-default input");
                if (!el.length) {
                    throw "Unable to find default checkbox for group '" + group + "'.";
                }
                return el;
            },
            defined: function () {
                return this.element.find("#application-licensed-not-installed").length === 0;
            }
        });

        /**
         * a stub for RolesIO.
         * @constructor
         */
        var RolesIOStub = function () {};
        _.extend(RolesIOStub.prototype, {
            /** By default, return size 1 for any group request */
            getGroupDetails: function(groupName) {
                return $.Deferred().resolve( {
                    name: groupName,
                    users: { size : 1}
                });
            }
        });

        module('Role Editor Tests', {
            setup: function () {
                this.context = AJS.test.context();
                this.context.mock('jira/admin/application/grouppicker', GroupSelector);
                this.context.mock('aui/inline-dialog2', {});
                this.context.mock('jira/admin/application/application-role-labels', {});

                this.parser = new EditorPageObject();
                this.region = new Backbone.Marionette.Region({
                    el: "#qunit-fixture"
                });
            }
        });

        test("Renders correct view with no defaults", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"]},
                IO: new RolesIOStub()
            });

            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "Should be able to delete all groups.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to set the default of all groups.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the current groups.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered");
        });

        test("Renders correct view with application marked as default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one"],
                    selectedByDefault: true
                },
                IO: new RolesIOStub()
            });

            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            ok(this.parser.isDefaultApplication(), "Rendered application is marked as default");
        });


        test("Renders correct view with one default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"], defaultGroups: ["two"]},
                IO: new RolesIOStub()
            });

            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.deleteable(), ["one", "three"], "Able to delete non default groups.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the current groups.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "three"], "Should be able to set the default of non-default groups.");
            deepEqual(this.parser.getDefaults(), ["two"], "Default correctly rendered.");
        });

        test("Renders correct view with multiple defaults", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"], defaultGroups: ["two", "three"]},
                IO: new RolesIOStub()
            });

            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "Able to delete non-default groups.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the current groups.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to edit all groups.");
            deepEqual(this.parser.getDefaults(), ["two", "three"], "Default correctly rendered.");
        });

        test("Renders correct view with only one default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one"], defaultGroups: ["one"]},
                IO: new RolesIOStub()
            });

            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one"], "The groups are rendered correctly.");
            deepEqual(this.parser.deleteable(), [], "Nothing is deletable.");
            deepEqual(this.parser.getExcludedGroups(), ["one"], "Not able to select the current groups.");
            deepEqual(this.parser.groupsWithEditableDefault(), [], "No groups should be editable.");
            deepEqual(this.parser.getDefaults(), ["one"], "Default correctly rendered.");
        });

        test("Add group correctly adds group to the UI with one non-default group", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one"], "Not able to select the current groups.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered");
            deepEqual(this.parser.deleteable(), [], "Should not be able to delete last group.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one"], "The group should be editable to allow default to be set.");

            this.parser.addGroup("three");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "three"], "New group correctly rendered.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "three"], "Not able to select the new groups.");
            deepEqual(this.parser.getDefaults(), [], "Still no defaults unless the user explicitly sets it.");
            deepEqual(this.parser.deleteable(), ["one", "three"], "Both groups should be deletable.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "three"], "Should be able to edit both groups.");
            ok(setRole.calledWith(["one", "three"], []), "Change persisted to the server.");
        });

        test("Add group correctly adds group to the UI with multiple non-default groups", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Not able to select the current groups.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered");
            deepEqual(this.parser.deleteable(), ["one", "two"], "Can delete groups as there are multiple.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two"], "Should be able to edit both groups.");

            this.parser.addGroup("three");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "New group correctly rendered.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the new groups.");
            deepEqual(this.parser.getDefaults(), [], "Still no defaults unless the user explicitly sets it.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "All groups should be deletable.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to edit all groups.");
            ok(setRole.calledWith(["one", "two", "three"], []), "Change persisted to the server.");
        });

        test("Add group correctly adds group to the UI with one default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"], defaultGroups: ["two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one"], "Able to delete non default groups.");
            deepEqual(this.parser.getDefaults(), ["two"], "Default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one"], "Should be able to edit non-default.");

            this.parser.addGroup("three");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "New group correctly rendered.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the new groups.");
            deepEqual(this.parser.deleteable(), ["one", "three"], "New group should be deletable.");
            deepEqual(this.parser.getDefaults(), ["two"], "Default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "three"], "Should be able to edit non-defaults.");
            ok(setRole.calledWith(["one", "two", "three"], ["two"]), "Change persisted to the server.");
        });

        test("Add group correctly adds group to the UI with multiple defaults", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"], defaultGroups: ["one", "two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one", "two"], "Able to delete groups as there are multiple.");
            deepEqual(this.parser.getDefaults(), ["one", "two"], "Default rendereds.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two"], "Should be able to edit defaults as there are many.");

            this.parser.addGroup("three");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "New group correctly rendered.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select the new groups.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "All groups should be deletable.");
            deepEqual(this.parser.getDefaults(), ["one", "two"], "Default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to edit all groups.");
            ok(setRole.calledWith(["one", "two", "three"], ["one", "two"]), "Change persisted to the server.");
        });

        test("Can remove non-default group when there are other groups present", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"], defaultGroups: ["two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one"], "Able to delete non default groups.");
            deepEqual(this.parser.getDefaults(), ["two"], "Default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one"], "Should be able to non-default group.");

            this.parser.removeGroup("one");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["two"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["two"], "Now able to select deleted groups.");
            deepEqual(this.parser.deleteable(), [], "No groups deletable.");
            deepEqual(this.parser.getDefaults(), ["two"], "Default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), [], "Should not be able to edit any groups.");
            ok(setRole.calledWith(["two"], ["two"]), "Change persisted to the server.");
        });

        test("Remove group correctly removes group without default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "Able to delete all groups.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to edit all groups.");

            this.parser.removeGroup("one");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["two", "three"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["two", "three"], "Not able to select remaining groups.");
            deepEqual(this.parser.deleteable(), ["two", "three"], "Remaining groups deletable.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["two", "three"], "Should be able to edit all groups.");
            ok(setRole.calledWith(["two", "three"], []), "Change persisted to the server.");

            this.parser.removeGroup("two");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["three"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["three"], "Not able to select remaining groups.");
            deepEqual(this.parser.deleteable(), [], "Last group cannot be removed");
            deepEqual(this.parser.getDefaults(), [], "No default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["three"], "Should be able to edit all groups.");
            ok(setRole.calledWith(["three"], []), "Change persisted to the server.");
        });

        test("Remove default group provided there are other defaults present", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one", "two", "three"],
                    defaultGroups: ["one", "two", "three"]
                },
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "Able to delete all groups.");
            deepEqual(this.parser.getDefaults(), ["one", "two", "three"], "All of them are default.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Should be able to edit all groups.");

            this.parser.removeGroup("one");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["two", "three"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["two", "three"], "Not able to select remaining groups.");
            deepEqual(this.parser.deleteable(), ["two", "three"], "Remaining groups deletable.");
            deepEqual(this.parser.getDefaults(), ["two", "three"], "All of them are default.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["two", "three"], "Should be able to edit all groups.");
            ok(setRole.calledWith(["two", "three"], ["two", "three"]), "Change persisted to the server.");
        });

        test("Can't remove last default group", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one", "two", "three"],
                    defaultGroups: ["one", "two", "three"]
                },
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            this.parser.removeGroup("one");
            this.parser.removeGroup("two");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["three"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["three"], "Not able to select remaining groups.");
            deepEqual(this.parser.deleteable(), [], "Last group cannot be removed");
            deepEqual(this.parser.getDefaults(), ["three"], "All of them are default.");
            deepEqual(this.parser.groupsWithEditableDefault(), [], "Cannot unset last default.");
            ok(setRole.calledWith(["three"], ["three"]), "Change persisted to the server.");
        });

        test("Can't remove last non-default group", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            this.parser.removeGroup("one");
            this.parser.removeGroup("two");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["three"], "Group removed from UI.");
            deepEqual(this.parser.getExcludedGroups(), ["three"], "Not able to select remaining groups.");
            deepEqual(this.parser.deleteable(), [], "Last group cannot be removed");
            deepEqual(this.parser.getDefaults(), [], "No default groups rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["three"], "Any group can be made default.");
            ok(setRole.calledWith(["three"], []), "Change persisted to the server.");
        });

        test("Set default group correctly sets default when no current default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one", "two", "three"], "Able to delete all groups.");
            deepEqual(this.parser.getDefaults(), [], "No default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "Any group can be made default.");

            this.parser.setDefault("one");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two", "three"], "Groups remain same after operation.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two", "three"], "Still not able to select groups in role.");
            deepEqual(this.parser.deleteable(), ["two", "three"], "Only non-default groups deletable.");
            deepEqual(this.parser.getDefaults(), ["one"], "Default has been rendered");
            deepEqual(this.parser.groupsWithEditableDefault(), ["two", "three"], "The only default cannot be unset.");
            ok(setRole.calledWith(["one", "two", "three"], ["one"]), "Change persisted to the server.");
        });

        test("Defined applications will not render warning", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"], defined: true},
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            ok(this.parser.defined(), "Warning should not rendered because application is defined.");
        });

        test("Undefined applications will render warning", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"], defined: false},
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            ok(!this.parser.defined(), "Warning should render because application is undefined.");
        });

        test("Applications without default group will render warning.", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two", "three"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            ok(this.parser.noDefaultGroupWarningShowing(), "Warning should show because no default group is set");
            this.parser.setDefault("one");
            ok(!this.parser.noDefaultGroupWarningShowing(), "Warning shouldn't show because one group is set as a default");
            this.parser.setDefault("two");
            ok(!this.parser.noDefaultGroupWarningShowing(), "Warning shouldn't show because two groups are set as a default");
        });

        test("Set default group correctly sets default when there is a current default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"], defaultGroups: ["two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Not able to select initial groups.");
            deepEqual(this.parser.deleteable(), ["one"], "Able to delete non-default groups.");
            deepEqual(this.parser.getDefaults(), ["two"], "Initial default rendered.");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one"], "The only default cannot be unset.");

            this.parser.setDefault("one");

            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two"], "All groups should be editable.");

            this.parser.unsetDefault("two");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "Groups remain same after operation.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Still not able to select groups in role.");
            deepEqual(this.parser.deleteable(), ["two"], "Only non-default groups deletable.");
            deepEqual(this.parser.getDefaults(), ["one"], "Default has been rendered");
            deepEqual(this.parser.groupsWithEditableDefault(), ["two"], "The only default cannot be unset.");
            ok(setRole.calledWith(["one", "two"], ["one"]), "Change persisted to the server.");
        });

        test("Able to set multiple defaults", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one", "two"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            this.parser.setDefault("one");
            this.parser.setDefault("two");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["one", "two"], "Groups remain same after operation.");
            deepEqual(this.parser.getExcludedGroups(), ["one", "two"], "Still not able to select groups in role.");
            deepEqual(this.parser.deleteable(), ["one", "two"], "All groups are deletable.");
            deepEqual(this.parser.getDefaults(), ["one", "two"], "Default has been rendered");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two"], "All defaults can be unset because there are multiple.");
            ok(setRole.calledWith(["one", "two"], ["one", "two"]), "Change persisted to the server.");
        });

        test("Can toggle the default on all but the last default", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one", "two", "three"],
                    defaultGroups: ["one", "two", "three"]
                },
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "All defaults can be unset because there are multiple.");

            this.parser.unsetDefault("one");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two", "three"], "All groups can be edited.");

            this.parser.unsetDefault("two");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one", "two"], "Last default cannot be edited.");

            ok(setRole.calledWith(["one", "two", "three"], ["three"]), "Change persisted to the server.");
        });

        test("Can toggle default when single non-default group available", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: ["one"]},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            deepEqual(this.parser.groups(), ["one"], "Groups remain same after operation.");
            deepEqual(this.parser.getExcludedGroups(), ["one"], "Still not able to select groups in role.");
            deepEqual(this.parser.deleteable(), [], "Last group cannot be removed.");
            deepEqual(this.parser.getDefaults(), [], "No defaults rendered");
            deepEqual(this.parser.groupsWithEditableDefault(), ["one"], "Non-default group can be made default");

            this.parser.setDefault("one");
            deepEqual(this.parser.groups(), ["one"], "Groups remain same after operation.");
            deepEqual(this.parser.getExcludedGroups(), ["one"], "Still not able to select groups in role.");
            deepEqual(this.parser.deleteable(), [], "Last group cannot be removed.");
            deepEqual(this.parser.getDefaults(), ["one"], "No defaults rendered");
            deepEqual(this.parser.groupsWithEditableDefault(), [], "Cannot unset the only default.");
            ok(setRole.calledWith(["one"], ["one"]), "Change persisted to the server.");
        });

        test("No groups renders empty view and allows creation of new rows.", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: []},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), [], "The groups are rendered correctly.");
            deepEqual(this.parser.getExcludedGroups(), [], "Able to select all groups.");
            ok(this.parser.emptyMessageShowing(), "Empty message should be showing.");

            this.parser.addGroup("first");

            equal(this.parser.name(), "RoleId", "The Role name is rendered correctly.");
            deepEqual(this.parser.groups(), ["first"], "First group added to UI.");
            deepEqual(this.parser.getExcludedGroups(), ["first"], "Not able to select initial group.");
            deepEqual(this.parser.deleteable(), [], "First group is default and cannot be deleted.");
            deepEqual(this.parser.getDefaults(), [], "First is not default until user explicitly decides.");
            ok(setRole.calledWith(["first"], []), "Change persisted to the server.");
        });

        test("HIROL-983 Selecting group as default which is used in different apps should display warning popup", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one", "two", "three"],
                    defaultGroups: ["one"],
                    defaultGroupsExistingInAnyOtherRoles: {
                        "other-role": ["two"]
                    },
                    appsReusingGroup : ["Another app"]
                },
                setRole: function() { return def.promise(); },
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);
            this.parser.setDefault("two");
            def.resolve({ remainingSeats: 20, numberOfSeats: 30, userCount: 10, hasUnlimitedSeats: false});
            ok(!this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[0]), "Default warning popup for group one is not visible.");
            ok(this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[1]), "Default warning popup for group two should be shown.");
            ok(!this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[2]), "Default warning popup for group three is not visible.");
        });

        test("HIROL-983 Selecting group as default which is not used in different apps should not display warning popup", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one", "two", "three"],
                    defaultGroups: ["one"],
                    defaultGroupsExistingInAnyOtherRoles: {
                        "other-role": ["one"]
                    }
                },
                setRole: function() { return def.promise(); },
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);
            this.parser.setDefault("three");
            def.resolve({ remainingSeats: 20, numberOfSeats: 30, userCount: 10, hasUnlimitedSeats: false});
            ok(!this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[0]), "Default warning popup for group one should not be shown.");
            ok(!this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[1]), "Default warning popup for group two should not be shown.");
            ok(!this.parser.groupDefaultWarningPopupVisible(roleEditor._groups.models[2]), "Default warning popup for group three should not be shown");
        });

        test("HIROL-983 Adding group which is default in different apps should display warning popup", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one"],
                    defaultGroups: ["one"],
                    defaultGroupsExistingInAnyOtherRoles: {
                        "other-role": ["two"]
                    },
                    appsAndDefaultRoles: {
                        "other-role": ["two"]
                    }
                },
                setRole: function() { return def.promise(); },
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);
            this.parser.addGroup("two");
            def.resolve({ remainingSeats: 20, numberOfSeats: 30, userCount: 10, hasUnlimitedSeats: false});
            ok(!this.parser.groupAddWarningPopupVisible(roleEditor._groups.models[0]), "Group warning popup for group one should not be visible.");
            ok(this.parser.groupAddWarningPopupVisible(roleEditor._groups.models[1]), "Group warning popup for group two should be visible.");
        });

        test("HIROL-983 Adding group which is not default in other apps should not display warning popup", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var roleEditor = new RoleEditor({
                data: {
                    key: "roleid",
                    name: "RoleId",
                    groups: ["one"],
                    defaultGroups: ["one"],
                    defaultGroupsExistingInAnyOtherRoles: {
                        "other-role": ["two"]
                    }
                },
                setRole: function() { return def.promise(); },
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);
            this.parser.addGroup("two");
            def.resolve({ remainingSeats: 20, numberOfSeats: 30, userCount: 10, hasUnlimitedSeats: false});
            ok(!this.parser.groupAddWarningPopupVisible(roleEditor._groups.models[0]), "Group warning popup for group one should not be visible.");
            ok(!this.parser.groupAddWarningPopupVisible(roleEditor._groups.models[1]), "Group warning popup for group two should not be visible.");
        });

        test("Loading indicator shows when loading.", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: {key: "roleid", name: "RoleId", groups: []},
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            //Add a group.
            this.parser.addGroup("first");
            ok(this.parser.isLoading(), "Loading while PUT out.");
            def.resolve([]);
            ok(!this.parser.isLoading(), "Not loading after PUT finished.");
        });

        test("Group user counts are displayed on initial load", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: { key: "roleid", name: "RoleId", groups: [ "a" ] },
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            var group = this.parser.getGroupDetail("a");
            equal(group.userCount, 1, "The group's user count is rendered correctly");
        });

        test("Group user counts are gracefully not rendered if group detail is not retrieved", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);

            // Simulate an invalid response from the server when retrieving group details
            var rolesIOStub = new RolesIOStub();
            var getGroupDetails = sinon.stub(rolesIOStub, "getGroupDetails");
            getGroupDetails.withArgs("a").returns($.Deferred().reject());

            var roleEditor = new RoleEditor({
                data: { key: "roleid", name: "RoleId", groups: [ "a" ] },
                setRole: setRole,
                IO: rolesIOStub
            });

            this.region.show(roleEditor.view);

            var group = this.parser.getGroupDetail("a");
            equal(group.userCount, null, "The group's user count is hidden");
            equal(group.name, "a", "The group's name is still shown");

        });

        test("Group user counts are displayed for added group", function () {
            var RoleEditor = this.context.require("jira/admin/application/approleeditor");
            var def = $.Deferred();
            var setRole = this.stub().returns(def);
            var roleEditor = new RoleEditor({
                data: { key: "roleid", name: "RoleId", groups: [] },
                setRole: setRole,
                IO: new RolesIOStub()
            });
            this.region.show(roleEditor.view);

            this.parser.addGroup("three");

            var group = this.parser.getGroupDetail("three");
            equal(group.userCount, 1, "The added group's user count is rendered correctly");
        });
    });

    require(["underscore", "backbone", "jquery"], function (_, Backbone, $) {

        var ErrorDialog = function (options) {
            this.shown = false;
            this.options = options;

            ErrorDialog.last = this;

        };

        _.extend(ErrorDialog.prototype, {
            show: function () {
                this.shown = true;
            },
            isShown: function () {
                return this.shown;
            },
            getOptions: function () {
                return this.options;
            },
            getXhr: function () {
                return this.options.xhr;
            }
        });

        ErrorDialog.openErrorDialogForXHR = function (xhr) {
            return new ErrorDialog({
                xhr: xhr
            });
        };

        var format = function () {
            return _.toArray(arguments).join(",");
        };

        var View = Backbone.Marionette.ItemView.extend({
            template: function (data) {
                return $("<div>")
                    .text(JSON.stringify(data.view.model.toJSON()))
                    .addClass("role-editor-test")
                    .data("view", data.view);
            },
            serializeData: function () {
                return {
                    view: this
                };
            },
            setGroups: function (groups, defaults) {
                return this.options.setRole(groups, defaults);
            }
        });

        var mockAjax = function () {
            var mock = function (options, dialog) {
                var def = $.Deferred();
                def.options = options;
                def.dialog = dialog;

                mock.calls.push(def);
                mock.callCount++;
                mock.lastCall = def;

                return def.promise();
            };

            mock.reset = function () {
                mock.calls = [];
                mock.callCount = 0;
                delete mock.lastCall;

                return this;
            };

            return mock.reset();
        };

        var ApplicationRoleEditor = function (options) {
            this.view = new View({
                model: new Backbone.Model(options.data),
                setRole: options.setRole
            });
        };

        var EditorPageObject = function () {
            this.element = $("#qunit-fixture");
        };

        _.extend(EditorPageObject.prototype, {
            isNoRoleMessageVisible: function () {
                return !!this.element.find("#application-role-none").length;
            },
            loadingVisible: function () {
                return !!this.element.find("#application-role-initial-load").length;
            },
            roles: function () {
                return this.element.find("div.role-editor-test").map(function () {
                    return JSON.parse($(this).text());
                }).get();
            },
            views: function () {
                return this.element.find("div.role-editor-test").map(function () {
                    return $(this).data("view");
                }).get();
            }
        });

        var parseActualPutOptions = function (options) {
            options.data = JSON.parse(options.data);
            return options;
        };

        var expectedPutOptions = function (roleId, groups, defaults, selectedByDefault, versionHash) {
            return {
                url: contextPath + "/rest/api/2/applicationrole/" + roleId,
                dataType: "json",
                headers: {"If-Match": versionHash.toString()},
                type: "PUT",
                contentType: "application/json",
                data: {
                    groups: groups,
                    defaultGroups: defaults,
                    selectedByDefault: selectedByDefault
                }
            };
        };

        var assertPut = function (roleId, groups, defaults, selectedByDefault, versionHash) {
            deepEqual(parseActualPutOptions(this.ajax.lastCall.options),
                expectedPutOptions(roleId, groups, defaults, selectedByDefault, versionHash), "Put for role called with correct arguments.");
        };

        var assertGeneralErrorDisplayed = function () {
            ok(ErrorDialog.last, "Error displayed.");
            deepEqual(ErrorDialog.last.options, {
                message: "application.access.configuration.out.of.date",
                mode: "warning"
            }, "Error dialog created with correct options.");
            ok(ErrorDialog.last.isShown(), "Error dialog should be shown.");
        };

        var assertXhrErrorDisplayed = function (rejected) {
            ok(ErrorDialog.last, "Error displayed.");
            deepEqual(ErrorDialog.last.getXhr(), rejected, "Error dialog should be passed rejected data.");
        };

        var assertNoErrorDisplayed = function () {
            ok(!ErrorDialog.last, "No error should have been displayed.");
        };

        var assertDone = function (def, args) {
            equal(def.state(), "resolved", "Deferred resolved?");

            var spy = this.spy();
            def.done(spy);

            ok(spy.called, "Done called.");
            deepEqual(spy.firstCall.args, args, "Callback triggered with correct arguments.");
        };

        var assertFail = function (def, args) {
            equal(def.state(), "rejected", "Deferred rejected?");

            var spy = this.spy();
            def.fail(spy);

            ok(spy.called, "Fail called.");
            deepEqual(spy.firstCall.args, args, "Callback triggered with correct arguments.");
        };

        var assertAbort = function (def) {
            assertFail.call(this, def, [null, "abort"]);
        };

        var assertPending = function (def) {
            equal(def.state(), "pending", "Deferred pending?");
        };

        var createEditor = function (mockedRoles) {
            var roles = mockedRoles || [
                    {key: 'a', name: 'a', groups: ["a", "z"], defaultGroups: []},
                    {key: 'b', name: 'b', groups: ["c", "a"], defaultGroups: ["a"]}
                ];
            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            var editor = new RolesEditor({
                el: this.element
            });

            this.ajax.calls[0].resolve(roles, [], resolveAjaxCall);
            this.ajax.reset();

            return editor;
        };

        module('Roles Editor Tests', {
            setup: function () {
                ErrorDialog.last = null;

                this.context = AJS.test.context();
                this.ajax = mockAjax();

                this.context.mock('jira/ajs/ajax/smart-ajax/web-sudo', {
                    makeWebSudoRequest: this.ajax
                });
                this.context.mock("jira/dialog/error-dialog", ErrorDialog);
                this.context.mock('jira/admin/application/approleeditor', ApplicationRoleEditor);
                this.context.mock('jira/admin/application/application-role-labels', {});

                this.parser = new EditorPageObject();
                this.element = $("#qunit-fixture");

                this.ounload = window.onbeforeunload;
                window.onbeforeunload = null;

                this.oformat = AJS.format;
                AJS.format = format;

                this.assertFail = assertFail;
                this.assertAbort = assertAbort;
                this.assertDone = assertDone;
                this.assertGeneralErrorDisplayed = assertGeneralErrorDisplayed;
                this.assertXhrErrorDisplayed = assertXhrErrorDisplayed;
                this.assertNoErrorDisplayed = assertNoErrorDisplayed;
                this.createEditor = createEditor;
                this.assertPut = assertPut;
                this.assertPending = assertPending;


            },
            teardown: function () {
                AJS.format = this.oformat;
                window.onbeforeunload = this.ounload;
            }
        });

        var resolveAjaxCall = {
            getResponseHeader: function(key) {
                return "0";
            }
        };

        test("Empty message shown when no roles installed", function () {

            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                el: this.element
            });

            this.ajax.calls[0].resolve([], [], resolveAjaxCall);

            ok(this.parser.isNoRoleMessageVisible(), "No role message is visible.");
        });

        test("Nothing happens when element no passed.", function () {

            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                ajax: this.ajax
            });

            ok(!this.ajax.called, "Don't trigger a render if nothing is going to display.");
        });

        test("Nothing happens when empty jQuery set passed.", function () {

            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                $el: $()
            });

            ok(!this.ajax.called, "Don't trigger a render if nothing is going to display.");
        });

        test("Loading indicator is only shown while loading.", function () {

            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                el: this.element
            });

            ok(this.parser.loadingVisible(), "Loading indicator is visible during load.");
            this.ajax.calls[0].resolve([], [], resolveAjaxCall);
            ok(!this.parser.loadingVisible(), "Loading indicator is hidden after load.");
        });

        test("RolesEditor sends application role request with correct AJAX options", function() {
            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                el: this.element
            });
            var expectedAjaxOptions = {
                url: contextPath + "/rest/api/2/applicationrole",
                dataType: "json"
            };

            deepEqual(this.ajax.calls[0].options, expectedAjaxOptions, "Get method called with correct AJAX options.");
        });

        test("HIROL-776 Default groups reused in different roles are evaluated properly", function () {
            this.createEditor([
                {key: 'a-key', name: 'a-name', groups: ["a", "z", "b"], defaultGroups: ["z", "b"]},
                {key: 'b-key', name: 'b-name', groups: ["b", "z"], defaultGroups: []},
                {key: 'c-key', name: 'c-name', groups: ["c", "z"], defaultGroups: []}
            ]);

            var expectedDefaultGroupsDefinedInOtherRoles = [
                {   //a-name
                    "b-name": ["z", "b"],
                    "c-name": ["z"]
                },
                {}, //b-name
                {}  //c-name
            ];
            deepEqual(_.pluck(this.parser.roles(), "defaultGroupsExistingInAnyOtherRoles"), expectedDefaultGroupsDefinedInOtherRoles, "Roles rendered on the page in correct order with correct parameters.");
        });

        test("Error dialog triggered when error occurs while trying to load roles.", function () {

            var error = {msg: "This is an error"};

            var RolesEditor = this.context.require("jira/admin/application/approleseditor");
            new RolesEditor({
                el: this.element
            });

            this.ajax.calls[0].reject(error);

            ok(this.parser.loadingVisible(), "Loading should remain visible after the error.");
            this.assertXhrErrorDisplayed(error);
        });

        test("Updating roles triggers AJAX call to server", function () {
            this.createEditor();

            var views = this.parser.views();
            views[0].setGroups(['k', 'i', 'l'], ['l']);

            this.assertPut("a", ["k", "i", "l"], ["l"], false, 0);

            this.ajax.lastCall.resolve({groups: []}, [], resolveAjaxCall);
            this.assertNoErrorDisplayed();
        });

        test("Error while updating roles triggers error dialog.", function () {
            this.createEditor();

            var error = "Error";
            var views = this.parser.views();
            views[0].setGroups(['k', 'i', 'l'], ['l']);

            this.ajax.lastCall.reject(error, [], resolveAjaxCall);
            this.assertXhrErrorDisplayed(error);
        });

        test("400 Error while updating roles triggers error dialog.", function () {
            this.createEditor();

            var xhr = {
                status: 400
            };

            var views = this.parser.views();
            views[0].setGroups(['k', 'i', 'l'], ['l']);

            this.ajax.lastCall.reject(xhr, "failed", resolveAjaxCall);
            this.assertGeneralErrorDisplayed();
        });

        test("Updating queues put requests on slow AJAX response.", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            //Trigger the first PUT. This one will start executing.
            view.setGroups(['a'], []);

            //Trigger the second PUT. This one will be ignored (eventually) because only one PUT is queued.
            view.setGroups(['b'], []);

            //Trigger the third PUT. This is the new one to be queued.
            view.setGroups(['c'], []);

            //First call will execute.
            equal(ajax.callCount, 1, "AJAX request batched.");
            this.assertPut("b", ["a"], [], false, 0);

            ajax.lastCall.resolve({groups: []}, [], resolveAjaxCall);

            //This should trigger the third call (i.e. the second call is skipped because it is too slow)
            equal(ajax.callCount, 3, "AJAX request un-batched.");

            this.assertPut("b", ["c"], [], false, 0);
            this.assertNoErrorDisplayed();
        });

        test("Updating queues put requests on slow AJAX response multiple roles.", function () {
            this.createEditor();

            var views = this.parser.views();
            var viewa = views[0];
            var viewb = views[1];
            var ajax = this.ajax;

            //Trigger the first PUT. This one will start executing.
            viewa.setGroups(['a'], []);

            //Trigger the second PUT.
            viewb.setGroups(['b'], []);

            //Trigger the third PUT. This is the new one to be queued.
            viewa.setGroups(['c'], []);

            //First call will execute.
            equal(ajax.callCount, 1, "AJAX request batched.");
            this.assertPut("a", ["a"], [], false, 0);

            //This should trigger the second call
            ajax.lastCall.resolve({groups: []});

            equal(ajax.callCount, 3, "AJAX request batched.");
            this.assertPut("b", ["b"], [], false, 0);

            ajax.lastCall.resolve({groups: []}, [], resolveAjaxCall);

            equal(ajax.callCount, 5, "AJAX request batched.");
            this.assertPut("a", ["c"], [], false, 0);

            this.assertNoErrorDisplayed();
        });

        test("First error aborts all current and subsequent requests.", function () {
            this.createEditor();

            var views = this.parser.views();
            var viewa = views[0];
            var viewb = views[1];
            var ajax = this.ajax;

            //Trigger the first PUT. This one will start executing.
            var result1 = viewa.setGroups(['a'], []);

            //Trigger the second PUT.
            var result2 = viewb.setGroups(['b'], []);

            //Trigger the third PUT. This is the new one to be queued.
            var result3 = viewa.setGroups(['c'], []);

            //First call will execute.
            equal(ajax.callCount, 1, "AJAX request batched.");
            this.assertPut("a", ["a"], [], false, 0);

            //This should trigger the second call
            ajax.lastCall.reject("Error");

            this.assertFail(result1, ["Error"]);
            this.assertAbort(result2);
            this.assertAbort(result3);

            //This should abort right now.
            var result4 = viewa.setGroups(['c'], [], false);
            this.assertAbort(result4);
        });

        test("Queued requests are reject with 'abort' code when not run.", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            //Trigger the first PUT. This one will start executing.
            var result1 = view.setGroups(['a'], []);
            this.assertPending(result1);

            //Trigger the second PUT. This one will be ignored (eventually) because only one PUT is queued.
            var result2 = view.setGroups(['b'], []);

            this.assertPending(result1);
            this.assertPending(result2);

            //Trigger the third PUT. This is the new one to be queued.
            var result3 = view.setGroups(['c'], []);

            this.assertPending(result1);
            this.assertPending(result3);
            this.assertAbort(result2);
            this.assertNoErrorDisplayed();

            //Allow the first call to finish
            this.ajax.calls[0].resolve([], [], resolveAjaxCall);
            this.ajax.calls[1].resolve([], [], resolveAjaxCall);
            this.assertDone(result1, [[]]);
            this.assertPending(result3);
            this.assertNoErrorDisplayed();

            // allow the third call to finish, (i.e. the second call is skipped because it is too slow)
            this.ajax.calls[2].resolve([], [], resolveAjaxCall);
            this.ajax.calls[3].resolve([], [], resolveAjaxCall);
            this.assertDone(result3, [[]]);
            this.assertNoErrorDisplayed();
        });

        test("Trying to leave page while updating gives warning to user until AJAX finishes with success", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            view.setGroups(['a'], []);
            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX still active.");
            ajax.lastCall.resolve({groups: []}), [], resolveAjaxCall;
            ok(!window.onbeforeunload(), "Able to leave page when AJAX finished.");
        });

        test("Trying to leave page while updating gives warning to user until AJAX finishes with error", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            view.setGroups(['a'], null);
            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX still active.");
            ajax.lastCall.reject("Error", [], resolveAjaxCall);
            ok(!window.onbeforeunload(), "Able to leave page when AJAX finished.");
        });
        test("Trying to leave page while updating gives warning to user when request queued until error.", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            view.setGroups(['a'], []);
            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX still active.");
            view.setGroups(['a'], []);

            ajax.lastCall.resolve({groups: []});

            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX queued.");

            ajax.lastCall.reject("error", [], resolveAjaxCall);

            ok(!window.onbeforeunload(), "Able to leave page when AJAX finished.");
        });

        test("Trying to leave page while updating is okay if websudo was triggered.", function () {
            this.createEditor();

            var view = this.parser.views()[1];
            var ajax = this.ajax;

            var result1 = view.setGroups(['a'], []);
            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX still active.");

            //Trigger the websudo dialog.
            ajax.lastCall.dialog.beforeShow();

            //Can now leave the page because websudo has been triggered.
            ok(!window.onbeforeunload(), "Able to leave page when AJAX finished.");

            //All requests are aborted if someone is about to leave page.
            this.assertAbort(result1);
        });

        test("Still calls old onbeforeunload function.", function () {
            var error = "Error";
            var unload = window.onbeforeunload = this.stub().returns(error);

            this.createEditor();
            var view = this.parser.views()[1];
            var ajax = this.ajax;

            view.setGroups(['a'], []);

            equal(window.onbeforeunload(), error, "Calls old onbeforeunload first.");
            unload.returns(void 0);

            equal(window.onbeforeunload(), "application.access.configuration.active.ajax", "Warn user about leaving page while AJAX still active.");
            ajax.lastCall.resolve({groups: []});
            ok(!window.onbeforeunload(), "Able to leave page when AJAX finished.");
        });
    });
});
