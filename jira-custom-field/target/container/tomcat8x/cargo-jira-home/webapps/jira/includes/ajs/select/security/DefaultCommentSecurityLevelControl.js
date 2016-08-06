define('jira/ajs/select/security/default-comment-security-level-control', [
    'jira/ajs/select/security/default-comment-security-level-model',
    'jira/ajs/ajax/smart-ajax',
    'jira/dialog/form-dialog',
    'jira/lib/class',
    'jquery',
    "underscore"
], function(
    DefaultCommentSecurityLevelModel,
    SmartAjax,
    FormDialog,
    Class,
    jQuery,
    _
) {
    var helpLink = WRM.data.claim('jira.webresources:default-comment-security-level.DefaultCommentSecurityLevelHelpLink');

    /**
     *
     * @class DefaultCommentSecurityLevelControl
     * @extends Class
     */
    return Class.extend({

        /**
         * @inner
         * @private
         * @class _InitialLoadDefaultLevelView
         */
        _InitialLoadDefaultLevelView: Class.extend({

            /**
             *
             * @param {jQuery} $containerSpan
             * @constructs
             */
            init: function($containerSpan) {
                this.$containerSpan = $containerSpan;
            },

            startLoading: function() {
                this.$containerSpan.html(JIRA.Templates.CommentSecurityLevel.initialLoadDefaultStart());
                this.$containerSpan.find('.default-comment-level-spinner').spin({top: '0px', left: '0px'});
            },

            endLoading: function() {
                this.$containerSpan.find('.default-comment-level-load').addClass('hidden');
            }
        }),

        /**
         * @inner
         * @private
         * @class _SaveDefaultLevelControl
         */
        _SaveDefaultLevelControl: Class.extend({

            /**
             *
             * @param {jQuery} $containerSpan
             * @param {DefaultCommentSecurityLevelModel} defaultLevelModel
             * @param {LvlObj} currentSelection
             * @constructs
             */
            init: function($containerSpan, defaultLevelModel, currentSelection) {
                this.$containerSpan = $containerSpan;
                this.defaultLevelModel = defaultLevelModel;
                this.currentSelection = currentSelection;

                this._putLinkToSetDefault();
                this._putHelpLink();
            },

            /**
             *
             * @private
             */
            _putLinkToSetDefault: function() {
                this.$containerSpan.append(JIRA.Templates.CommentSecurityLevel.linkToSetDefault());
                this.$containerSpan.find('.default-comment-level-switch').bind('click', function(e) {
                    e.preventDefault();
                    this._onUpdateBegin();
                    this.defaultLevelModel.updateDefault(
                        this.currentSelection,
                        this._onUpdateSuccess.bind(this),
                        this._onUpdateFail.bind(this)
                    );
                }.bind(this));
            },

            /**
             *
             * @private
             */
            _putHelpLink: function() {
                this.$containerSpan.append(JIRA.Templates.Links.helpLink(helpLink));

                var helpElem = this.$containerSpan.find('.default-comment-level-help');
                helpElem.attr('title', AJS.I18n.getText('security.level.default.set.current.tooltip'));
                helpElem.tooltip({trigger: 'hover', gravity: 'nw', fade: true});
            },

            /**
             * @callback StatusSpanData
             * @param {String} text - text to show in span
             * @param {String} status - status to put in span data argument
             * @param {String} span_classes - 1 line classes string appended to container span
             * @param {String} icon_classes - 1 line classes string appended to icon span
             * @param {String} text_classes - 1 line classes string appended to text span
             */

            /**
             * @param {StatusSpanData} data
             * @private
             */
            _putStatusSpan: function(data) {
                this.$containerSpan.html(JIRA.Templates.CommentSecurityLevel.defaultLevelStatus(data));
                var $defaultLevelMessageStatus = this.$containerSpan.find('.default-comment-level-status');
                $defaultLevelMessageStatus.attr('status', data.status);
                setTimeout(function() {
                    $defaultLevelMessageStatus.addClass('fade-out');
                }, 2000);
            },

            _onUpdateBegin: function() {
                this.$containerSpan.find('.default-comment-level-switch').addClass('disabled-link');
                if (this.$containerSpan.find('.default-comment-level-spinner').length == 0) {
                    this.$containerSpan.prepend(JIRA.Templates.CommentSecurityLevel.defaultLevelSpinner());
                    this.$containerSpan.find('.default-comment-level-spinner').spin();
                }
            },

            _onUpdateSuccess: function() {
                this._putStatusSpan({
                    text: AJS.I18n.getText('common.words.done'),
                    status: 'success',
                    span_classes: '',
                    icon_classes: 'aui-icon aui-icon-small aui-iconfont-approve',
                    text_classes: 'default-saved-message'
                });
            },

            _onUpdateFail: function(xhr) {
                new FormDialog({
                    content: SmartAjax.buildDialogErrorContent(xhr)
                }).show();
                this.$containerSpan.find('.default-comment-level-spinner').remove();
                this.$containerSpan.find('.default-comment-level-switch').removeClass('disabled-link');
            }
        }),

        /** @type {boolean} */ enabled: true,
        /** @type {String} */ projectId: null,
        /** @type {jQuery} */ $rootSpan: null,
        /** @type {jQuery} */ $errorSpan: null,
        /** @type {SecuritySelectAdapter} */ selectionSpi: null,
        /** @type {DefaultCommentSecurityLevelModel} */ defaultLevelModel: null,

        /**
         *
         * @param {jQuery} $defaultCommentLevelSpan
         * @param {jQuery} $errorSpan
         * @param {SecuritySelectAdapter} selectionSpi
         * @constructs
         */
        init: function($defaultCommentLevelSpan, $errorSpan, selectionSpi) {
            this.$rootSpan = $defaultCommentLevelSpan;
            this.$errorSpan = $errorSpan;
            this.projectId = $defaultCommentLevelSpan.data('project-id');

            if (!_.isNumber(this.projectId)) {
                this.enabled = false;
                return;
            }

            this.selChanged = false;

            this.selectionSpi = selectionSpi;

            this.defaultLevelModel = new DefaultCommentSecurityLevelModel(this.projectId);
        },

        selectionChanged: function() {
            this.selChanged = true;
        },

        loadAndApplyDefault: function(apply) {
            if (apply) {
                this.selectionSpi.selectUnavailble(AJS.I18n.getText('common.words.unknown'));
            }
            var $defaultCommentLevelContainer = this._createContainer();
            var initDefaultView = new this._InitialLoadDefaultLevelView($defaultCommentLevelContainer);
            initDefaultView.startLoading();
            this.defaultLevelModel.getDefault(
                function success(lvlObj) {
                    if (!apply) {
                        this.selectionSpi.repickSelection(); // to refresh view
                    } else if (!this.selChanged) {
                        this._applyDefaultToSelection(lvlObj);
                    }
                    initDefaultView.endLoading();
                }.bind(this),
                function error(xhr) {
                    new FormDialog({
                        content: SmartAjax.buildDialogErrorContent(xhr)
                    }).show();
                    initDefaultView.endLoading();
                }.bind(this)
            );
        },

        /**
         *
         * @param {ItemDescriptor} selectionDescriptor
         */
        flushViewWithNewControl: function(selectionDescriptor) {
            var defaultLevel = this.defaultLevelModel.getCurrentDefault();
            if (defaultLevel && selectionDescriptor.value() != defaultLevel.level && selectionDescriptor.value() != 'none') {

                var $defaultCommentLevelContainer = this._createContainer();

                var currentSelection = new this.defaultLevelModel.LvlObj(
                    selectionDescriptor.value(),
                    selectionDescriptor.label()
                );
                new this._SaveDefaultLevelControl($defaultCommentLevelContainer, this.defaultLevelModel, currentSelection);

            } else {
                this.$rootSpan.empty();
            }
            this.$errorSpan.empty();
        },

        /**
         *
         * @param {LvlObj} lvlObj
         * @private
         */
        _applyDefaultToSelection: function(lvlObj) {
            if (!this.selectionSpi.hasSecurityLevel(lvlObj.level)) {
                this.selectionSpi.selectUnavailble(lvlObj.levelName);

                this.$errorSpan.html(JIRA.Templates.CommentSecurityLevel.unavailable({'name': lvlObj.levelName}));

            } else {
                this.selectionSpi.selectLevel(lvlObj.level);

                var presentLevelName = this.selectionSpi.getSelectedLevelName();

                if (presentLevelName != lvlObj.levelName) {
                    lvlObj.levelName = presentLevelName;
                    this.defaultLevelModel.updateDefault(lvlObj, function(){}, function(){});
                }
            }
        },

        /**
         *
         * @returns {jQuery}
         * @private
         */
        _createContainer: function() {
            var $container = jQuery(JIRA.Templates.CommentSecurityLevel.defaultLevelContainer());
            this.$rootSpan.html($container);
            return $container;
        }

    });
});