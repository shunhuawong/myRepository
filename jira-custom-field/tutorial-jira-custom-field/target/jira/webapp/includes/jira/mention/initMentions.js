require(['wrm/require'], function(wrmRequire) {
    wrmRequire(['wrc!jira.webresources:mentions-feature'], function() {
        require(['jira/mention/mention-element']);
    });
});
