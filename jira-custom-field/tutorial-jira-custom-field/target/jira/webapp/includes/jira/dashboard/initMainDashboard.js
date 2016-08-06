AJS.$(function() {
    var infoMessage = WRM.data.claim("dashboardInfoMessage");
    var installMessage = WRM.data.claim("dashboardInstallMessage");
    if(infoMessage || installMessage) {
        var flag = require("jira/flag");
        if(infoMessage) {
            flag.showInfoMsg('', infoMessage);
        }
        if (installMessage) {
            flag.showSuccessMsg('', installMessage);
        }
    }
});