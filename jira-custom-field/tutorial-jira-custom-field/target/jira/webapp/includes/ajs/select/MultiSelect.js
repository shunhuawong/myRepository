define('jira/ajs/select/multi-select', [
    'jira/ajs/select/multi-select/lozenge',
    'jira/ajs/select/multi-select/lozenge-group',
    'jira/ajs/select/queryable-dropdown-select',
    'jira/ajs/select/select-helper',
    'jira/ajs/select/select-model',
    'jira/ajs/select/suggestions/select-suggest-handler',
    'jira/ajs/layer/inline-layer-factory',
    'jira/ajs/list/list',
    'jira/ajs/list/item-descriptor',
    'jira/util/navigator',
    'jira/util/objects',
    'jira/util/assistive',
    'jquery'
], function(
    MultiSelectLozenge,
    MultiSelectLozengeGroup,
    QueryableDropdownSelect,
    SelectHelper,
    SelectModel,
    SelectSuggestHandler,
    InlineLayerFactory,
    List,
    ItemDescriptor,
    Navigator,
    Objects,
    Assistive,
    jQuery
) {
    /**
     * @classdesc A multiselect list that can be queried and suggestions selected via a dropdown. Suggestions are retrieved via AJAX.
     * @class MultiSelect
     * @extends QueryableDropdownSelect
     * @since 4.2
     * @screenshot https://extranet.atlassian.com/download/attachments/1881178251/multiselect.png?version=3&modificationDate=1298329296262&api=v2
     * @description
     * A smarter replacement for &lt;select type="multiple" />. Allows you to convert existing &lt;select> controls
     * in to `MultiSelect`s without any modification of your markup.
     *
     * `MultiSelect` allows you to:
     *
     * - Filter suggestions using the advanced autocomplete input.
     * - Navigate and select multiple suggestions at a time with the mouse or keyboard.
     * - Add new suggestion by just typing - user inputted.
     * - Edit selected options using keyboard or mouse.
     *
     * Suggestions can be retrieved:
     *
     * - Statically - already in the DOM
     * - Ajax - server queried (much better for large suggestion lists)
     *
     * @example Static
     * <select id="drinks" multiple="multiple" class="hidden">
     *     <optgroup label="Beers">
     *     <option value="1">Victoria Bitter</option>
     *     <option value="2">Blue tongue</option>
     *     <option value="3">James Squires</option>
     *     </optgroup>
     *     <optgroup label="Wines">
     *     <option value="4">Jacobs Creek</option>
     *     <option value="5">Oyster Bay</option>
     *     </optgroup>
     * </select>
     *
     * <script type="text/javascript">
     *     new AJS.MultiSelect({
     *        element: AJS.$("#drinks"),
     *        itemAttrDisplayed: "label" // show full text, not value, in lozenges. (e.g "Oyster Bay" instead of "5")
     *     });
     * </script>
     *
     * @example Ajax
     * <select id="drinks" multiple="multiple" class="hidden"></select>
     *
     * <script type="text/javascript">
     * new AJS.MultiSelect({
     *     element: AJS.$("#drinks"),
     *     itemAttrDisplayed: "label",
     *     ajaxOptions: {
     *         url: "drinks.json",
     *         query: true, // keep going back to the sever for each keystroke
     *         formatResponse: function (response) {
     *
     *             var ret = [];
     *
     *             AJS.$(response).each(function(i, category) {
     *
     *                 var groupDescriptor = new AJS.GroupDescriptor({
     *                     weight: i, // order or groups in suggestions dropdown
     *                     label: category.label // Heading of group
     *                 });
     *
     *                 AJS.$(category.drinks).each(function(){
     *                     groupDescriptor.addItem(new AJS.ItemDescriptor({
     *                         value: this.value, // value of item added to select
     *                         label: this.label, // title of lozenge
     *                         html: this.label // html used in suggestion
     *                     }));
     *                 });
     *
     *                 ret.push(groupDescriptor);
     *             });
     *
     *             return ret;
     *         }
     *     }
     * });
     * </script>
     */
    return QueryableDropdownSelect.extend({

         /**
          * This constructor:
          * <ul>
          *  <li>Overrides default options with user options</li>
          *  <li>Inserts an input field before dropdown</li>
          *  <li>Adds items currently selected in the &lt;select&gt; as items sitting on the top of the textarea</li>
          * </ul>
          *
          * @param {Object} options
          * @param {jQuery | HTMLElement | String} options.element - The &lt;select> element. This will be used as the model, suggestions and selections will be updated here.
          * @param {Number} [options.width] - Width of input. If undefined left up to external CSS to decide dimensions.
          * @param {Number} [options.minRoomForText=50] - The minimum blank space for user to type. <img src="https://extranet.atlassian.com/download/attachments/1881178251/minRoom.png?version=1&modificationDate=1297827200133&api=v2" />
          * @param {MultiSelect.LozengeGroup} [options.itemGroup] - A {@link MultiSelect.LozengeGroup} of suggestions for the control to choose from.
          * @param {String} [options.itemAttrDisplayed='value'] - The attribute from the &lt;option> element to use as the label for the lozenge. Use label for innerText.
          * @param {String} [options.errorMessage=AJS.params.multiselectGenericError] - Message displayed to the user when the field is unfocused with an invalid input remaining.
          * @param {Boolean} [options.showDropdownButton=true] - Weather or not to show the down arrow that allows users to access the suggestions with the mouse.
          * @param {Boolean} [options.ajaxOptions={minQueryLength: 1}] - Ajax Options used to retrieve suggestions. *There is an additional ajax option, formatResponse, this is used to map the server response into suggestion descriptors that can be consumed by the control*
          * @param {Boolean} [options.removeOnUnSelect=false] - If true, when a lozenge is removed, the suggestion will be also. It will not appear again using the autocomplete.
          * @param {String} [options.matchingStrategy=(^|.*\s+)({0})(.*)] - Regular expression used to find and highlight matching suggestions from autocomplete.
          * @param {String} [options.userEnteredOptionsMsg] Setting this option activates user inputted suggestions. The value of this is appended after the user input as a description.] <img src="https://extranet.atlassian.com/download/attachments/1881178251/suffic.png?version=1&modificationDate=1297828298789&api=v2" />
          * @param {Boolean} [options.uppercaseUserEnteredOnSelect=false] - If in mode where user can enter their own suggestion, when suggestion is selected the value/label of the lozenge will be transformed to uppercase.
          * @fires MultiSelect#initialized
          * @constructs
          * @override
          */
        init: function (options) {

            if (this._setOptions(options) === this.INVALID) {
                return this.INVALID;
            }

            jQuery.extend(this, SelectHelper);

            this.options.element = jQuery(this.options.element);
            this.lozengeGroup = this.options.itemGroup;

            this._createSelectModel();

            if (this.options.disabled) {
                this._createFurniture(true);
                return this;
            }

            this._createFurniture();
            this._createSuggestionsController();
            this._createListController();
            this._createDropdownController();
            this._assignEventsToFurniture();
            this._setInitState();

            if (this.options.width) {
                this.setFieldWidth(this.options.width);
            }

             /**
              * Fired when the control has finished rendering and prepared for user input. Emitted from the &lt;select&gt; element.
              * @event MultiSelect#initialized
              * @type {jQuery}
              * @property {MultiSelect} instance
              */
            this.model.$element.addClass("multi-select-select").trigger("initialized", [this]);
        },

        _createSelectModel:function () {
            this.model = new SelectModel({
                element:this.options.element,
                removeOnUnSelect:this.options.removeOnUnSelect
            });
        },

        _setInitState: function () {
            this._restoreSelectedOptions();
            if (this.options.inputText) {
                this.$field.val(this.options.inputText);
                this.updateFreeInputVal();
            }
        },

        _createListController: function () {
            var instance = this;
            this.listController = new List({
                containerSelector: jQuery(".aui-list", this.$container),
                groupSelector: "ul.aui-list-section",
                matchingStrategy: this.options.matchingStrategy,
                maxInlineResultsDisplayed: this.options.maxInlineResultsDisplayed,
                expandAllResults: this.options.expandAllResults,
                selectionHandler: function (e) {
                    instance._selectionHandler(this.getFocused(), e);
                    return false;
                }
            });
        },

        _createDropdownController: function () {
            var instance = this;
            this.dropdownController = InlineLayerFactory.createInlineLayers({
                alignment:AJS.LEFT,
                offsetTarget: this.$field,
                maxInlineResultsDisplayed: this.options.maxInlineResultsDisplayed,
                content: jQuery(".aui-list", this.$container)
            });
            if (this.options.layerId) {
                this.dropdownController.options.id = this.options.layerId;
            }
            this.dropdownController.onhide(function () {
                instance.hideSuggestions();
            });
        },

        _createSuggestionsController: function () {
            this.suggestionsHandler = this.options.suggestionsHandler ?
                    new this.options.suggestionsHandler(this.options, this.model) :
                    new SelectSuggestHandler(this.options, this.model);
        },

        /**
         * Gets default options
         *
         * @protected
         * @return {Object}
         */
        _getDefaultOptions: function () {
            return jQuery.extend(true, this._super(), {
                minRoomForText : 50,
                errorMessage: AJS.I18n.getText("jira.ajax.autocomplete.error"),
                showDropdownButton: true,
                itemGroup: new MultiSelectLozengeGroup(),
                suggestionsHandler: SelectSuggestHandler,
                itemBuilder: function (descriptor) {
                    return new MultiSelectLozenge({
                        label: descriptor.label(),
                        title: descriptor.title(),
                        container: this.$selectedItemsContainer
                    });
                }
            });
        },

        /**
         * Appends furniture around specified dropdown element. This includes:
         *
         * <ul>
         *  <li>errorMessage - A container for error messages is created but not appended until needed</li>
         *  <li>selectedItemsWrapper - A wrapper for selected items</li>
         *  <li>selectedItemsContainer - A container for selected items</li>
         * </ul>
         *
         * @protected
         */
        _createFurniture: function (disabled) {
            var id = this.model.$element.attr("id");

            // remove placeholder if there is one. This placeholder, takes up the space that the multi-select control will
            // while the page is being loaded and the "real" control has not been inserted. i.e Stops the page jumping around.
            if (this.model.$element.prev().hasClass("ajs-multi-select-placeholder")) {
                this.model.$element.prev().remove();
            }

            if (disabled) {
                this.model.$element.replaceWith(this._render("disableSelectField", id));
            } else {
                this.$container = this._render("container", id);
                this.$field = this._render("field", id).appendTo(this.$container);
                var $suggestionsContainer = this._render("suggestionsContainer", id);
                this.$container.append($suggestionsContainer);
                this.suggestionsContainerId = $suggestionsContainer.attr("id");
                this.$container.insertBefore(this.model.$element);
                this.$dropDownIcon = this._render("dropdownAndLoadingIcon", this._hasDropdownButton()).appendTo(this.$container);
                this.$errorMessage = this._render("errorMessage", id);
                this.$selectedItemsWrapper = this._render("selectedItemsWrapper").appendTo(this.$container);
                this.$selectedItemsContainer = this._render("selectedItemsContainer").appendTo(this.$selectedItemsWrapper);
            }
        },

        /**
         * Assigns events furniture
         */
        _assignEventsToFurniture: function () {
            var instance = this;
            this._super();
            this._assignEvents("body", document);
            this._assignEvents("selectedItemsContainer", this.$selectedItemsContainer);
            this._assignEvents("lozengeGroup", this.lozengeGroup);

            this.model.$element.bind("updateOptions", function (e) {
                instance.options = jQuery.extend(true, instance.options, instance.model.$element.getOptionsFromAttributes());
                instance._createSuggestionsController();
            })
            .bind("selectOption", function (e, descriptor) {
                instance.addItem(descriptor);
            })
            .bind("removeOption", function (e, descriptor) {
                instance.removeItem(descriptor);
            })
            .bind("clearSelection", function () {
                instance.clearLozenges();
            })
            .bind("showSuggestions", function (e) {
                instance._handleDown(e);
            })
            .bind("hideSuggestions", function () {
                instance.hideSuggestions();
            });
        },

        /**
         * Gets value for suggestion/option mirroring user input
         *
         * @protected
         * @return {String}
         */
        _getUserInputValue: function () {
            return this.options.uppercaseUserEnteredOnSelect ? this.$field.val().toUpperCase(): this.$field.val();
        },

        /**
         * Clears the control - selection(s) and field text.
         * Note: This does not clear the UI lozenges.
         */
        clear: function () {
            this.$field.val('');
            this.hideSuggestions();
            this.clearSelection();
        },

        /**
         * Fired when a selection is removed. (No &lt;option>'s selected). Emitted from the &lt;select&gt; element.
         * @event MultiSelect#unselect
         * @type {jQuery}
         * @property {ItemDescriptor} [descriptor] - JSON representation of the item that was unselected
         * @property {MultiSelect} instance - the control
         */

        /**
         * Clears selection(s) and sets back to editing mode.
         * @note This does not clear the UI lozenges.
         * @fires MultiSelect#unselect
         */
        clearSelection: function () {
            this.model.setAllUnSelected();
            this.updateItemsIndent();
            this.model.$element.trigger("unselect", [this]);
        },

        /**
         * Completely clears the field: the selection(s), the field text and the UI lozenges.
         */
        clearLozenges: function() {
            this.lozengeGroup.removeAllItems();
            this.clear();
        },

        /**
         * Unselects item in model and removes item from selectedItemsContainer
         *
         * @param {Object} descriptor
         * @fires MultiSelect#unselect
         */
        removeItem: function (descriptor) {

            var instance = this;
            this.model.setUnSelected(descriptor);
            window.setTimeout(function () {
                instance.updateItemsIndent();
            }, 0);
            this.model.$element.trigger("unselect", [descriptor, this]);
        },
        /**
         },
         * Adds items currently selected in the &lt;select&gt; as items sitting on the top of the textarea
         */
        _restoreSelectedOptions: function () {
            var instance = this;

            // creates selected "button" style representation
            jQuery.each(this.model.getDisplayableSelectedDescriptors(), function () {
                instance.addItem(this, true);
            });
            this.updateItemsIndent();
        },

        /**
         * Is true if:
         * <ol>
         *      <li>The text selection is at the start or there is no value in field</li>
         *      <li>Lozenge group has not already been enabled.</li>
         *      <li>There are items in the lozenge group</li>
         * </ol>
         *
         * @return {Boolean}
         */
        _shouldEnableLozengeGroup: function () {
            return this.lozengeGroup.items.length > 0 && this.lozengeGroup.index < 0 && (this.$field.val().length === 0 || this.getCaret(this.$field[0]) === 0);
        },

        /**
         * Handling of backspace in textarea. If there is no characters will select the last item in the selectedItemsContainer.
         */
        _handleBackSpace: function () {
            var instance = this;
            if (this._shouldEnableLozengeGroup()) {
                setTimeout(function() {
                    instance.lozengeGroup.shiftFocus(-1);
                }, 0);
            }
        },

        /**
         * Handling of left key in textarea. If there is no characters will select the last item in the selectedItemsContainer.
         */
        _handleLeft: function () {
            if (this._shouldEnableLozengeGroup()) {
                var instance = this;
                setTimeout(function() {
                    instance.lozengeGroup.shiftFocus(-1);
                }, 0);
            }
        },

        /**
         * Updates the padding left and padding top based on the area occupied by the selected items
         * @fires MultiSelect#multiSelectHeightUpdated
         */
        updateItemsIndent: function () {

            var lineHeight = 20;
            var inputIndent = this._getInputIndent();
            var newHeight = inputIndent.top + lineHeight;

            if (this.$container && this.$container.closest(".inline-edit-fields").size()) {
                newHeight += 0;
            } else {
                newHeight += 6;
            }

            // First set $field's new height, which may trigger vertical scrollbars when
            // in a dialog ...
            this.$field.css({
                paddingTop: inputIndent.top,
                paddingLeft: inputIndent.left
            });
            // ... *then* set $field's width based on the width of $container, which will
            // have shrunken after the scrollbars appeared.
            this.$field.css({
                height: newHeight
            });

            if (this.currentTopOffset && this.currentTopOffset !== inputIndent.top) {
                /**
                 * Indicates the height of the control has changed. Emitted from the `MultiSelect`'s container element.
                 * @event MultiSelect#multiSelectHeightUpdated
                 * @type {jQuery}
                 * @property {MultiSelect} instance
                 */
                this.$container.trigger("multiSelectHeightUpdated", [this]);
            }

            // otherwise ie does not update indent
            if (Navigator.isIE() && Navigator.majorVersion() < 11) {
                this.$field.val(this.$field.val() + " ");
                this.$field.val(this.$field.val().replace(/\s$/, ""));
            }

            this.currentTopOffset = inputIndent.top;
        },

        /**
         * Checks if the item has already been selected/added
         *
         * @param descriptor - JSON describing suggestion/option
         * @return {Boolean}
         */
        _isItemPresent: function (descriptor) {
            var duplicate = false;
            var value = descriptor.value();
            jQuery.each(this.lozengeGroup.items, function () {
                if (this.value === value) {
                    duplicate = true;
                    return false; // bail
                }
            });
            return duplicate;
        },

        /**
         * Fired when a suggestion is selected. Emitted from the &lt;select&gt; element.
         * @event MultiSelect#selected
         * @type {jQuery}
         * @property {ItemDescriptor} descriptor - JSON representation of the selected suggestion
         * @property {MultiSelect} instance
         */

        /**
         * Adds selected suggestion to the selected items, and marks it as selected in the model.
         *
         * @param {Object} descriptor - JSON describing suggestion/option
         * @fires MultiSelect#selected
         */
        addItem: function(descriptor, initialize) {
            // this descriptor is for the lozenge so we don't want to use the same descriptor but a copy instead. We don't
            // want our descriptor properties to change through a reference we were unaware of.
            if (descriptor instanceof ItemDescriptor) {
                descriptor = Objects.copyObject(descriptor.allProperties(), false);
            }

            descriptor.value = jQuery.trim(descriptor.value);
            descriptor.label = jQuery.trim(descriptor[this.options.itemAttrDisplayed]) || descriptor.value;
            descriptor.title = jQuery.trim(descriptor.title) || descriptor.label;

            descriptor = new ItemDescriptor(descriptor);

            if (this._isItemPresent(descriptor)) {
                return;
            }

            var lozenge = this.options.itemBuilder.call(this, descriptor);

            this.lozengeGroup.addItem(lozenge);
            this._assignEvents("lozenge", lozenge);

            this.model.setSelected(descriptor);
            this.updateItemsIndent();

            this.dropdownController.setPosition(); // update position incase another line has been added

            lozenge.value = descriptor.value(); // we use this to prevent duplicates being added

            if (!initialize) {
                this.model.$element.trigger("selected", [descriptor, this]);
            }
        },

        /**
         * Adds multiple items
         *
         * @param {Array} items - Array of item descriptors. e.g {value: "The val", label: "Label to be displayed in suggestions"}
         * @param {Boolean} removeOnUnSelect - If set to true, if the item is removed from the control (unselected), the option
         * will also be deleted from the select model also. This means it will not appear in the suggestions dropdown.
         */
        _addMultipleItems: function(items, removeOnUnSelect) {

            var instance = this;

            jQuery.each(items, function (i, descriptor) {
                if (removeOnUnSelect) {
                    descriptor.removeOnUnSelect = true;
                }
                instance.addItem(descriptor);
            });
        },

        /**
         * Determines correct top and left indent for textarea, based on the area taken by selected items
         *
         * @return {Object}
         */
        _getInputIndent: function () {

            var top,
                left,
                indent,
                iconArea = 21, // Icon width of 16px and 4px on the right and then 2px margin on the left of the items container
                paddingLeft = 5,
                paddingTop = 4,
                lastLozengeIndex = this.lozengeGroup.items.length - 1,
                $last;

            indent = { top: paddingTop, left: paddingLeft };

            if (lastLozengeIndex >= 0) {
                $last = this.lozengeGroup.items[lastLozengeIndex].$lozenge;
                top = $last.prop("offsetTop");
                left = $last.prop("offsetLeft") + $last.outerWidth();
                if (left > this.$container.width() - iconArea - this.options.minRoomForText) {
                    top += $last.prop("offsetHeight");
                    left = 0;
                }

                indent.top += top;
                indent.left += left;
            }

            return indent;
        },

        /**
         * The selected value of the `MultiSelect` has changed. Emitted from the &lt;select&gt; element.
         * @event MultiSelect#change
         * @type {jQuery}
         */

        /**
         * Handle when a suggestion is accepted
         * @param selected
         * @param e
         * @fires MultiSelect#change
         */
        _selectionHandler: function (selected, e) {

            var instance = this;

            selected.each(function () {
                instance.addItem(jQuery.data(this, "descriptor"));
            });

            this.$field.val("").focus().scrollIntoView({ margin: 20 });
            this.hideSuggestions();
            this.hideErrorMessage();
            this.updateFreeInputVal();
            this.model.$element.trigger("change");

            e.preventDefault();
        },

        /**
         * Determines whether the given value represents a valid item
         * @param {String} itemValue
         * @return {Boolean}
         */
        isValidItem: function(itemValue) {
            var suggestedItemDescriptor = this.listController.getFocused().data("descriptor");
            if (!suggestedItemDescriptor) {
                return false;
            }
            itemValue = itemValue.toLowerCase();
            return itemValue === jQuery.trim(suggestedItemDescriptor.label.toLowerCase()) ||
                   itemValue === jQuery.trim(suggestedItemDescriptor.value.toLowerCase());
        },

        /**
         * Handle the case where text remains "unlozenged" in the text field
         * @fires MultiSelect#change
         */
        handleFreeInput: function() {
            var value = jQuery.trim(this.$field.val()),
                descriptor;

            if (value) {
                descriptor = this.model.getDescriptor(value);
                if (descriptor) {
                    this.addItem(descriptor);
                    this.model.$element.trigger("change");
                    this.$field.val("");
                    this.hideErrorMessage();
                    this.updateFreeInputVal();
                } else if (!this.options.submitInputVal) {
                    this.showErrorMessage(value);
                }
            }
        },

        /**
         * Submits form
         */
        submitForm: function () {
            if (this.$field.val().length === 0 && !this.suggestionsVisible) {
                jQuery(this.$field[0].form).submit(); // submit on enter if field is empty
            }
        },

        _handleCharacterInput: function (ignoreBuffer, ignoreQueryLength) {
            this._super(ignoreBuffer, ignoreQueryLength);
            this.updateFreeInputVal();
        },

        _deactivate: function () {
            this.handleFreeInput();
            this.lozengeGroup.trigger("blur");
            this.hideSuggestions();
        },

        keys: {
            "Left": function () {
                this._handleLeft();
            },
            "Backspace": function () {
                this._handleBackSpace();
            },
            "Return": function (e) {
                this.submitForm();
                e.preventDefault();
            },
            "Tab" : function (e) {
                this.acceptFocusedSuggestion();
            }
        },

        _events: {
            body: {
                // handling for the case where control is in a tab, and as a result hidden.
                tabSelect: function () {
                    if (this.$field.is(":visible")) {
                        this.updateItemsIndent();
                    }
                },
                multiSelectRevealed: function () {
                    if (this.$field.is(":visible")) {
                        this.updateItemsIndent();
                    }
                }
            },
            field: {
                blur: function () {
                    if (!this.ignoreBlurEvent) {
                        this._deactivate();
                    } else {
                        this.ignoreBlurEvent = false;
                        this.$field.focus();
                    }
                },
                "aui:keydown aui:keypress": function(event) {
                    if (this.lozengeGroup.index >= 0) {
                        if (event.key in this.lozengeGroup.keys) {
                            event.preventDefault();
                        } else if (event.key === "Return") {
                            this.submitForm();
                            event.preventDefault();
                        } else {
                            this.onEdit(event);
                            this.lozengeGroup.trigger("blur");
                        }
                    }
                },
                click: function() {
                    this.lozengeGroup.trigger("blur");
                    this.$field.focus();
                }
            },
            lozengeGroup: {
                focus: function() {
                    this.$field.focus();
                    this.hideSuggestions();
                    this._unassignEvents("keys", this.$field);
                    this.$field.attr("aria-controls", this.suggestionsContainerId);
                },
                blur: function() {
                    this._assignEvents("keys", this.$field);
                    this.$field.removeAttr("aria-controls");
                    if (this.$field.val()) {
                        this._handleCharacterInput();
                    }
                }
            },
            lozenge: {
                remove: function(event) {
                    this.removeItem(this.model.getDescriptor(event.target.value));
                    this.$field.focus();
                },
                focus: function(event) {
                    Assistive.wait(function() {
                        this.$field.attr("aria-activedescendant", event.currentTarget.$lozenge.attr("id"));
                    }.bind(this));
                },
                blur: function() {
                    this.$field.removeAttr("aria-activedescendant");
                }
            },
            selectedItemsContainer: {
                click: function(event) {
                    // Ignore clicks not directly on this.$selectedItemsContainer.
                    if (event.target === event.currentTarget) {
                        this.lozengeGroup.trigger("blur");
                        this.$field.focus();
                    }
                }
            }
        },

        _renders: {
            errorMessage: function (idPrefix) {
                return jQuery('<div class="error" />').attr('id', idPrefix + "-error");
            },
            selectedItemsWrapper: function () {
                return jQuery('<div class="representation"></div>');
            },
            selectedItemsContainer: function () {
                return jQuery('<ul class="items" role="listbox" />');
            },
            field: function (idPrefix) {
                //  the wrap="off" attribute prevents text from growing under the labels. It doesn't prevent linebreaks
                return this._render("baseField", "textarea").attr({
                    "id": idPrefix + "-textarea",
                    "class": "text long-field",
                    "wrap": "off"
                });
            },
            disableSelectField: function (id) {
                return jQuery("<input type='text' class='long-field' name='" + id + "' id='" + id + "' />");
            },
            container : function (idPrefix) {
                return jQuery('<div class="jira-multi-select long-field" id="' + idPrefix +'-multi-select">');
            },
            suggestionsContainer : function (idPrefix) {
                return jQuery('<div class="aui-list" id="' + idPrefix + '-suggestions" tabindex="-1"></div>');
            }
        }
    });

});

AJS.namespace('AJS.MultiSelect', null, require('jira/ajs/select/multi-select'));
