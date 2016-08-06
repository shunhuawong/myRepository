(function () {
    var shifter = null;

    define('jira/shifter', ['jira/shifter/shifter-controller'], function (ShifterController) {
        if (shifter === null) {
            shifter = new ShifterController('shifter-dialog');
        }

        return shifter;
    });
})();

AJS.namespace('JIRA.Shifter', null, require('jira/shifter'));