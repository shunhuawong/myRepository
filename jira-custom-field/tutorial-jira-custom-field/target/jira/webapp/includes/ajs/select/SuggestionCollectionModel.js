define('jira/ajs/select/suggestion-collection-model', [
    'jira/ajs/control',
    'jira/ajs/list/group-descriptor',
    'jira/ajs/list/item-descriptor',
    'jira/util/objects',
    'jquery',
    'underscore'
], function(
    Control,
    GroupDescriptor,
    ItemDescriptor,
    Objects,
    jQuery,
    _
) {
    /**
     * A model representing selectable suggestions with interface consistent with {@link SelectModel}
     *
     * SuggestionCollectionModel parses descriptors in JSON format that are inside a tag with ID constructed from provided element ID
     * (ID of element + '-options'). Refer to {@link _parseDescriptors} for more details
     *
     *
     * @class SuggestionCollectionModel
     * @extends Control
     */

    return Control.extend({
        /**
         * Sets some defaults and parses all options, and option group into {@link GroupDescriptors} and {@link ItemDescriptor}.
         *
         * @constructs
         */
        init: function (options) {
            if (options.element) {
                options.element = jQuery(options.element);
            } else {
                options.element = jQuery(options);
            }

            this._setOptions(options);

            this.$element = this.options.element.hide();

            this.type = this.$element.attr("data-multiple") ? "multiple" : "single";
            this.id = this.$element.attr("id") ||
                    this.$element.attr("name");

            this.$optionsContainer = this.$element.siblings('#'+this.id+'-options');
            //selected descriptors will be kept as reference
            this.selectedDescriptors = [];
            this.groupFilter = false;
            this._parseDescriptors();
        },

        /**
         * Gets default options
         *
         * @return {Object}
         */
        _getDefaultOptions: function () {
            return {};
        },

        /**
         * Sets value based on selected descriptors
         *
         * @returns {String} new value
         */

        _setValue: function() {
            var values = this.selectedDescriptors.map(function(item) {
                return item.value();
            });

            this.$element.val(values.join(','));
        },


        /**
         * Returns all the selected values
         *
         * @return {Array}
         */
        getSelectedValues: function () {
            var selectedVals = [];

            for (var i=0; i < this.selectedDescriptors.length; i++) {
                selectedVals.push(this.selectedDescriptors[i].value());
            }
            return selectedVals;
        },

        /**
         * Used to set selected state on option. In the case of a single select this will remove the selected property
         * from all other options.
         *
         * @param {Object/string} descriptor - JSON object describing option. E.g. {label: "one", value: 1}
         * @param {boolean} triggerChangeEvent - should selection change trigger underlying DOM element change event
         * @return {boolean} false if such descriptor cannot be found
         */
        setSelected: function (descriptor, triggerChangeEvent) {
            triggerChangeEvent = typeof triggerChangeEvent !== 'undefined' ? triggerChangeEvent : true;
            descriptor = this._descriptor(descriptor);

            var descriptors = _.filter(this.getAllDescriptors(false),function(item) {
                return item.value() === descriptor.value();
            });

            if (descriptors.length === 0) {
                return false;
            }

            if (this.type === "single") {
                if (descriptor.value() === this.getValue()) {
                    //there is no need to update, but descriptor is present in collection
                    return true;
                }

                this.setAllUnSelected();
                //only select one descriptor:
                descriptors = descriptors.slice(0,1);
            }
            else {
                //filter already selected descriptors
                //Note: we cannot do it faster because we have to return true if descriptor is present in collection

                descriptors = _.filter(descriptors,function(item) {
                    return item.selected() !== true;
                });
            }

            Array.prototype.push.apply(this.selectedDescriptors, descriptors);

            _.each(descriptors, function(item) {
                item.selected(true);
            });

            this._setValue();

            /**
             * Remove highlighting. If this {@link ItemDescriptor} is reused, the old highlighting will appear.
             * {@link List.prototype._filterOptions} -- Highlighted item are passed straight through
             * to the suggestions list.
             */
            descriptor.highlighted(false);

            if (triggerChangeEvent) {
                // We need to manually fire the change event as this doesn't fire when we programmatically change the value.
                this.$element.trigger('change', descriptor);
            }

            return true;
        },

        /**
         * Sets all options to selected
         *
         * @private
         */
        setAllSelected: function () {
            var instance = this;
            jQuery(this.getDisplayableUnSelectedDescriptors()).each(function () {
                instance.setSelected(this);
            });
        },

        /**
         * Sets all options to unselected
         *
         * @private
         */
        setAllUnSelected: function () {
            _.each(this.selectedDescriptors, function(descriptor) {
                descriptor.selected(false);
            });
            this.selectedDescriptors = [];
            this._setValue();
        },

        /**
         * Used to set unselected an option. Note, this will unselect and option with the same value also.
         *
         * @param {Object} descriptor - JSON object decribing option
         */
        setUnSelected: function (descriptor) {
            descriptor = this._descriptor(descriptor);

            for (var i = 0; i < this.selectedDescriptors.length; i++) {
                if (this.selectedDescriptors[i].value() === descriptor.value()) {
                    this.selectedDescriptors[i].selected(false);
                    this.selectedDescriptors.splice(i, 1);
                    i--;
                }
            }

            this._setValue();
        },

        /**
         * Removes corresponding descriptors from collection. Note that it will remove all descriptors with provided value
         *
         * @param {Object/string} descriptor - JSON object decribing option or string representing value
         */
        remove: function (descriptor) {
            descriptor = this._descriptor(descriptor);

            for (var i = 0; i < this.descriptors.length; i++) {
                if (this.descriptors[i] instanceof GroupDescriptor) {
                    for (var j = 0; j < this.descriptors[i].items().length; j++) {
                        if (this.descriptors[i].items()[j].value() === descriptor.value()) {
                            this.descriptors[i].items().splice(j, 1);
                            j--;
                        }
                    }
                }
                else if (this.descriptors[i].value() === descriptor.value()) {
                    this.descriptors.splice(i, 1);
                    i--;
                }
            }
        },

        /**
         * Loops over all unselected descriptors searching for one that either matches the value or label of argument
         *
         * @param {String} value - value or label to test against
         * @return {Object} descriptor
         */
        getDescriptor: function (value) {
            var returnDescriptor;

            value = jQuery.trim(value.toLowerCase());

            jQuery.each(this.getAllDescriptors(false), function (e, descriptor) {
                if (value === jQuery.trim(descriptor.label().toLowerCase()) ||
                        value === jQuery.trim(descriptor.value().toLowerCase())) {
                    returnDescriptor = descriptor;
                    return false; //bail out of loop, we are done
                }
            });

            return returnDescriptor;
        },

        /**
         * Builds object representation using {@link GroupDescriptor} and {@link ItemDescriptor}
         */
        _parseDescriptors: function () {
            var group, items, options = [];
            options = this.$optionsContainer.data("suggestions") || [];
            this.descriptors = [];

            /**
             * jQuery 1.7.2 uses wrong regexp for checking if data-* attribute value is a JSON expression.
             * It basically considers JSON containing newlines as invalid. This bug results in options variable
             * being a string even though it is a valid JSON. Let's fix it. This should be removed after jQuery upgrade.
             * See: JRA-59212, https://bugs.jquery.com/ticket/10863
             */
            if (typeof options === 'string') {
                try {
                    options = JSON.parse(options);
                    this.$optionsContainer.data("suggestions", options);
                } catch (e) {
                    options = [];
                }
            }

            for (var i = 0; i < options.length; i++) {
                if (typeof options[i].items !== 'undefined') {
                    //option is a group
                    group = new GroupDescriptor({
                        label: options[i].label
                    });

                    items = options[i].items;

                    for (var j = 0; j < items.length; j++) {
                        var item = new ItemDescriptor(items[j]);

                        if (item.selected() === true) {
                            if (this.type === 'single' && this.selectedDescriptors.length > 0) {
                                item.selected(false);
                            }
                            else {
                                this.selectedDescriptors.push(item);
                            }
                        }

                        group.addItem(item);
                    }

                    this.descriptors.push(group);
                }
                else {
                    item = new ItemDescriptor(options[i]);

                    this.descriptors.push(item);

                    if (item.selected() === true) {
                        if (this.type === 'single' && this.selectedDescriptors.length > 0) {
                            item.selected(false);
                        }
                        else {
                            this.selectedDescriptors.push(item);
                        }
                    }
                }
            }
            this._setValue();
        },

        getPlaceholder: function () {
            return this.placeholder;
        },

        /**
         * Gets value
         *
         * @return {String | Array}
         */
        getValue: function () {
            return this.$element.val();
        },

        /**
         * Gets an array of JSON descriptors for selected options
         *
         * @return {Array}
         */
        getDisplayableSelectedDescriptors: function () {
            return this.selectedDescriptors.slice();
        },

        /**
         * Gets an array of JSON descriptors for unselected options
         *
         * @return {Array}
         */
        getDisplayableUnSelectedDescriptors: function () {
            return _.filter(this.getAllDescriptors(false),function(item) {
                return this.selectedDescriptors.indexOf(item) === -1;
            }.bind(this));
        },

        /**
         * Gets an array of all descriptors, selected and unselected. These are filter by group
         *
         * @param {boolean} showGroups - If set to false will not include group descriptors
         * @return {Array}
         */
        getAllDescriptors: function (showGroups) {
            var descriptors = [];

            if (this.groupFilter !== false) {
                for (var key in this.descriptors) {
                    if (this.descriptors[key] instanceof GroupDescriptor && this.descriptors[key].label() == this.groupFilter) {
                        descriptors = this.descriptors[key].items().slice();
                    }
                }
            }
            else if (showGroups === false) {
                for (var key in this.descriptors) {
                    if (this.descriptors[key] instanceof GroupDescriptor) {
                        descriptors = descriptors.concat(this.descriptors[key].items());
                    }
                    else if (this.descriptors.hasOwnProperty(key)) {
                        descriptors.push(this.descriptors[key]);
                    }
                }
            }
            else {
                //returning copy to preserve original array
                descriptors = this.descriptors.slice();
            }
            return descriptors;
        },

        /**
         * Removes all unselected options
         */
        clearUnSelected: function () {
            var instance = this;

            this.descriptors = _.filter(this.descriptors, function(group) {
                if (group instanceof GroupDescriptor) {

                    group.items(_.filter(group.items(),function(item) {
                        return instance.selectedDescriptors.indexOf(item) !== -1;
                    }));
                    return true;
                }
                return instance.selectedDescriptors.indexOf(group) !== -1;
            });
        },

        /**
         * Gets an array of JSON descriptors for unselected options.
         * Additionaly filters descriptors with same value as selected descriptors
         *
         * @return {Array}
         */
        getUnSelectedDescriptors: function () {
            var instance = this,
                descriptors = [],
                addedValues = {},
                selectedValues = {},
                filterDescriptors = function(descriptor) {
                    var descriptorVal = descriptor.value().toLowerCase();
                    if (selectedValues[descriptorVal] &&
                       (!addedValues[descriptorVal] || descriptor.allowDuplicate() !== false)) {
                        return false;
                    }
                    addedValues[descriptorVal] = true;
                    return true;
                };

            for (var i = 0; i < this.selectedDescriptors.length; i++) {
                selectedValues[this.selectedDescriptors[i].value().toLowerCase()] = true;
            }

            _.each(this.descriptors, function(item) {
                var properties;

                if (item instanceof GroupDescriptor) {
                    if (instance.groupFilter === false) {
                        //create a copy
                        properties = _.clone(item.allProperties());
                        properties.items = _.filter(item.items(),filterDescriptors);
                        descriptors.push(new GroupDescriptor(properties));
                    }
                    else if (instance.groupFilter === item.label()) {
                        //just push descriptors wihtout GroupDescriptor
                        descriptors = descriptors.concat(_.filter(item.items(),filterDescriptors));
                    }
                }
                else if (instance.groupFilter === false && filterDescriptors(item)) {
                    descriptors.push(item);
                }
            });

            return descriptors;
        },

        /**
         * Sets group label that will be used to filter descriptors (getUnSelectedDescriptors)
         *
         * @param {String} group
         * @returns boolean
         */
        setFilterGroup: function(group) {
            for (var i = 0; i < this.descriptors.length; i++) {
                if (this.descriptors[i] instanceof GroupDescriptor) {
                    if (this.descriptors[i].label() === group) {
                        this.groupFilter = group;
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Clears group filter
         */
        clearFilterGroup: function() {
            this.groupFilter = false;
        },

        /**
         * Changes string value to {@link ItemDescriptor}, leaves other values as they are
         *
         * @param {string} descriptor
         * @return {ItemDescriptor}
         */
        _descriptor: function(descriptor) {
            if (typeof descriptor === "string") {
                descriptor = new ItemDescriptor({
                    value: descriptor,
                    label: descriptor
                });
            }
            return descriptor;
        }
    });
});