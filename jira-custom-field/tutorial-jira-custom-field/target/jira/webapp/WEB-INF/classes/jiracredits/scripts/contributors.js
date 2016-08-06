define('jira-credits-contributor-blob', ['require'], function(require) {

    var users = require('jira-credits-raw-users');
    var coords = require('jira-credits-raw-coords');

    var blob = {};
    for (var i = 0; i < coords.length; i++) {
        var u = users[i] || ["???","???"+i,"<a href='https://www.atlassian.com/company/careers/' target='_blank'>We're hiring! (A lot)</a>"];
        blob[u[0]] = {name: u[0], role: u[2], x: coords[i][1], y: coords[i][2]};
    }

    return blob;
});
