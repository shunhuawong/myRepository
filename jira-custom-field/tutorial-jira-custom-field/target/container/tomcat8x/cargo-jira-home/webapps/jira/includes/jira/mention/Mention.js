define('jira/mention/mention', [
    'jira/ajs/control',
    'jira/dialog/dialog',
    'jira/mention/mention-user',
    'jira/mention/mention-group',
    'jira/mention/mention-matcher',
    'jira/mention/scroll-pusher',
    'jira/mention/contextual-mention-analytics-event',
    'jira/mention/uncomplicated-inline-layer',
    'jira/ajs/layer/inline-layer/standard-positioning',
    'jira/ajs/dropdown/dropdown-list-item',
    'jira/util/events',
    'jira/util/navigator',
    'aui/progressive-data-set',
    'jquery',
    'underscore',
    'wrm/context-path'
], function (Control,
             Dialog,
             UserModel,
             MentionGroup,
             MentionMatcher,
             ScrollPusher,
             ContextualMentionAnalyticsEvent,
             UncomplicatedInlineLayer,
             InlineLayerStandardPositioning,
             DropdownListItem,
             Events,
             Navigator,
             ProgressiveDataSet,
             jQuery,
             _,
             contextPath) {
    "use strict";
    var mentioning = false;
    var seedData = {};

    /**
     * Gets the user ID from an HTML element.
     * @param {jQuery|HTMLElement} element
     */
    function idOf(element) {
        var id = '';
        var el;
        if (element) {
            el = (element instanceof jQuery) ? element.get(0) : element;
            id = el.querySelector('a').getAttribute('rel');
        }
        return id;
    }

    function isMentioning() {
        return mentioning;
    }

    function comparator(a, b) {
        var result = compareMaybeUndefined(
            a.get('highestIssueInvolvementRank'),
            b.get('highestIssueInvolvementRank'),
            function (a, b) { return a - b; }
        );

        if(result === 0) {
            result = compareMaybeUndefined(
                a.get('latestCommentCreationTime'),
                b.get('latestCommentCreationTime'),
                // We negate the comparator result because we want descending
                // time ordering and the default is ascending
                function (a, b) { return b - a; }
            );

            if (result === 0) {
                result = a.get('displayName').localeCompare(b.get('displayName'));
            }
        }

        return result;
    }

    // Compares two values which may or may not be undefined
    function compareMaybeUndefined(a, b, comparator) {
        if (a !== undefined)  {
            return (b !== undefined) ? comparator(a, b) : -1;
        } else {
            return (b !== undefined) ? 1 : 0;
        }
    }

    function isRolesEnabled(issueKey) {
        return !!issueKey;
    }

    /**
     * Chooses the appropriate REST endpoint for retrieving mentionable users
     * based on a few static criterion.
     *
     * @param {String} [issueKey] the key for the issue. If empty, assumes no issue exists,
     * which means we fall back to a generic list of users with a browse permission.
     *
     * @returns {Object} the URL the mention controller should hit.
     */
    function getDataSourceConfig(issueKey) {
        var config = {
            model: UserModel,
            comparator: comparator
        };
        if (isRolesEnabled(issueKey)) {
            config.queryEndpoint = contextPath() + "/rest/internal/2/user/mention/search";
            config.queryParamKey = "query";
        } else {
            config.queryEndpoint = contextPath() + "/rest/api/2/user/viewissue/search";
            config.queryParamKey = "username";
        }
        return config;
    }

    /**
     * Provides autocomplete for username mentions in textareas.
     *
     * @class Mention
     * @extends Control
     */
    return Control.extend({

        CLASS_SIGNATURE: "AJS_MENTION",

        lastInvalidUsername: "",

        lastRequestMatch: true,

        lastValidUsername: "",

        init: function (issueKey) {
            var config = getDataSourceConfig(issueKey);

            this.listController = new MentionGroup();
            this.isRolesEnabled = isRolesEnabled(issueKey);
            this.dataSource = new ProgressiveDataSet([], _.extend({
                queryData: this._getQueryParams.bind(this),
                matcher: this._matcher.bind(this)
            }, config));

            this.dataSource.bind('respond', function (response) {
                var results = response.results;
                var username = response.query;

                if (!username) {
                    return;
                }
                if (!isMentioning()) {
                    return;
                }

                // Update the state of mentions matches
                if (!results.length) {
                    if (username) {
                        if (this.dataSource.hasQueryCache(username)) {
                            if (!this.lastInvalidUsername || username.length <= this.lastInvalidUsername.length) {
                                this.lastInvalidUsername = username;
                            }
                        }
                    }
                    this.lastRequestMatch = false;
                } else {
                    this.lastInvalidUsername = "";
                    this.lastValidUsername = username;
                    this.lastRequestMatch = true;
                }

                // Set the results
                var $suggestions = this.generateSuggestions(results, username);
                this.updateSuggestions($suggestions);
            }.bind(this));
            this.dataSource.bind('activity', function (response) {
                if (response.activity) {
                    this.layerController._showLoading();
                } else {
                    this.layerController._hideLoading();
                }
            }.bind(this));
        },

        updateSuggestions: function ($suggestions) {
            if (this.layerController) {
                this.layerController.content($suggestions);
                this.layerController.show();
                this.layerController.refreshContent();
            }
        },

        _getQueryParams: function () {
            return this.restParams;
        },

        _setQueryParams: function () {
            var params = {
                issueKey: this.$textarea.attr("data-issuekey"),
                projectKey: this.$textarea.attr("data-projectkey"),
                maxResults: 10
            };

            if (Dialog.current && Dialog.current.options.id === "create-issue-dialog") {
                delete params.issueKey;
            }

            this.restParams = params;
        },

        /**
         * Creates a custom event for follow-scroll attribute.
         * This custom event will call setPosition() when the element referenced in "textarea[follow-scroll]" attribute
         *
         * @param customEvents
         * @returns {*}
         * @private
         */
        _composeCustomEventForFollowScroll: function (customEvents) {
            customEvents = customEvents || {};
            var followScroll = this.$textarea.attr("follow-scroll");
            if (followScroll && followScroll.length) {
                customEvents[followScroll] = {
                    "scroll": function () {
                        this.setPosition();
                    }
                };
            }
            return customEvents;
        },

        _matcher: function (model, query) {
            return (
                this._stringPartStartsWith(model.get("name"), query) ||
                this._stringPartStartsWith(model.get("displayName"), query) ||
                _.chain(model.get("issueInvolvements"))
                    // We only match against the assignee and reporter involvement types
                    .filter(function (i) { return i.id === "assignee" || i.id === "reporter"; })
                    .any(function (i) { return i.label.indexOf(query) === 0; })
                    .value()
            );
        },

        textarea: function (textarea) {
            var instance = this;

            if (textarea) {
                this.$textarea = jQuery(textarea);

                jQuery("#mentionDropDown").remove();

                if (this.$textarea.attr("push-scroll")) {
                    /**
                     * If we are pushing the scroll, force the layer to use standard positioning. Otherwise
                     * it might end using {@see WindowPositioning} that conflicts with the intention of
                     * pushing scroll
                     */
                    var positioningController = new InlineLayerStandardPositioning();
                    var scrollPusher = ScrollPusher(this.$textarea, 10);
                }

                this.layerController = new UncomplicatedInlineLayer({
                    offsetTarget: this.textarea(),
                    allowDownsize: true,
                    positioningController: positioningController, // Will be undefined if no push-scroll, that is ok
                    customEvents: this._composeCustomEventForFollowScroll(),

                    /**
                     * Allows for shared object between comment boxes.
                     *
                     * Closure returns the width of the focused comment form.
                     * This comes into effect on the View Issue page where the top and
                     * bottom comment textareas are the same element moved up and down.
                     * @ignore
                     */
                    width: function () {
                        return instance.$textarea.width();
                    }
                });

                this.layerController.bind("showLayer", function () {
                    // Binds events to handle list navigation
                    instance.listController.trigger("focus");
                    instance._assignEvents("win", window);
                }).bind("hideLayer", function () {
                    // Unbinds events to handle list navigation
                    instance.listController.trigger("blur");
                    instance._unassignEvents("win", window);

                    // Try to reset the scroll
                    if (scrollPusher) {
                        scrollPusher.reset();
                    }
                }).bind("contentChanged", function () {
                    if (!instance.layerController.$content) {
                        return;
                    }

                    var oldSelectedItemIndex = instance.listController.index;
                    var oldSelectedItem = instance.listController.highlighted || instance.listController.items[oldSelectedItemIndex];
                    var oldId = oldSelectedItem ? idOf(oldSelectedItem.$element) : '';
                    var newSelectedItem;

                    instance.listController.removeAllItems();
                    instance.layerController.$content.off('click.jiraMentions');
                    instance.layerController.$content.on('click.jiraMentions', 'li', function (e) {
                        var li = e.currentTarget;
                        instance._acceptSuggestion(li);
                        e.preventDefault();
                    });
                    instance.layerController.$content.find("li").each(function () {
                        var li = this;
                        var id = idOf(li);

                        var ddItem = new DropdownListItem({
                            element: li,
                            autoScroll: true
                        });
                        if (id === oldId) {
                            newSelectedItem = ddItem;
                        }
                        instance.listController.addItem(ddItem);
                    });
                    instance.listController.prepareForInput();
                    if (newSelectedItem) {
                        newSelectedItem.trigger('focus');
                    } else {
                        instance.listController.shiftFocus(0);
                    }
                }).bind("setLayerPosition", function (event, positioning, inlineLayer) {
                    if (Dialog.current && Dialog.current.$form) {
                        var buttonRow = Dialog.current.$popup.find(".buttons-container:visible");
                        if (buttonRow.length && positioning.top > buttonRow.offset().top) {
                            positioning.top = buttonRow.offset().top;
                        }
                    }

                    // Try to make the scroll element bigger so we have room for rendering the layer
                    if (scrollPusher) {
                        scrollPusher.push(positioning.top + inlineLayer.layer().outerHeight(true));
                    }
                });

                this.layerController.layer().attr("id", "mentionDropDown");

                this._assignEvents("inlineLayer", instance.layerController.layer());
                this._assignEvents("textarea", instance.$textarea);

                this._setQueryParams();

                this._seedData().then(function (data) {
                    var users = [];
                    users.push.apply(users, data);
                    instance.dataSource.add(users);
                });
            } else {
                return this.$textarea;
            }
        },

        /**
         * Generates autocomplete suggestions for usernames from the server response.
         * @param data The server response.
         * @param  {string} username The selected username
         * @param {boolean} [noQuery=false] if there's no query
         */
        generateSuggestions: function (data, username, noQuery) {
            var highlight = function (text) {
                var result = {
                    text: text
                };

                if (!noQuery) {
                    if (text && text.length) {
                        var matchStart = this._indexOfFirstMatch(text.toLowerCase(), username.toLowerCase());
                        if (matchStart !== -1) {
                            var matchEnd = matchStart + username.length;
                            result = {
                                prefix: text.substring(0, matchStart),
                                match: text.substring(matchStart, matchEnd),
                                suffix: text.substring(matchEnd)
                            };
                        }
                    }
                }
                return result;
            }.bind(this);

            var filteredData = _.map(data, function (model) {
                var user = model.toJSON();
                user.username = user.name;
                user.displayName = highlight(user.displayName);
                user.name = highlight(user.name);
                user.issueRoles = _.map(user.roles, function (role) {
                    return highlight(role.label);
                });
                return user;
            });

            return jQuery(JIRA.Templates.mentionsSuggestions({
                suggestions: filteredData,
                query: username,
                activity: (this.dataSource.activeQueryCount > 0),
                isRolesEnabled: this.isRolesEnabled
            }));
        },

        _indexOfFirstMatch: function (text, query) {
            // Separators copied from:
            // com.atlassian.jira.bc.user.search.UserSearchUtilities.SEPARATORS
            var separators = / |@|\.|-|"|,|'|\(/;
            var index = 0;
            var _i;
            while (true) {
                if (text.indexOf(query) === 0) {
                    return index;
                }

                _i = text.search(separators);
                // If no separator found, then we've searched all the parts and the
                // query isn't matched
                if (_i === -1) {
                    return -1;
                }

                index = index + _i + 1;
                text = text.substring(_i + 1);
            }
        },

        _seedData: function getSeedData() {
            var resolution;
            var issueKey = this._getQueryParams().issueKey;
            if (issueKey) {
                if (!seedData[issueKey]) {
                    seedData[issueKey] = jQuery.ajax({
                        method: 'GET',
                        url: contextPath() + "/rest/internal/2/user/mention/search",
                        data: this._getQueryParams(),
                        dataType: 'json',
                        contentType: 'application/json; charset=UTF-8'
                    });
                }
                resolution = seedData[issueKey].promise();
            } else {
                resolution = new jQuery.Deferred().reject();
            }
            return resolution;
        },

        /**
         * Triggered when a user clicks on or presses enter on a highlighted username entry.
         *
         * The username value is stored in the rel attribute
         *
         * @param li The selected element.
         */
        _acceptSuggestion: function (li) {
            this._hide();
            ContextualMentionAnalyticsEvent.fireUserMayAcceptSuggestionByUsingContextualMentionEvent(this._getCurrentUserName());
            this._replaceCurrentUserName(idOf(li));
            this.listController.removeAllItems();
            mentioning = false;
        },

        /**
         * Heavy-handed method to insert the selected user's username.
         *
         * Replaces the keyword used to search for the selected user with the
         * selected user's username.
         *
         * If a user is searched for with wiki-markup, the wiki-markup is replaced
         * with the @format mention.
         *
         * @param selectedUserName The username of the selected user.
         */
        _replaceCurrentUserName: function (selectedUserName) {
            var raw = this._rawInputValue();
            var caretPos = this._getCaretPosition();
            var beforeCaret = raw.substr(0, caretPos);
            var wordStartIndex = MentionMatcher.getLastWordBoundaryIndex(beforeCaret, true);

            var before = raw.substr(0, wordStartIndex + 1).replace(/\r\n/g, "\n");
            var username = "[~" + selectedUserName + "]";
            var after = raw.substr(caretPos);

            this._rawInputValue([before, username, after].join(""));
            this._setCursorPosition(before.length + username.length);
        },

        /**
         * Sets the cursor position to the specified index.
         *
         * @param index The index to move the cursor to.
         */
        _setCursorPosition: function (index) {
            var input = this.$textarea.get(0);
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(index, index);
            } else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', index);
                range.moveStart('character', index);
                range.select();
            }
        },

        /**
         * Returns the position of the cursor in the textarea.
         */
        _getCaretPosition: function () {

            var element = this.$textarea.get(0);
            var rawElementValue = this._rawInputValue();
            var caretPosition;
            var range;
            var offset;
            var normalizedElementValue;
            var elementRange;

            if (typeof element.selectionStart === "number") {
                return element.selectionStart;
            }

            if (document.selection && element.createTextRange) {
                range = document.selection.createRange();
                if (range) {
                    elementRange = element.createTextRange();
                    elementRange.moveToBookmark(range.getBookmark());

                    if (elementRange.compareEndPoints("StartToEnd", element.createTextRange()) >= 0) {
                        return rawElementValue.length;
                    } else {
                        normalizedElementValue = rawElementValue.replace(/\r\n/g, "\n");
                        offset = elementRange.moveStart("character", -rawElementValue.length);
                        caretPosition = normalizedElementValue.slice(0, -offset).split("\n").length - 1;
                        return caretPosition - offset;
                    }
                }
                else {
                    return rawElementValue.length;
                }
            }
            return 0;
        },

        /**
         * Gets or sets the text value of our input via the browser, not jQuery.
         * @return The precise value of the input element as provided by the browser (and OS).
         * @private
         */
        _rawInputValue: function () {
            var el = this.$textarea.get(0);
            if (typeof arguments[0] === "string") {
                el.value = arguments[0];
            }
            return el.value;
        },

        /**
         * Sets the current username and triggers a content refresh.
         */
        fetchUserNames: function (username) {
            this.dataSource.query(username);
        },

        /**
         * Returns the current username search key.
         */
        _getCurrentUserName: function () {
            return this.currentUserName;
        },

        /**
         * Hides the autocomplete dropdown.
         */
        _hide: function () {
            this.layerController.hide();
        },

        /**
         * Shows the autocomplete dropdown.
         */
        _show: function () {
            this.layerController.show();
        },

        /**
         * Key up listener.
         *
         * Figure out what our input is, then if we need to, get some suggestions.
         */
        _keyUp: function () {
            var caret = this._getCaretPosition();
            var u = this._getUserNameFromInput(caret);
            var username = jQuery.trim(u || "");
            if (this._isNewRequestRequired(username)) {
                this.fetchUserNames(username);
                mentioning = true;
            } else if (this._showHintSuggestions(u)) {
                var data = this.dataSource.first(5);
                var $suggestions = this.generateSuggestions(data, username, true);
                this.updateSuggestions($suggestions);
                mentioning = true;
            } else if (!this._keepSuggestWindowOpen(username)) {
                this._hide();
                mentioning = false;
            }
            this.lastQuery = username;
            delete this.willCheck;
        },

        /**
         * @return {Boolean} true if we have suggestions and hints to show the user
         */
        _showHintSuggestions: function (username) {
            return typeof username === 'string' && username.length === 0;
        },

        /**
         *  Checks if suggest window should be open
         * @return {Boolean}
         */
        _keepSuggestWindowOpen: function (username) {
            if (!username) {
                return false;
            }
            if (this.layerController.isVisible()) {
                return this.dataSource.activeQueryCount || this.lastRequestMatch;
            }
            return false;
        },

        /**
         * Checks if server pool for user names is needed
         * @param username
         * @return {Boolean}
         */
        _isNewRequestRequired: function (username) {
            if (!username) {
                return false;
            }
            username = jQuery.trim(username);
            if (username === this.lastQuery) {
                return false;
            } else if (this.lastInvalidUsername) {
                // We use indexOf instead of stringPartStartsWith here, because we want to check the whole input, not parts.
                //Do not do a new request if they have continued typing after typing an invalid username.
                if (username.indexOf(this.lastInvalidUsername) === 0 && (this.lastInvalidUsername.length < username.length)) {
                    return false;
                }
            } else if (!this.lastRequestMatch && username === this.lastValidUsername) {
                return true;
            }

            return true;
        },

        _stringPartStartsWith: function (text, startsWith) {
            text = jQuery.trim(text || "").toLowerCase();
            startsWith = (startsWith || "").toLowerCase();

            if (!text || !startsWith) {
                return false;
            }

            return this._indexOfFirstMatch(text, startsWith) !== -1;
        },

        /**
         * Gets the username which the caret is currently next to from the textarea's value.
         *
         * WIKI markup form is matched, and then if nothing is found, @format.
         */
        _getUserNameFromInput: function (caret) {
            if (typeof caret !== "number") {
                caret = this._getCaretPosition();
            }
            return this.currentUserName = MentionMatcher.getUserNameFromCurrentWord(this._rawInputValue(), caret);
        },

        _events: {
            win: {
                resize: function () {
                    this.layerController.setWidth(this.$textarea.width());
                }
            },
            textarea: {
                /**
                 * Makes a check to update the suggestions after the field's value changes.
                 *
                 * Prevents the blurring of the field or closure of a dialog when the drop down is visible.
                 *
                 * Also takes into account IE removing text from an input when escape is pressed.
                 *
                 * When in a dialog, the general convention is that when escape is pressed when focused on an
                 * input the dialog will close immediately rather then just unfocus the input. We follow this convetion
                 * here.
                 *
                 * Please don't hurt me for using stopPropagation.
                 *
                 * @param e The key down event.
                 */
                "keydown": function (e) {
                    if (e.keyCode === jQuery.ui.keyCode.ESCAPE) {
                        if (this.layerController.isVisible()) {

                            if (Dialog.current) {
                                Events.one("Dialog.beforeHide", function (e) {
                                    e.preventDefault();
                                });
                            }

                            this.$textarea.one("keyup", function (keyUpEvent) {
                                if (keyUpEvent.keyCode === jQuery.ui.keyCode.ESCAPE) {
                                    keyUpEvent.stopPropagation(); // Prevent unfocusing the input when esc is pressed
                                    Events.trigger("Mention.afterHide");
                                }
                            });
                        }

                        if (Navigator.isIE() && Navigator.majorVersion() < 11) {
                            e.preventDefault();
                        }
                    } else if (!this.willCheck) {
                        //Only trigger keyUp if the key is not ESCAPE
                        this.willCheck = _.defer(_.bind(this._keyUp, this));
                        _.defer(_.bind(function () {
                            var username = this._getUserNameFromInput(this._getCaretPosition());
                            ContextualMentionAnalyticsEvent.fireContextualMentionIsBeingLookedUpAnalyticsEvent(username, e.keyCode, e.ctrlKey, e.metaKey);
                        }, this));
                    }
                },

                "focus": function () {
                    this._keyUp();
                },

                "mouseup": function () {
                    this._keyUp();
                },

                /**
                 * Prevents a bug where another inline layer will focus on comment textarea when
                 * an item in it is selected (quick admin search).
                 */
                "blur": function () {
                    this.listController.removeAllItems();
                    this.lastQuery = this.lastValidUsername = this.lastInvalidUsername = "";
                }
            },

            inlineLayer: {

                /**
                 * JRADEV-21950
                 * Prevents the blurring of the textarea when the InlineLayer is clicked;
                 */
                mousedown: function (e) {
                    e.preventDefault();
                }
            }
        }
    });
});

