/**
 * Utility functions for parsing and manipulating string values.
 * @module jira/util/strings
 */
define('jira/util/strings', [
    'exports',
    'underscore'
], function(
    exports,
    _
) {
    'use strict';

    /**
     * Returns a boolean if the passed string is "true" or "false", ignoring case, else returns the original string.
     * @param {String} value
     * @returns {Boolean|String}
     * @since 5.0
     */
    exports.asBooleanOrString = function asBooleanOrString(value) {
        var lc = value ? value.toLowerCase() : '';
        var result = value;

        if (lc === 'true') {
            result = true;
        } else if (lc === 'false') {
            result = false;
        }

        return result;
    };

    /**
     * Looks up a search string from the beginning of the given string
     * @param str the given string
     * @param searchString search string
     * @returns {boolean} true if string starts with a search string.
     */
    exports.startsWith = function (str, searchString) {
        if (_.isEmpty(str)) {
            return false;
        }
        if (_.isEmpty(searchString)) {
            return false;
        }
        return str.indexOf(searchString) == 0;
    };

    /**
     * Check whether given string ends with a search string
     * @param str the given string
     * @param searchString search string
     * @returns {boolean} true if the given string ends with a search string
     */
    exports.endsWith = function (str, searchString) {
        if (_.isEmpty(str)) {
            return false;
        }
        if (_.isEmpty(searchString)) {
            return false;
        }
        return str.indexOf(searchString) + searchString.length == str.length;
    };

    /**
     * Looks up a search string in a given string, returns a substring of the given string after a full match.
     * @param str the given string
     * @param searchString search string
     * @returns {string} the substring of the given string after a full match. Returns empty string if the search string was not found.
     */
    exports.substringAfter = function (str, searchString) {
        if (_.isEmpty(str)) {
            return str;
        }
        if (_.isEmpty(searchString)) {
            return '';
        }
        var indexOf = str.indexOf(searchString);
        if (indexOf < 0) {
            return '';
        }
        return str.substring(indexOf + searchString.length);
    };

    /**
     * Looks up a search string in a given string, returns a substring of the given string before a full match.
     * @param str the given string
     * @param searchString search string
     * @returns {string} the substring of the given string before a full match. Returns empty string if the search string was not found.
     */
    exports.substringBefore = function (str, searchString) {
        if (_.isEmpty(str)) {
            return str;
        }
        if (_.isEmpty(searchString)) {
            return '';
        }
        var indexOf = str.indexOf(searchString);
        if (indexOf < 0) {
            return '';
        }
        return str.substring(0, indexOf);
    };

    /**
     * Looks up a search string in a given string.
     * @param str the given string
     * @param searchString search string
     * @returns {boolean} true, if substring exists in a given string.
     */
    exports.contains = function (str, searchString) {
        if (_.isEmpty(str)) {
            return false;
        }
        var indexOf = str.indexOf(searchString);
        return indexOf >= 0;
    };

    /**
     * Generates a new string by repeating the given string n times
     * @param str the given string
     * @param times times to repeat the given string
     * @returns {string} the generated string
     */
    exports.repeat = function (str, times) {
        if (_.isEmpty(str)) {
            return '';
        }
        return new Array(times + 1).join(str);
    };

    /**
     * Retuns the length of the string.
     * @param str string
     * @returns {int} length
     */
    exports.length = function (str) {
        if (_.isEmpty(str)) {
            return 0;
        }
        return str.length;
    };

    /**
     * Replaces each exact match of the searchString in a given string with a replaceString.
     * Does not support regular expressions.
     * @param str original string
     * @param searchString search string
     * @param replaceString replace string
     * @returns {string}
     */
    exports.replace = function (str, searchString, replaceString) {
        if (_.isEmpty(str)) {
            return ''
        }
        if (_.isEmpty(searchString)) {
            return ''
        }
        if (typeof replaceString === 'undefined') {
            replaceString = '';
        }

        var searchStart = 0;
        var i = str.indexOf(searchString);
        while (i >= 0) {
            var beforeOccurrence = str.substring(0, i);
            var afterOccurrence = str.substring(i + searchString.length);
            str = beforeOccurrence + replaceString + afterOccurrence;

            searchStart = i + replaceString.length;
            i = str.indexOf(searchString, searchStart);
        }
        return str.substring(i, str.length);
    };

    /**
     * Returns a hash code of a passed string by calculating
     * product of characters using 31 as multiplication factor.
     * It is good for anonymity, not suitable for security purposes.
     *
     * @param {String} toHash
     * @returns {String} hash code
     */
    exports.hashCode = function hashCode(toHash) {
        var charCode;
        var hash = 0;
        if (!toHash) {
            return "";
        }

        for (var i = 0; i < toHash.length; i += 1) {
            charCode = toHash.charCodeAt(i);
            hash = (hash * 31) + charCode;
            hash |= 0; // force 32-bit representation
        }

        return "" + hash;
    }
});
