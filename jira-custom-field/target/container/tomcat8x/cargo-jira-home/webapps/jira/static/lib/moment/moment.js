/**
 * @fileOverview
 * Pulls in the core Moment.js library, defines JIRA's i18n mappings,
 * then returns a moment instance that always uses the correct i18n setting.
 * See {@link http://momentjs.com/docs/#/i18n/instance-locale/} for details
 * on Moment.js' (changes in its) support for i18n.
 */

/**
 * @module jira/moment
 */
define('jira/moment', ['jira/moment/moment.lib', 'jira/moment/moment.jira.i18n'], function(moment, i18n) {
    return moment;
});
