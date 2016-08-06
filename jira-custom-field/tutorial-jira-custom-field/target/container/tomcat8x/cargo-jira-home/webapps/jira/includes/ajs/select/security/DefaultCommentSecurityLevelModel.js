define('jira/ajs/select/security/default-comment-security-level-model', [
    'jira/lib/class',
    'jquery',
    'wrm/context-path'
], function(
    Class,
    jQuery,
    contextPath
) {

    /**
     * Manages default security level api calls
     *
     * @class DefaultCommentSecurityLevelModel
     * @extends Class
     **/
    return Class.extend({

        DEFAULT_COMMENT_SECURITY_LEVEL_KEY_PREFIX: "default-comment-security-level-",

        /** @type {LvlObj} */ _currentDefault: null,
        /** @type {String} */ _preferenceKey: null,

        /**
         *
         * @param {String} projectId
         * @constructs
         */
        init: function(projectId) {
            this.NOT_SELECTED_DEFAULT = new this.LvlObj("", "");
            this._preferenceKey = this.DEFAULT_COMMENT_SECURITY_LEVEL_KEY_PREFIX + projectId;
        },

        /**
         * Object used for storage of default security level
         *
         * @param {String} level - e.g. "role:10123"
         * @param {String} levelName - text to display
         * @class LvlObj
         */
        LvlObj: function(level, levelName) {
            this.level = level;
            this.levelName = levelName;
        },

        /**
         * Used to check for response error
         *
         * @param {Object} lvlObj
         * @returns {boolean}
         * @private
         */
        _isLvlObjValid: function(lvlObj) {
            return !(lvlObj['level'] == undefined || lvlObj['levelName'] == undefined);
        },

        /**
         * Store default security level object in current logged in users myPreferences
         *
         * @param {LvlObj} lvlObj
         * @returns {XMLHttpRequest}
         * @private
         */
        _getDefaultStoreRequest: function(lvlObj) {
            return jQuery.ajax({
                url: contextPath() + "/rest/api/2/mypreferences?key=" + this._preferenceKey,
                type: "PUT",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(lvlObj)
            });
        },

        /**
         * Load default security level object from current logged in users myPreferences by using REST API
         *
         * @returns {XMLHttpRequest}
         * @private
         */
        _getDefaultLoadRequest: function() {
            return jQuery.ajax({
                url: contextPath() + "/rest/api/2/mypreferences?key=" + this._preferenceKey,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            });
        },

        /**
         *
         * @param {LvlObj} lvlObj
         * @param {function()} onSuccess
         * @param {function(XMLHttpRequest)} onError
         */
        updateDefault: function(lvlObj, onSuccess, onError) {
            this._sendDefaultChangedAnalytics(lvlObj);
            this._getDefaultStoreRequest(lvlObj)
                .done(function done(data) { // data is empty on success
                    this._currentDefault = lvlObj;
                    onSuccess();
                }.bind(this))
                .fail(function fail(xhr) {
                    onError(xhr);
                });
        },

        /**
         *
         * @param {function(LvlObj)} onSuccess
         * @param {function(XMLHttpRequest)} onError
         */
        getDefault: function (onSuccess, onError) {
            if (this._currentDefault == null) {
                this._getDefaultLoadRequest()
                    .done(function done(data) {
                        if (this._isLvlObjValid(data)) {
                            this._currentDefault = data;
                        } else {
                            this._currentDefault = this.NOT_SELECTED_DEFAULT;
                        }
                        onSuccess(this._currentDefault);
                    }.bind(this))
                    .fail(function fail(xhr) {
                        if (xhr.status == 404) { // 404 means there was no default set yet
                            this._currentDefault = this.NOT_SELECTED_DEFAULT;
                            onSuccess(this._currentDefault);
                        } else {
                            onError(xhr);
                        }
                    }.bind(this));
            } else {
                onSuccess(this._currentDefault);
            }
        },

        /**
         *
         * @returns {LvlObj}
         */
        getCurrentDefault: function() {
            return this._currentDefault;
        },

        /**
         *
         * @param {LvlObj} lvlObj
         * @private
         */
        _sendDefaultChangedAnalytics: function(lvlObj) {
            AJS.trigger('analyticsEvent', {
                name: "jira.issue.comment.level.default.set",
                data: {
                    projectId: this.projectId,
                    issueId: JIRA.Issue.getIssueId(),
                    newDefault: lvlObj
                }
            });
        }
    });
});
