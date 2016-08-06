define('jira/admin/user-browser/user-browser-flags', [
], function() {
    return {
        whenFlagSet: function whenFlagSet(flag, callback) {
            if (window.location.hash === "#" + flag) {
                callback();
                var url = location.pathname + location.search;
                if (window.history.replaceState) {
                    window.history.replaceState(null, null, url);
                }
            }
        }
    };
});