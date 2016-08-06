/**
 * Utility functions for handling behaviour of and data in HTML forms.
 * @module jira/util/forms
 */
define('jira/util/forms', [
    'jira/util/navigator',
    'jquery'
], function(
    jiraNavigator,
    jQuery
) {
    'use strict';

    return /** @alias module:jira/util/forms */ {
        /**
         * Submits an element's form if the enter key is pressed
         */
        submitOnEnter: function submitOnEnter(e)
        {
            if (e.keyCode === 13 && e.target.form && !e.ctrlKey && ! e.shiftKey)
            {
                jQuery(e.target.form).submit();
                return false;
            }
            return true;
        },

        /**
         * Submits an element's form if the enter key and the control key is pressed
         */
        submitOnCtrlEnter: function submitOnCtrlEnter(e)
        {
            /*
             * JRA-45439: Restricts accepting keyCode 10 to Windows and Linux, because only some browsers in Windows and Linux
             * send keyCode 10 when Ctrl+Enter is clicked, while Ctrl+J sends keyCode 10 in Mac environment. See also the table
             * mapping our supported browsers and keyCode sent when Ctrl+Enter is clicked:
             *   - IE/WIN:        10
             *   - Chrome/Win:    10
             *   - Firefox/WIN:   13
             *   - Firefox/Linux: 10
             *   - Chrome/Mac:    13
             *   - Firefox/Mac:   13
             *   - Safari/Mac:    13
             */
            if (e.ctrlKey && e.target.form && (e.keyCode === 13 || (!jiraNavigator.isMac() && (e.keyCode === 10))))
            {
                jQuery(e.target.form).submit();
                return false;
            }
            return true;
        },

        /**
         * Returns a space-delimited value of a select list. There's strangely no in-built way of doing this for multi-selects.
         * @param {HTMLSelectElement} selectObject the &lt;select&rt; element
         * @returns {String}
         */
        getMultiSelectValues: function getMultiSelectValues(selectObject)
        {
            var selectedValues = '';
            for (var i = 0; i < selectObject.length; i++)
            {
                if (selectObject.options[i].selected)
                {
                    if (selectObject.options[i].value && selectObject.options[i].value.length > 0) {
                        selectedValues = selectedValues + ' ' + selectObject.options[i].value;
                    }
                }
            }

            return selectedValues;
        },

        /**
         * Returns an array of values from a select list.
         * @param {HTMLSelectElement} selectObject the &lt;select&rt; element
         * @returns {Array}
         */
        getMultiSelectValuesAsArray: function getMultiSelectValuesAsArray(selectObject)
        {
            var selectedValues = [];
            for (var i = 0; i < selectObject.length; i++)
            {
                if (selectObject.options[i].selected)
                {
                    if (selectObject.options[i].value && selectObject.options[i].value.length > 0) {
                        selectedValues[selectedValues.length] = selectObject.options[i].value;
                    }
                }
            }
            return selectedValues;
        }
    };

});
