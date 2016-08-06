/* global WRM */
define("jira/moment/moment.jira.i18n", [
    "jira/moment/moment.lib",
    "jira/moment/moment.jira.formatter",
    "jira/util/data/meta"
], function (moment, formatter, Meta) {

    "use strict";

    var timeUnits = WRM.data.claim("jira.webresources:dateFormatProvider.dateFormat");

    moment.lang("jira", {
        months: timeUnits.months,
        monthsShort: timeUnits.monthsShort,
        weekdays: timeUnits.weekdays,
        weekdaysShort: timeUnits.weekdaysShort,
        weekdaysMin: timeUnits.weekdaysShort,
        longDateFormat: {
            LT: formatter.translateSimpleDateFormat(Meta.get("date-time")),
            L: formatter.translateSimpleDateFormat(Meta.get("date-day")),
            LL: formatter.translateSimpleDateFormat(Meta.get("date-dmy")),
            LLL: formatter.translateSimpleDateFormat(Meta.get("date-complete"))
        },
        meridiem: function (hours) {
            return timeUnits.meridiem[+(hours > 11)];
        },

        calendar: {
            sameDay:  "LLL",
            nextDay:  "LLL",
            nextWeek: "LLL",
            lastDay:  "LLL",
            lastWeek: "LLL",
            sameElse: "LLL"
        },

        // TODO Deprecate?
        relativeTime: {
            future: AJS.I18n.getText("common.date.relative.time.future", "%s"),
            past: AJS.I18n.getText("common.date.relative.time.past", "%s"),
            s: AJS.I18n.getText("common.date.relative.time.seconds"),
            m: AJS.I18n.getText("common.date.relative.time.minute"),
            mm: AJS.I18n.getText("common.date.relative.time.minutes", "%d"),
            h: AJS.I18n.getText("common.date.relative.time.hour"),
            hh: AJS.I18n.getText("common.date.relative.time.hours", "%d"),
            d: AJS.I18n.getText("common.date.relative.time.day"),
            dd: AJS.I18n.getText("common.date.relative.time.days", "%d"),
            M: AJS.I18n.getText("common.date.relative.time.month"),
            MM: AJS.I18n.getText("common.date.relative.time.months", "%d"),
            y: AJS.I18n.getText("common.date.relative.time.year"),
            yy: AJS.I18n.getText("common.date.relative.time.years", "%d")
        }
    });

});
