define('jira/ajs/select/security/select-adapter', [
    'jira/lib/class'
], function(
    Class
) {
    /**
     *
     * @class SecuritySelectAdapter
     * @extends Class
     * @private
     */
    return Class.extend({

        /** @type {SelectModel} */ _selectedModel: null,

        /**
         *
         * @param {SelectModel} selectModel
         */
        init: function(selectModel) {
            this._selectModel = selectModel;
        },

        /**
         *
         * @param {String} level
         * @returns {boolean}
         */
        hasSecurityLevel: function(level) {
            return this._selectModel.hasOptionByValue(level);
        },

        /**
         *
         * @param {String} text
         */
        selectUnavailble: function(text) {
            this._selectModel.putOption('none', text, true);
            this._selectModel.changeSelectionByValue('none');
        },

        /**
         *
         * @param {String} level
         */
        selectLevel: function(level) {
            this._selectModel.changeSelectionByValue(level);
        },

        /**
         *
         * @returns {String}
         */
        repickSelection: function() {
            this._selectModel.changeSelectionByValue(this.getSelectedLevel());
        },

        /**
         *
         * @returns {String}
         */
        getSelectedLevel: function() {
            return this._selectModel.getSelectedValues()[0];
        },

        /**
         *
         * @returns {String}
         */
        getSelectedLevelName: function() {
            return this._selectModel.getSelectedTexts()[0];
        }
    });
});
