AJS.test.require(["jira.webresources:application-selector"], function () {
    require(["jira/admin/application-selector", "jira/admin/application-selector/application", "underscore", "backbone", "jquery"],
    function (
        ApplicationSelector, Application, _, Backbone, $
    ) {

        module('Application selector', {
            setup: function () {
                this.sandbox = sinon.sandbox.create();
                this.sandbox.stub(Application.prototype, "showEffectiveWarning");
                this.sandbox.stub(Application.prototype, "hideEffectiveWarning");
            },

            teardown: function () {
                this.sandbox.restore();
            },

            initializeApplicationSelector: function(el, url) {
                this.selector = new ApplicationSelector({
                    el: $(el)
                });
                if (url) {
                    this.selector.selectApplicationsBasedOnURL(url);
                }
            }
        });

        var ComboPageObject = function () {
            this.element = $("#qunit-fixture");
            this.showStub = sinon.stub();
            this.hideStub = sinon.stub();
        };

        _.extend(ComboPageObject.prototype, {
            addCombo: function (value, checked, disabled, defined, data) {
                defined = (defined === undefined) ? true : defined;
                var $container = $('<div></div>');

                var $input = $("<input>").attr({
                    type: "checkbox",
                    "class": "application application-" + value,
                    "data-defined": "" + defined,
                    "data-key": value
                }).val(value)
                    .prop("checked", !!checked)
                    .prop("disabled", !!disabled)
                    .appendTo($container);

                if (!defined) {
                    $('<div></div>').attr({
                        "class": "application-not-defined-dialog"
                    }).appendTo($container);

                    $container.find(".application-not-defined-dialog")[0].show = this.showStub;
                    $container.find(".application-not-defined-dialog")[0].hide = this.hideStub;
                }

                if(data) {
                    _.pairs(data).forEach(function(keyValue) {
                        $input.data(keyValue[0], keyValue[1]);
                    });
                }

                $container.appendTo(this.element);
                return this;
            },
            addWarning: function (value) {
                var $container = $('<div></div>');

                $('<a></a>').attr({
                    href: "#",
                    "class": "aui-icon aui-icon-warning application application-warning application-warning-" + value,
                    "data-key": value
                }).appendTo($container);

                $('<label>').attr({
                    "class": "application-label",
                    "data-key": value
                }).appendTo($container);

                $container.appendTo(this.element);

                return this;
            },
            addCriticalCore: function () {
                this.addWarning("jira-core");
                return this;
            },
            addCore: function (checked, disabled) {
                this.addCombo("jira-core", checked, disabled);
                return this;
            },
            getDisabled: function () {
                return this._getCheckboxes(".application:disabled, .application-label.disabled");
            },
            getWarnings: function () {
                return this._getCheckboxes(".application-warning");
            },
            getChecked: function () {
                return this._getCheckboxes("input::checked");
            },
            getIndeterminate: function () {
                return this._getCheckboxes("input:indeterminate, .application-warning.effective");
            },
            doClick: function(selector) {
                this.element.find("input[value="+selector+"]").click();
            },
            setChecked: function (selector, state){
                this.element.find("input[value="+selector+"]").prop("checked", state);
                return this;
            },
            _getCheckboxes: function(selector) {
                return this.element.find(selector).map(function () {
                    return $(this).attr("data-key");
                }).get();
            },
            clear: function () {
                this.element.empty();
            }
        });

        test("Initial state of combobox doesnt change when no app selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else").addCore();
            this.initializeApplicationSelector(pageObject.element);
            deepEqual(pageObject.getChecked(), [],
                "Doesn't select any combos when no apps selected.");
        });

        test("Initial state of combobox selects + disables core when app selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element);

            deepEqual(pageObject.getChecked(), ["else", "jira-core"],
                "Core is checked when application is selected.");
            deepEqual(pageObject.getDisabled(), ["jira-core"],
                "Core is disabled when application is selected.");
        });

        test("Combobox change state aproptietly when there is no core.", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addWarning("error-app");

            this.initializeApplicationSelector(pageObject.element);
            deepEqual(pageObject.getChecked(), ["else"]);
            deepEqual(pageObject.getDisabled(), []);
            pageObject.doClick("something");
            deepEqual(pageObject.getChecked(),["something", "else"]);
            deepEqual(pageObject.getDisabled(), []);
        });

        test("Combobox retains core checked when it was initially checked", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addWarning("error-app").addCore(true);

            this.initializeApplicationSelector(pageObject.element);
            deepEqual(pageObject.getChecked(), ["else", "jira-core"],
                "Core is checked when application is selected.");
            deepEqual(pageObject.getDisabled(), ["jira-core"],
                "Core is disabled when application is selected.");
            pageObject.doClick("else");
            deepEqual(pageObject.getChecked(),["jira-core"], "Core is selected and enabled");
            deepEqual(pageObject.getDisabled(), [],
                "Core is re-enabled when no other application is selected.");
        });

        test("Core is not checked and enabled after one app was unchecked", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element);
            pageObject.doClick("else");
            deepEqual(pageObject.getChecked(),[], "Core is not checked");
            deepEqual(pageObject.getDisabled(), [],
                "Core is re-enabled when no other application is selected.");
        });

        test("Core remains checked and disabled when two apps are selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else").addCore();

            this.initializeApplicationSelector(pageObject.element);
            pageObject.doClick("else");
            pageObject.doClick("something");
            deepEqual(pageObject.getChecked(),["something","else","jira-core"], "Core is selected and enabled");
            deepEqual(pageObject.getDisabled(), ["jira-core"],
                "Core is disabled when other application is selected.");
        });

        test("Core is un-checked and enabled when two apps are selected, then de-selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else").addWarning("error-app").addCore();

            this.initializeApplicationSelector(pageObject.element);
            pageObject.doClick("else");
            pageObject.doClick("something");
            pageObject.doClick("else");
            pageObject.doClick("something");
            deepEqual(pageObject.getChecked(),[], "Core is not selected");
            deepEqual(pageObject.getDisabled(), [], "Core is enabled when no other application are selected.");
        });

        test("Core is checked and enabled when two apps are selected, then de-selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else").addWarning("error-app").addCore(true);

            this.initializeApplicationSelector(pageObject.element);
            pageObject.doClick("else");
            pageObject.doClick("something");
            pageObject.doClick("else");
            pageObject.doClick("something");

            deepEqual(pageObject.getChecked(),["jira-core"], "Core is selected");
            deepEqual(pageObject.getDisabled(), [], "Core is enabled when no other application are selected.");

            pageObject.doClick("else");
            pageObject.doClick("something");
            pageObject.doClick("else");
            pageObject.doClick("something");
            pageObject.doClick("jira-core");

            deepEqual(pageObject.getChecked(),[], "Core is not selected");
            deepEqual(pageObject.getDisabled(), [], "Core is enabled when no other application are selected.");

        });

        test("Core is un-checked and disabled when other apps were selected and it was initially disabled", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else").addWarning("error-app").addCore(false, true);
            var callback = this.sandbox.spy();

            this.initializeApplicationSelector(pageObject.element);
            deepEqual(pageObject.getChecked(),[], "Core is not selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core remains disabled from initial state");

            pageObject.doClick("else");
            pageObject.doClick("something");
            pageObject.doClick("else");
            pageObject.doClick("something");
            deepEqual(pageObject.getChecked(),[], "Core is not selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core remains disabled from initial state");
        });

        test("Only one application exists script doesn't break", function () {
            var pageObject = new ComboPageObject();
            var initialState = pageObject.element.html();
            this.initializeApplicationSelector(pageObject.element);
            deepEqual(pageObject.element.html(), initialState, "shall be the same");
        });

        test("Application is selected based on the url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element, "http://example.com/?application=something");

            deepEqual(pageObject.getChecked(),["something","jira-core"], "Core and something are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Multiple applications are selected based on the url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", true).addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element, "http://example.com/?application=something&application=else");

            deepEqual(pageObject.getChecked(),["something","else","jira-core"], "All applications are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Application is selected also when it appears multiple times in the url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", true).addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element, "http://example.com/?application=something&application=something");

            deepEqual(pageObject.getChecked(),["something","jira-core"], "Core and something are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Nothing is selected when application key is provided in the url but the application is disabled", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", false, true).addCombo("else", true).addCore();

            this.initializeApplicationSelector(pageObject.element, "?application=something");

            deepEqual(pageObject.getChecked(),[], "Nothing is selected");
            deepEqual(pageObject.getDisabled(), ["something"], "Nothing is disabled.");
        });

        test("Wrong application key provided in the url is not taken into account when selecting", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", false, true).addCombo("else").addCore();

            this.initializeApplicationSelector(pageObject.element, "?application=something&application=else");
            deepEqual(pageObject.getChecked(),["else", "jira-core"], "Else and core are selected");
            deepEqual(pageObject.getDisabled(), ["something", "jira-core"], "Core and something are disabled.");
        });

        test("Nothing is selected when wrong application key is provided in the url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", true).addCombo("else").addCore();

            this.initializeApplicationSelector(pageObject.element, "?application=no-such-app");

            deepEqual(pageObject.getChecked(),[], "Nothing is selected");
            deepEqual(pageObject.getDisabled(), [], "Nothing is disabled.");
        });

        test("Wrong application key provided in the url is not taken into account when selecting", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", true).addCombo("else").addCore();

            this.initializeApplicationSelector(pageObject.element, "?application=no-such-app&application=else");
            deepEqual(pageObject.getChecked(),["else", "jira-core"], "Else and core are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Defaults are selected when there is no application param in the url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something").addCombo("else", true).addWarning("error-app").addCore();

            this.initializeApplicationSelector(pageObject.element, "http://example.com/?no-application=no-such-app");

            deepEqual(pageObject.getChecked(),["else","jira-core"], "Core and something are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Doesn't break with empty url", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("something", true).addCombo("else").addCore();

            this.initializeApplicationSelector(pageObject.element, "");

            deepEqual(pageObject.getChecked(),["something","jira-core"], "Core and something are selected");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
        });

        test("Effective applications checked after selectApplicationsBasedOnURL and unchecked after toggle", function() {
            var pageObject = new ComboPageObject();
            pageObject
                .addCombo("something", false, false, true, { effective: ['foo'] })
                .addCombo("foo")
                .addCombo("else", true)
                .addCore();

            this.initializeApplicationSelector(pageObject.element, "http://example.com/?application=something");

            deepEqual(pageObject.getChecked(),["something","jira-core"], "Core and something are selected");
            deepEqual(pageObject.getIndeterminate(), ["foo"], "Foo is indeterminate.");
            deepEqual(pageObject.getDisabled(), ["jira-core"], "Core is disabled.");
            ok("showEffectiveWarning called once", Application.prototype.showEffectiveWarning.calledOnce);

            pageObject.doClick("something");

            deepEqual(pageObject.getIndeterminate(), [], "Foo is not indeterminate.");
            ok("hideEffectiveWarning called once", Application.prototype.hideEffectiveWarning.calledOnce);
        });

        test("After disableAllApplications all applications should be disabled", function () {
            var pageObject = new ComboPageObject();

            pageObject.addCombo("jira-func").addCombo("jira-software").addWarning("error-app").addCore();

            this.initializeApplicationSelector(pageObject.element, "");
            this.selector.disableAllApplications();
            deepEqual(pageObject.getDisabled(), ["jira-func", "jira-software", "error-app", "jira-core"], "All applications should be disabled");
            deepEqual(pageObject.getChecked(), [], "None application should be selected");
        });

        test("Undefined application's trigger showing a dialog when checked", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("jira-func", false, false, false);
            this.initializeApplicationSelector(pageObject.element, "");

            pageObject.doClick("jira-func");

            sinon.assert.calledOnce(pageObject.showStub);
        });

        test("Undefined application's trigger hiding a dialog when unchecked", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("jira-func", false, false, false);
            this.initializeApplicationSelector(pageObject.element, "");

            pageObject.doClick("jira-func");
            pageObject.doClick("jira-func");

            sinon.assert.calledOnce(pageObject.hideStub);
        });

        test("Defined application's trigger doesn't show a dialog", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("jira-func", false, false, true);
            this.initializeApplicationSelector(pageObject.element, "");

            pageObject.doClick("jira-func");
            pageObject.doClick("jira-func");

            sinon.assert.notCalled(pageObject.hideStub);
            sinon.assert.notCalled(pageObject.showStub);
        });

        test("Effective warning should appear when critical application is indeterminate selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("clickable", false, false, true, { effective: ["critical"] });
            pageObject.addWarning("critical");
            this.initializeApplicationSelector(pageObject.element, "");

            pageObject.doClick("clickable");

            deepEqual(pageObject.getIndeterminate(), ["critical"], "Critical is indeterminate.");
            ok("showEffectiveWarning called once", Application.prototype.showEffectiveWarning.calledOnce);
        });

        test("Effective warning should appear when critical Core application is indeterminate selected", function () {
            var pageObject = new ComboPageObject();
            pageObject.addCombo("clickable", false, false, true, { effective: ["jira-core"] });
            pageObject.addCriticalCore();
            this.initializeApplicationSelector(pageObject.element, "");

            pageObject.doClick("clickable");

            deepEqual(pageObject.getIndeterminate(), ["jira-core"], "Core is indeterminate.");
            ok("showEffectiveWarning called once", Application.prototype.showEffectiveWarning.calledOnce);
        });
    });
});
