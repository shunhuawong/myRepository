define('jira/field/single-issue-picker', [
    'jira/ajs/select/single-select',
    'jira/ajs/list/group-descriptor',
    'jira/ajs/list/item-descriptor',
    'jira/ajs/ajax/smart-ajax',
    'jquery'
], function(
    SingleSelect,
    GroupDescriptor,
    ItemDescriptor,
    SmartAjax,
    jQuery
) {
    /**
     * A single select for querying and selecting issue. Issue can also be selected via a popup.
     * additional parameter
     * @param {String} [options.skipKeys] - List of comma separated issue keys to exclude from search result.
     *
     * @class SingleIssuePicker
     * @extends MultiSelect
     */
    var SingleIssuePicker = SingleSelect.extend({
        /**
         *
         * Note: We could probably have the server return in a format that can be digested by appendOptionsFromJSON, but
         * we currently have a legacy issue picker that uses the same end point.
         *
         * @param {Object} response
         */
        _formatResponse: function (response) {
            var ret = [],
                canonicalBaseUrl = (function(){
                    var uri = parseUri(window.location);
                    return uri.protocol + "://" + uri.authority;
                })();
            if (response && response.sections) {
                //skip current search only if history search is not empty
                var skipCs = false;
                jQuery(response.sections).each(function(i, section) {
                    if( section.id==='hs' ) {
                        if (section.issues && section.issues.length > 0) {
                            skipCs = true;
                        }
                    }
                });

                jQuery(response.sections).each(function (i, section) {
                    if (!(section.id === 'cs' && skipCs)) {
                        var groupDescriptor = new GroupDescriptor({
                            weight: i, // order or groups in suggestions dropdown
                            label: section.label, // Heading of group
                            description: section.sub // description for the group heading
                        });

                        if (section.issues && section.issues.length > 0) {

                            jQuery(section.issues).each(function () {
                                groupDescriptor.addItem(new ItemDescriptor({
                                    highlighted: true,
                                    value: this.key, // value of item added to select
                                    label: this.key + " - " + this.summaryText, // title of lozenge
                                    icon: this.img ? canonicalBaseUrl + contextPath + this.img : null, // Need to have the canonicalBaseUrl for IE7 to avoid mixed content warnings when viewing the issuepicker over https
                                    html: this.keyHtml + " - " + this.summary // html used in suggestion
                                }));
                            });
                        }

                        ret.push(groupDescriptor);
                    }
                });
            }

            return ret;
        },


        /**
         * Gets default options
         *
         * @protected
         * @return {Object}
         */
        _getDefaultOptions: function () {
            return jQuery.extend(true, this._super(), {
                ajaxOptions: {
                    formatResponse: this._formatResponse.bind(this)
                    ,error: function()   {
                        this.showErrorMessagePlain(this.buildHttpErrorMessage(arguments[3]));
                    }.bind(this)
                }
            });
        },

        /**
         * Adds popup link next to picker and assigns event to open popup window
         *
         * @param {Boolean} disabled - Adds a standard text box instead of ajax picker if set to true
         * @override
         */
        _createFurniture: function (disabled) {
            this._super(disabled);
            this.$container.addClass('jira-issue-picker');
            this.$container.addClass('hasIcon');
        },

        _setOptions: function (options) {
            this._super(options);
            var skipKeys = this.options.skipKeys || "";
            this.options.ajaxOptions.data.currentJQL = "";
            if (skipKeys !== '') {
                this.options.ajaxOptions.data.currentJQL = "issuekey not in (" + this.options.skipKeys + ")";
            }

            return undefined;
        },

        /**
         * changes project currently allowed for searching
         * @param projectId
         */
        setCurrentProjectId: function(projectId) {
            this.options.ajaxOptions.data.currentProjectId = projectId;
        },

        getQueryVal: function () {
            return jQuery.trim(this.$field.val());
        },

        showErrorMessagePlain: function (value) {
            var $container = this.$container.parent(".field-group"); // aui container

            this.hideErrorMessage(); // remove old

            this.$errorMessage.text(value);

            if ($container.length === 1) {
                $container.append(this.$errorMessage);
                return;
            }

            if ($container.length === 0) {
                $container = this.$container.parent(".frother-control-renderer"); // not in aui but JIRA renderer
            }

            if ($container.length === 1) {
                this.$errorMessage.prependTo($container);
                return;
            }

            if ($container.length === 0) {
                this.$container.parent().append(this.$errorMessage);
            }
        },

        buildHttpErrorMessage: function(smartAjaxResult) {
            // We might be inside an <iframe>, e.g., gadgets, so use the top level AJS.
            var AJS = window.top.AJS;
            var errMsg;
            if (smartAjaxResult.statusText === SmartAjax.SmartAjaxResult.TIMEOUT) {
                errMsg = AJS.I18n.getText("common.forms.ajax.timeout");
            } else if (smartAjaxResult.status === 401) {
                errMsg = AJS.I18n.getText('common.forms.ajax.unauthorised.alert');
            } else if (smartAjaxResult.hasData) {
                errMsg = AJS.I18n.getText("common.forms.ajax.servererror");
            } else {
                errMsg = AJS.I18n.getText("common.forms.ajax.commserror");
            }
            return errMsg;
        }
    });

    return SingleIssuePicker;
});
