/**
 * @note Mostly copied from Stash by skalsi on 10/01/14.
 * @module jira/jquery/plugins/livestamp/time
 */
define('jira/jquery/plugins/livestamp/time', [
    'jquery',
    'jira/moment',
    'jira/util/data/meta'
], function ($, moment, Meta) {

    'use strict';

    /** @exports jira/jquery/plugins/livestamp/time */
    var Time = {};

    function Type(str, isAge) {
        this.key = str;
        this.isAge = isAge;
    }

    var relativize = Meta.getBoolean("date-relativize");

    Type.types = {};

    for (var a = ['shortAge', 'longAge', 'fullAge', 'short', 'long', 'full', 'timestamp'], i = 0, l = a.length, t; i < l; i++) {
        t = a[i];
        Type.types[t] = new Type(t, t.toLowerCase().indexOf('age') !== -1);
    }

    var momentTranslations = {};
    Time.FormatType = Type;

    function getTextForRelativeAge(age, type, param) {
        // NOTE: AJS cannot be an AMD dependency as the minifier then changes the AJS.I18n.getText references
        // NOTE: and the transformer doesn't do any translation. IMO this is a webresources _bug_ (https://ecosystem.atlassian.net/browse/PLUGWEB-17).
        if (age in momentTranslations) {
            return AJS.format(momentTranslations[age], param);
        } else {
            return null;
        }
    }

    // TODO These should match http://developer-fe.stg.internal.atlassian.com/design/1.3/foundations/dates/
    // by default.
    function getFormatString(type) {
        switch (type.key) {
            case 'short':
            case 'shortAge':
                return 'll';
            case 'long':
            case 'longAge':
                return 'LL';
            case 'full':
            case 'fullAge':
                return 'LLL';
            case 'timestamp':
                return "LLL";
            default:
                return null;
        }
    }

    function beginningOfDay(time)
    {
        return time.clone().hours(0).minutes(0).seconds(0).milliseconds(0);
    }

    function isYesterday(now, date) {
        var end = beginningOfDay(now);
        var start = end.clone().subtract('d', 1);
        return start <= date && date < end;
    }

    function isTomorrow(now, date) {
        var start = beginningOfDay(now).add('d', 1);
        var end = start.clone().add('d', 1);
        return start <= date && date < end;
    }

    function getMinutesBetween(start, end) {
        return Math.floor(end.diff(start, 'minutes', true));
    }

    function getHoursBetween(start, end) {
        var hourDiff = end.diff(start, 'hours', true);  // Moment's diff does a floor rather than a round so we pass 'true' for a float value
        return Math.round(hourDiff);                    // Then round it ourself
    }

    function getDaysBetween(start, end) {
        return Math.floor(end.diff(start, 'days', true));
    }

    function formatDateWithFormatString(date, type) {
        var formatString = getFormatString(type);
        return date.format(formatString);
    }

    function formatDateWithRelativeAge(date, type, now) {
        now = now || moment();

        if (date <= now) {
            if (date > now.clone().subtract('m', 1)) {
                return getTextForRelativeAge('aMomentAgo', type);
            } else if (date > now.clone().subtract('m', 2)) {
                return getTextForRelativeAge('oneMinuteAgo', type);
            } else if (date > now.clone().subtract('m', 50)) {
                return getTextForRelativeAge('xMinutesAgo', type, getMinutesBetween(date, now));
            } else if (date > now.clone().subtract('m', 90)) {
                return getTextForRelativeAge('oneHourAgo', type);
            } else if (isYesterday(now, date) && date < now.clone().subtract('h', 5)) {
                return getTextForRelativeAge('oneDayAgo', type);
            } else if (date > now.clone().subtract('d', 1)) {
                return getTextForRelativeAge('xHoursAgo', type, getHoursBetween(date, now));
            } else if (date > now.clone().subtract('d', 7)) {
                return getTextForRelativeAge('xDaysAgo', type, Math.max(getDaysBetween(date, now), 2));// if it's not yesterday then don't say it's one day ago
            } else if (date > now.clone().subtract('d', 8)) {
                return getTextForRelativeAge('oneWeekAgo', type);
            }
        } else {
            if (date < now.clone().add('m', 1)) {
                return getTextForRelativeAge('inAMoment', type);
            } else if (date < now.clone().add('m', 2)) {
                return getTextForRelativeAge('inOneMinute', type);
            } else if (date < now.clone().add('m', 50)) {
                return getTextForRelativeAge('inXMinutes', type, getMinutesBetween(now, date));
            } else if (date < now.clone().add('m', 90)) {
                return getTextForRelativeAge('inOneHour', type);
            } else if (isTomorrow(now, date) && date > now.clone().add('h', 5)) {
                return getTextForRelativeAge('inOneDay', type);
            } else if (date < now.clone().add('d', 1)) {
                return getTextForRelativeAge('inXHours', type, getHoursBetween(now, date));
            } else if (date < now.clone().add('d', 7)) {
                return getTextForRelativeAge('inXDays', type, Math.max(getDaysBetween(now, date), 2));// if it's not yesterday then don't say it's one day ago
            } else if (date < now.clone().add('d', 8)) {
                return getTextForRelativeAge('inOneWeek', type);
            }
        }
        return formatDateWithFormatString(date, type);
    }

    Time.formatDate = function formatDate(momentDate, type, forceRelativize) {
        if (momentDate && type) {
            if ((relativize || forceRelativize) && type.isAge) {
                return formatDateWithRelativeAge(momentDate, type);
            } else {
                return formatDateWithFormatString(momentDate, type);
            }
        } else {
            return null;
        }
    };

    Time.setRelativeTranslations = function(values) {
        for (var k in values) {
            momentTranslations[k] = values[k];
        }
    };

    Time.restoreDefaultRelativeTranslations = function() {
        this.setRelativeTranslations({
            'inAMoment': AJS.I18n.getText('common.date.relative.in.a.moment'),
            'inOneMinute': AJS.I18n.getText('common.date.relative.in.one.minute'),
            'inXMinutes': AJS.I18n.getText('common.date.relative.in.x.minutes'),
            'inOneHour': AJS.I18n.getText('common.date.relative.in.one.hour'),
            'inXHours': AJS.I18n.getText('common.date.relative.in.x.hours'),
            'inOneDay': AJS.I18n.getText('common.date.relative.in.one.day'),
            'inXDays': AJS.I18n.getText('common.date.relative.in.x.days'),
            'inOneWeek': AJS.I18n.getText('common.date.relative.in.one.week'),
            'aMomentAgo': AJS.I18n.getText('common.date.relative.a.moment.ago'),
            'oneMinuteAgo': AJS.I18n.getText('common.date.relative.one.minute.ago'),
            'xMinutesAgo': AJS.I18n.getText('common.date.relative.x.minutes.ago'),
            'oneHourAgo': AJS.I18n.getText('common.date.relative.one.hour.ago'),
            'xHoursAgo': AJS.I18n.getText('common.date.relative.x.hours.ago'),
            'oneDayAgo': AJS.I18n.getText('common.date.relative.one.day.ago'),
            'xDaysAgo': AJS.I18n.getText('common.date.relative.x.days.ago'),
            'oneWeekAgo': AJS.I18n.getText('common.date.relative.one.week.ago')
        });
    };
    Time.restoreDefaultRelativeTranslations();

    Time.formatDateWithRelativeAge = formatDateWithRelativeAge;
    Time.formatDateWithFormatString = formatDateWithFormatString;

    return Time;
});

AJS.namespace('JIRA.Time', null, require('jira/jquery/plugins/livestamp/time'));
