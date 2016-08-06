define('jira/field/assignee-picker', [
    'jira/ajs/select/scrollable-single-select',
    'jira/ajs/select/suggestions/assignee-suggest-handler',
    'jira/ajs/list/group-descriptor',
    'jira/ajs/list/item-descriptor',
    'aui/params',
    'jquery',
    'underscore'
], function (ScrollableSingleSelect,
    AssigneeSuggestHandler,
    GroupDescriptor,
    ItemDescriptor,
    params,
    $,
    _) {

    function getAssigneeGroupSearch(suggestions) {
        return _.find(suggestions, function (suggestion) {
            return suggestion.id() === 'assignee-group-search';
        });
    }

    /**
     * A single-select list for selecting Assignees. Assignees in the list are in two groups:
     *
     * - Suggestions: local data, consisting of recent assignees for the issue and current
     *                user, plus the reporter
     * - Search: AJAX data, found from all user assignable for the current project
     *
     * @class AssigneePicker
     * @extends SingleSelect
     */
    return ScrollableSingleSelect.extend({
        /**
         * @param {Object} options
         * @constructs
         */
        init: function (options) {
            var instance = this;
            var element = (options.element instanceof $) ? options.element : $(options.element);
            instance._pagination = {
                lastQuery: null,
                numberOfShowingItems: 0,
                allResultsDisplayed: false,
                requestNextPagePromise: null
            };

            // Returns the data sent to the server for the AJAX search
            function data(query) {
                params.actionDescriptorId = undefined;

                AJS.populateParameters();
                return {
                    username: query,
                    projectKeys: params.projectKeys,
                    issueKey: params.assigneeEditIssueKey,
                    actionDescriptorId: params.actionDescriptorId,
                    maxResults: 50,
                    startAt: instance._pagination.numberOfShowingItems
                };
            }

            function formatResponse(response) {
                var ret = [];
                if (response.length) {
                    // Search results
                    var groupDescriptor = new GroupDescriptor({
                        weight: 1,          // index of group in dropdown
                        id: "assignee-group-search",
                        uniqueItemScope: 'container',
                        replace: true,     // Allow subsequent calls to replace model items
                        label: AJS.I18n.getText("assignee.picker.group.search")
                    });

                    for (var i = 0, len = response.length; i < len; i++) {
                        var user = response[i];

                        var username = user.name;
                        var displayName = user.displayName;
                        var emailAddress = user.emailAddress;
                        var label = displayName;
                        if (emailAddress) {
                            label += ' - ' + emailAddress;
                        }
                        label += ' (' + username + ')';

                        groupDescriptor.addItem(new ItemDescriptor({
                            value: username,
                            fieldText: displayName,
                            label: label,
                            allowDuplicate: false,
                            icon: user.avatarUrls['16x16']
                        }));
                    }
                    ret.push(groupDescriptor);
                }
                return ret;
            }

            options = $.extend(true, {}, {
                submitInputVal: true,
                showDropdownButton: !!element.data('show-dropdown-button'),
                errorMessage: AJS.I18n.getText("assignee.picker.invalid.user"),
                localDataGroupId: 'assignee-group-suggested',
                content: "mixed",
                suggestionAtTop: true,
                removeDuplicates: true,
                ajaxOptions: {
                    url: function () {
                        //reset the assigneeEditIssueKey param, so that when we go from an quickedit dialog to a quick create dialog for
                        //example the value isn't set!
                        params.assigneeEditIssueKey = undefined;
                        AJS.populateParameters();

                        var path = params.assigneeEditIssueKey ? 'search' : 'multiProjectSearch';
                        return contextPath + "/rest/api/latest/user/assignable/" + path;
                    },
                    query: true,                // keep going back to the server for each keystroke
                    minQueryLength: 0,
                    data: data,
                    formatResponse: formatResponse
                }
            }, options);

            if (options.editValue == "-1") {
                // override value in "data-editValue" for SingleSelect._setOptions -> getOptionsFromAttributes()
                // so on error the "Automatic" is selected instead of verbatim "-1" string in SingleSelect._setInitState
                options.editValue = false;
                element.val("-1");
            }

            this._super(options);
            this.suggestionsHandler = new AssigneeSuggestHandler(this.options, this.model);
        },

        /**
         * Reset pagination info when the query is changed. Increase numberOfShowingItems when receive results from server.
         */
        requestSuggestions: function (force) {
            if (this._pagination.lastQuery != this.getQueryVal()) {
                this._resetPagination();
            }
            return this._super(force).done(_.bind(function (suggestions) {
                var group = getAssigneeGroupSearch(suggestions);
                if (group) {
                    var groupItems = group.items();
                    if (groupItems && groupItems.length) {
                        this._pagination.numberOfShowingItems += groupItems.length;
                    }
                }

                return suggestions;
            }, this));
        },

        /**
         * When the list is scrolled to bottom, send request for next items and append results to current list
         */
        scrolledToBottomHandler: function () {
            if ((!this._pagination.requestNextPagePromise || this._pagination.requestNextPagePromise.isResolved())
                && !this._pagination.allResultsDisplayed) {
                this._pagination.requestNextPagePromise = this.requestSuggestions(true).done(_.bind(function (suggestions) {
                    var group = getAssigneeGroupSearch(suggestions);
                    if (group) {
                        var groupItems = group.items();
                        if (groupItems && groupItems.length) {
                            this.listController.appendToGroupDescriptor('assignee-group-search', groupItems);
                            this.listController.addNextPage();

                        } else {
                            this._pagination.allResultsDisplayed = true;
                        }

                    } else {
                        this._pagination.allResultsDisplayed = true;
                    }
                }, this));
            }
        },

        /**
         * Only handle when the query is changed
         */
        _handleCharacterInput: function (force) {
            if (this._pagination.lastQuery != this.getQueryVal()) {
                this._super(force);
            } else if (force) {
                this.showSuggestions();
            }
        },

        /**
         * Handle the case where the entry was deleted - on blur, set the Assignee to 'Automatic'.
         */
        handleFreeInput: function (value) {
            if ("" === $.trim(value || this.$field.val())) {
                this.setSelection(this.model.getDescriptor("-1"));
            } else {
                this._super(value);
            }

            this._resetPagination();
        },

        /**
         * Assignee Picker is a special case as we have <option>s that are prepopulated and ones that are requested from the
         * server. Our super class will remove all of our <option>s whenever we make a new request as it is expecting that
         * because we go to the server all our <option>s will be populated from the server also. This is not the case
         * overriding this method fixes this issue. If we do not override we get JRADEV-8626.
         */
        cleanUpModel: function () {},

        /**
         * Reset the pagination information
         * @private
         */
        _resetPagination: function () {
            this._pagination.lastQuery = this.getQueryVal();
            this._pagination.numberOfShowingItems = 0;
            this._pagination.allResultsDisplayed = false;
            this._pagination.requestNextPagePromise = null;
        }

    });
});

AJS.namespace('JIRA.AssigneePicker', null, require('jira/field/assignee-picker'));