define('jira/mention/mention-user', [
    'backbone',
    'underscore'
], function (Backbone,
             _) {
    return Backbone.Model.extend({
        idAttribute: "name",
        initialize: function () {
            this.on('change:issueInvolvements', function (model, val) {
                var involvements = _.union(model.previous('issueInvolvements'), val);
                model.attributes.issueInvolvements = _.uniq(involvements, false, function (item) {
                    return item.id;
                });
            });
        },
        parse: function (resp, options) {
            if (!resp.issueInvolvements) {
                resp.issueInvolvements = [];
            }
            return resp;
        },
        toJSON: function () {
            var data = _.clone(this.attributes);
            data.roles = data.issueInvolvements;
            delete data.issueInvolvements;
            return data;
        }
    });
});

define('jira/mention/mention-matcher', [
    'jquery'
], function (jQuery) {
    return {

        AT_USERNAME_START_REGEX: /^@(.*)/i,
        AT_USERNAME_REGEX: /[^\[]@(.*)/i,
        WIKI_MARKUP_REGEX: /\[[~@]+([^~@]*)/i,
        ACCEPTED_USER_REGEX: /\[~[^~\]]*\]/i,
        WORD_LIMIT: 3,

        /**
         * Searches a string for a mention. Searching starts at the caret position
         * and works backwards until it finds a mention trigger (e.g., the '@' symbol).
         * @param text - the full text to search
         * @param caretPosition - position of the caret, or the point at which to start looking from
         * @returns {String|null} a string value if there's a valid mention between the caret and
         * a mention trigger, or null if no mention is active (e.g., no mention trigger, or caret
         * is before the mention trigger, etc.)
         */
        getUserNameFromCurrentWord: function (text, caretPosition) {
            var before = text.substr(0, caretPosition);
            var lastWordStartIndex = this.getLastWordBoundaryIndex(before, false);
            var prevChar = before.charAt(lastWordStartIndex - 1);
            var currentWord;
            var foundMatch = null;

            if (!prevChar || !/\w/i.test(prevChar)) {
                currentWord = this._removeAcceptedUsernames(before.substr(lastWordStartIndex));
                if (/[\r\n]/.test(currentWord)) {
                    return null;
                }

                jQuery.each([this.AT_USERNAME_START_REGEX, this.AT_USERNAME_REGEX, this.WIKI_MARKUP_REGEX], function (i, regex) {
                    var match = regex.exec(currentWord);
                    if (match) {
                        foundMatch = match[1];
                        return false;
                    }
                });
            }

            return (foundMatch != null && this.lengthWithinLimit(foundMatch, this.WORD_LIMIT)) ? foundMatch : null;
        },

        lengthWithinLimit: function (input, length) {
            var parts = jQuery.trim(input).split(/\s+/);
            return parts.length <= ~~length;
        },

        getLastWordBoundaryIndex: function (text, strip) {
            var lastAt = text.lastIndexOf("@");
            var lastWiki = text.lastIndexOf("[~");

            if (strip) {
                lastAt = lastAt - 1;
                lastWiki = lastWiki - 1;
            }

            return (lastAt > lastWiki) ? lastAt : lastWiki;
        },

        _removeAcceptedUsernames: function (phrase) {
            var match = this.ACCEPTED_USER_REGEX.exec(phrase);

            if (match) {
                return phrase.split(match)[1];
            }
            else {
                return phrase;
            }
        }
    };
});

define('jira/mention/scroll-pusher', ['jquery'], function (jQuery) {
    return function ($el, defaultMargin) {
        defaultMargin = defaultMargin || 0;

        var $scroll = jQuery($el.attr("push-scroll"));
        var originalScrollHeight;

        /**
         * Push the scroll of $scroll element to make room for inlineLayer
         * @param layerBottom {number} Bottom position of the layer (relative to the page)
         * @param margin {number} Extra space to left between layer and scroll
         */
        function push(layerBottom, margin) {
            if (typeof margin === "undefined") {
                margin = defaultMargin;
            }
            var scrollBottom = $scroll.offset().top + $scroll.outerHeight();
            var overflow = layerBottom - scrollBottom;

            if (overflow + margin > 0) {
                if (!originalScrollHeight) {
                    originalScrollHeight = $scroll.height();
                }
                $scroll.height($scroll.height() + overflow + margin);
            }
        }

        /**
         * Resets the scroll
         */
        function reset() {
            if (originalScrollHeight) {
                $scroll.height(originalScrollHeight);
            }
        }

        return {
            push: push,
            reset: reset
        };
    };
});

define('jira/mention/contextual-mention-analytics-event', [
    'jquery',
    'underscore'
], function ($,
             _) {
    var USER_IS_LOOKING_FOR_CONTEXTUAL_MENTION_REGEX = /^(assi(gnee?)|repo(rter?))$/;
    var contextualMentionIsBeingLookedUpEvent = _.debounce(function (username, keyCode, ctrlKey, metaKey) {
        var isBackSpaceOrSelectAllKey = isBackSpacePressed(keyCode) || isSelectAllOperationPerforming(keyCode, ctrlKey, metaKey);
        var isUserLookingForContextualMention = USER_IS_LOOKING_FOR_CONTEXTUAL_MENTION_REGEX.test(username);

        if (isBackSpaceOrSelectAllKey === false && isUserLookingForContextualMention) {
            AJS.trigger("analytics", {name: 'issue.comment.contextualMention.lookup'});
        }
    }, 500);

    var isBackSpacePressed = function (keyCode) {
        return keyCode === $.ui.keyCode.BACKSPACE;
    };

    var isSelectAllOperationPerforming = function (keyCode, ctrlKey, metaKey) {
        return (keyCode === 'A'.charCodeAt() && (ctrlKey || metaKey)) || ctrlKey || metaKey;
    };

    return {
        fireAcceptedContextualMentionAnalyticsEvent: function () {
            AJS.trigger("analytics", {name: 'issue.comment.contextualMention.accepted'});
        },
        fireContextualMentionIsBeingLookedUpAnalyticsEvent: function (username, keyCode, ctrlKey, metaKey) {
            contextualMentionIsBeingLookedUpEvent(username, keyCode, ctrlKey, metaKey);
        },
        fireUserMayAcceptSuggestionByUsingContextualMentionEvent: function (username) {
            _.any(["assignee", "reporter"], function (contextualMention) {
                if (contextualMention.indexOf(username) === 0 && contextualMention !== username) {
                    AJS.trigger("analytics", {name: 'issue.comment.contextualMention.mayAccepted'});
                    return true;
                }
            });
        }
    };
});

AJS.namespace('JIRA.MentionUserModel', null, require('jira/mention/mention-user'));
AJS.namespace('JIRA.Mention', null, require('jira/mention/mention'));
AJS.namespace('JIRA.Mention.Matcher', null, require('jira/mention/mention-matcher'));
AJS.namespace('JIRA.Mention.ScrollPusher', null, require('jira/mention/scroll-pusher'));
AJS.namespace('JIRA.Mention.ContextualMentionAnalyticsEvent', null, require('jira/mention/contextual-mention-analytics-event'));
