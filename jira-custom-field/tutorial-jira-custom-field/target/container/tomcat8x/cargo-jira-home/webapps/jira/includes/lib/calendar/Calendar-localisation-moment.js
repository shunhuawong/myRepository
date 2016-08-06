/**
 * Populates calendar's day/month names from moment js if available. Moment.js day month names are in initially populated
 * from java's current locale (see moment.jira.i18n.js).
 * This file must be loaded after loading calendar specific localization file (e.g calendar-en.js) in order
 * to override values provided by it (this is done by CalendarResourceIncluder.java).
 */

(function() {
    if(typeof moment !== 'function' || moment === null  || typeof Calendar !== 'function' || Calendar === null ) {
        return;
    }

    var langData = moment.langData('jira');
    if(langData === null || typeof langData !== 'object' ) {
        return;
    }
    //Calendar.js needs 8 element array for days (starting and ending with sunday)
    Calendar._DN = langData._weekdays.concat(langData._weekdays[0]);
    Calendar._SDN = langData._weekdaysShort.concat(langData._weekdaysShort[0]);

    Calendar._MN = [].concat(langData._months);
    Calendar._SMN = [].concat(langData._monthsShort);
})();