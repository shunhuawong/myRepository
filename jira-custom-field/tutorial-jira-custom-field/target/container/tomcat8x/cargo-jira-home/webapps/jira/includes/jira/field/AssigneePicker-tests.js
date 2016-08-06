AJS.test.require('jira.webresources:jira-global', function () {
    var jQuery = require('jquery');
    var AssigneePicker = require('jira/field/assignee-picker');
    var _ = require('underscore');

            module("JIRA.AssigneePicker", {
                setup: function () {
                    var fixture = jQuery("#qunit-fixture");

                    this.pickerSelect = jQuery('<select id="assignee" name="assignee" class="single-user-picker js-assignee-picker aui-ss-select" data-show-dropdown-button="true" data-user-type="assignee" data-container-class="long-field" multiple="multiple" style="display: none;">'
                    + '<optgroup id="assignee-group-suggested" label="Suggestions" data-weight="0">'
                    + '  <option value="admin" data-field-text="admin" data-field-label="admin - admin@localhost (admin)" data-icon="/jira/secure/useravatar?size=xsmall&amp;avatarId=10122">admin</option>'
                    + '  <option value="" data-field-text="Unassigned" data-field-label="Unassigned" data-icon="/jira/secure/useravatar?size=xsmall&amp;avatarId=10123">Unassigned</option>'
                    + '  <option value="-1" data-field-text="Automatic" data-field-label="Automatic" data-icon="/jira/secure/useravatar?size=xsmall&amp;avatarId=10123">Automatic</option>'
                    + '</optgroup>'
                    + '</select>').appendTo(fixture);

                    var xhr = sinon.useFakeXMLHttpRequest();
                    var requests = [];
                    xhr.onCreate = function (req) {
                        requests.push(req);
                    };

                    var userCounter = 0;
                    this.testHelper = {
                        responseBuilder: function (numberOfItems) {
                            var output = [];
                            for (var i = 0; i < numberOfItems; i++) {
                                output.push({
                                    name: "user" + userCounter,
                                    displayName: "User " + userCounter,
                                    emailAddress: "user" + userCounter + "@local",
                                    avatarUrls: {
                                        '16x16': ''
                                    }
                                });

                                userCounter++;
                            }

                            return JSON.stringify(output);
                        },
                        scroll: function ($element, scrollPercent) {
                            $element[0].scrollTop = scrollPercent * $element[0].scrollHeight / 100;
                            $element.trigger('scroll');
                        },
                        respondWith: function (numberOfItems) {
                            _.last(requests).respond(200, {"Content-Type": "application/json"}, this.responseBuilder(numberOfItems));
                        }
                    };
                },

                tearDown: function () {
                    this.server.restore();
                }

            });

            contextPath = ((typeof AJS.contextPath === "function") ? AJS.contextPath() : contextPath) || "";

            test("Selecting invalid Automatic assignee", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect,
                    editValue: "-1"
                });

                ok(!assigneePicker.$container.hasClass("aui-ss-editing"), 'input should not be in edit mode');
                equal(assigneePicker.$field.val(), "Automatic", '"Automatic" assignee should be displayed as string label');

            });

            test("It should fetch the assignee list when the picker is opened", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect
                });

                sinon.spy(assigneePicker.suggestionsHandler.descriptorFetcher, 'execute');

                assigneePicker._handleCharacterInput.call(assigneePicker, true); // force to show dropdown list
                ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'AJAX called when the picker is opened');
                this.testHelper.respondWith(50);

                equal(assigneePicker.listController.getAllItems().length, 53, "Display 53  (3 suggestions + 50 new items)");

            });

            test("It should NOT fetch the next results when user HASN'T scrolled down to the bottom yet", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect
                });

                sinon.spy(assigneePicker, 'scrolledToBottomHandler');
                sinon.spy(assigneePicker.suggestionsHandler.descriptorFetcher, 'execute');

                assigneePicker._handleCharacterInput.call(assigneePicker, true); // force to show dropdown list
                ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'AJAX called when the picker is opened');
                this.testHelper.respondWith(50);

                equal(assigneePicker.listController.getAllItems().length, 53, "Display 53  (3 suggestions + 50 new items)");

                this.testHelper.scroll(assigneePicker.dropdownController.$layer, 50);

                stop();
                _.defer(function () {
                    ok(assigneePicker.scrolledToBottomHandler.notCalled, 'Scroll dropdown 50% and scrolledToBottomHandler is NOT triggered');
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'AJAX NOT called');
                    equal(assigneePicker.listController.getAllItems().length, 53, "Still displaying 53 items");

                    start();
                });

            });

            test("It should fetch the next results when user scrolls down to the bottom", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect
                });

                sinon.spy(assigneePicker, 'scrolledToBottomHandler');
                sinon.spy(assigneePicker.suggestionsHandler.descriptorFetcher, 'execute');

                assigneePicker._handleCharacterInput.call(assigneePicker, true); // force to show dropdown list
                ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'AJAX called when the picker is opened');
                this.testHelper.respondWith(50);

                equal(assigneePicker.listController.getAllItems().length, 53, "Display 53  (3 suggestions + 50 new items)");

                this.testHelper.scroll(assigneePicker.dropdownController.$layer, 100);
                stop();

                _.defer(function () {
                    ok(assigneePicker.scrolledToBottomHandler.calledOnce, 'Scroll dropdown 100% and scrolledToBottomHandler is triggered');
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledTwice, 'AJAX called to load next items');

                    this.testHelper.respondWith(50);

                    equal(assigneePicker.listController.getAllItems().length, 103, "Display 103  (last 53 items + 50 new items)");

                    this.testHelper.scroll(assigneePicker.dropdownController.$layer, 100);

                    _.defer(function () {
                        ok(assigneePicker.scrolledToBottomHandler.calledTwice, 'Scroll dropdown 100% and scrolledToBottomHandler is triggered');
                        ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledThrice, 'AJAX called to load next items');

                        this.testHelper.respondWith(50);

                        equal(assigneePicker.listController.getAllItems().length, 153, "Display 153 items (last 103 items + 50 new items)");

                        start();
                    }.bind(this));
                }.bind(this));

            });

            test("It should NOT send request to server when all results displayed", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect
                });

                sinon.spy(assigneePicker, 'scrolledToBottomHandler');
                sinon.spy(assigneePicker.suggestionsHandler.descriptorFetcher, 'execute');

                assigneePicker._handleCharacterInput.call(assigneePicker, true); // force to show dropdown list
                ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'AJAX called when the picker is opened');

                this.testHelper.respondWith(50);

                equal(assigneePicker.listController.getAllItems().length, 53, "Display 53 items (3 suggestions + 50 new items)");

                this.testHelper.scroll(assigneePicker.dropdownController.$layer, 100);
                stop();

                _.defer(function () {

                    ok(assigneePicker.scrolledToBottomHandler.calledOnce, 'Scroll dropdown 100% and scrolledToBottomHandler is triggered');
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledTwice, 'AJAX called to load next items');

                    this.testHelper.respondWith(0);

                    equal(assigneePicker.listController.getAllItems().length, 53, "Display 53 items (last 53 items + 0 new items)");

                    this.testHelper.scroll(assigneePicker.dropdownController.$layer, 10); // scroll up and down
                    this.testHelper.scroll(assigneePicker.dropdownController.$layer, 100);

                    _.defer(function () {
                        ok(assigneePicker.scrolledToBottomHandler.calledTwice, 'Scroll dropdown 100% and scrolledToBottomHandler is triggered');
                        ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledTwice, 'AJAX NOT called');
                        equal(assigneePicker.listController.getAllItems().length, 53, "Still displaying 53 items");

                        start();
                    });
                }.bind(this));

            });

            test("It should NOT send request to server when user keeps clicking on the field", function () {
                var assigneePicker = new AssigneePicker({
                    element: this.pickerSelect
                });

                var $assigneeField = assigneePicker.$container.find("#assignee-field");

                sinon.spy(assigneePicker.suggestionsHandler.descriptorFetcher, 'execute');
                stop();
                _.delay(function () { // delay is necessary here because the field events is bind in setTimeout
                    $assigneeField.click();
                    this.testHelper.respondWith(50);
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'Click on assignee field for the 1st time, request was sent to retrieve data');

                    $assigneeField.click();
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'Click on assignee field for the 2nd time, NO request was sent');

                    $assigneeField.click();
                    ok(assigneePicker.suggestionsHandler.descriptorFetcher.execute.calledOnce, 'Click on assignee field for the 3rd time, NO request was sent');

                    start();
                }.bind(this), 100);
            });

});
