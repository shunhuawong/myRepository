define('jira/ajs/select/security-level-select', [
    'jira/issue',
    'jira/featureflags/feature-manager',
    'jira/ajs/select/security/default-comment-security-level-control',
    'jira/ajs/select/security/select-adapter',
    'jira/ajs/select/dropdown-select',
    'jquery'
], function(
    Issue,
    DarkFeatures,
    DefaultCommentSecurityLevelControl,
    SecuritySelectAdapter,
    DropdownSelect,
    jQuery
) {

    /**
     * Provides a menu specifically for the comment security level.
     *
     * @class SecurityLevelSelect
     * @extends DropdownSelect
     */
    return DropdownSelect.extend({

        /** @type {jQuery} */ $securityLevelDiv: null,
        /** @type {jQuery} */ $commentLevelSelect: null,
        /** @type {jQuery} */ $triggerIcon: null,
        /** @type {jQuery} */ $currentLevelSpan: null,
        /** @type {boolean} */ defaultEnabled: false,
        /** @type {boolean} */ loadDefault: false,
        /** @type {DefaultCommentSecurityLevelControl} */ _defaultSecurityLevelControl: null,

        _createFurniture: function() {
            AJS.populateParameters();

            this._super();
        },

        /**
         *
         * @param {HTMLElement} commentLevelSelect
         * @constructs
         */
        init: function(commentLevelSelect) {
            this._super(commentLevelSelect);

            var $commentLevelSelect = jQuery(commentLevelSelect);
            this.$securityLevelDiv = $commentLevelSelect.parent();
            this.$triggerIcon = this.$securityLevelDiv.find(".security-level-drop-icon");
            this.$currentLevelSpan = this.$securityLevelDiv.find(".current-level");

            this.defaultEnabled = $commentLevelSelect.data('enable-default') ? true : false;
            this.applyDefault = $commentLevelSelect.data('apply-default') ? true : false;

            this.model.$element.bind('change', function whenChangedUpdateView(event, selectionDescriptor) {
                this._updateView(selectionDescriptor);
            }.bind(this));

            if (this.defaultEnabled && DarkFeatures.isFeatureEnabled('viewissue.comment.defaultlevel')) {
                var $defaultCommentLevelSpan = this.$securityLevelDiv.find(".default-comment-level");
                var $commentInlineErrorSpan = this.$securityLevelDiv.next(".security-level-inline-error");

                this._defaultSecurityLevelControl = new DefaultCommentSecurityLevelControl(
                    $defaultCommentLevelSpan,
                    $commentInlineErrorSpan,
                    new SecuritySelectAdapter(this.model)
                );

                this._defaultSecurityLevelControl.loadAndApplyDefault(this.applyDefault);

                this.model.$element.bind('change', function whenChangedFlushView(event, selectionDescriptor) {
                    this._defaultSecurityLevelControl.flushViewWithNewControl(selectionDescriptor);
                }.bind(this));
            }
        },

        /**
         *
         * @param {ItemDescriptor} selectionDescriptor
         * @private
         */
        _updateView: function(selectionDescriptor) {

            var commentIsViewableByAllUsers = selectionDescriptor.value() == "";

            if(commentIsViewableByAllUsers) {
                this.$triggerIcon.removeClass("aui-iconfont-locked").addClass("aui-iconfont-unlocked");

                var securityLevelViewableByAll = AJS.I18n.getText("security.level.viewable.by.all");
                this.$triggerIcon.text(AJS.I18n.getText("security.level.explanation", securityLevelViewableByAll));
                this.$currentLevelSpan.text(securityLevelViewableByAll);

            } else {
                this.$triggerIcon.removeClass("aui-iconfont-unlocked").addClass("aui-iconfont-locked");

                var htmlEscapedLabel = jQuery("<div/>").text(selectionDescriptor.label()).html();
                var specificSecurityLevelAsHtmlFormat = AJS.format(AJS.I18n.getText("security.level.restricted.to"), htmlEscapedLabel);
                var stripHtmlSecurityLevelLabel = jQuery("<div/>").html(specificSecurityLevelAsHtmlFormat).text();
                this.$triggerIcon.text(AJS.I18n.getText("security.level.explanation", stripHtmlSecurityLevelLabel));
                this.$currentLevelSpan.html(specificSecurityLevelAsHtmlFormat);
            }
        },

        /**
         *
         * @param {Event} e
         * @private
         */
        _handleDownKey: function(e) {
            //if the dropdown isn't open yet, pressing down should open it!
            if(e.keyCode === jQuery.ui.keyCode.DOWN && !this.dropdownController.isVisible()) {
                e.preventDefault();
                e.stopPropagation();
                this.show();
            }
        },

        /**
         * manual user select
         *
         * @param {HTMLElement} selected - <li class="active"/>
         * @private
         */
        _selectionHandler: function(selected) {
            this._super(selected);
            var lastSelection = selected.data("descriptor").value();
            if (this._defaultSecurityLevelControl) {
                this._defaultSecurityLevelControl.selectionChanged();
            }
            this._sendSelectionChangedAnalytics(lastSelection, selected.data("descriptor").value());
        },

        /**
         *
         * @param {String} lvlValue
         * @private
         */
        _sendSelectionChangedAnalytics: function(lastSelection, newSelection) {
            AJS.trigger('analyticsEvent', {
                name: "jira.issue.comment.level.changed",
                data: {
                    issueId: Issue.getIssueId(),
                    lastSelection: lastSelection,
                    newSelection: newSelection
                }
            });
        },

        /**
         *
         * @see Control
         */
        _events: {
            trigger:  {
                keydown: function (e) {
                    this._handleDownKey(e);
                },
                keypress: function (e) {
                    this._handleDownKey(e);
                }
            }
        }
    });

});

/** Preserve legacy namespace
    @deprecated AJS.SecurityLevel*/
AJS.namespace("AJS.SecurityLevel", null, require('jira/ajs/select/security-level-select'));
AJS.namespace('AJS.SecurityLevelSelect', null, require('jira/ajs/select/security-level-select'));
