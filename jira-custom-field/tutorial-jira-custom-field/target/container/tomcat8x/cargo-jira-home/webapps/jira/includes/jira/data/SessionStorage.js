/**
 * A cross-browser polyfill for the native `sessionStorage` object.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage|`window.sessionStorage`}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage|the `Storage` object} for the sessionStorage API
 * @module jira/data/session-storage
 * @extends window.sessionStorage
 */
define('jira/data/session-storage', function() {

    return {
        /**
         * All of JIRA's supported browsers support SessionStorage. This is still here for legacy API reasons.
         */
        nativesupport: true,

        /**
         * @inheritdoc
         */
        length: function() { return sessionStorage.length; },
        /**
         * @inheritdoc
         */
        key: function(index) { return sessionStorage.key(index); },
        /**
         * @inheritdoc
         */
        getItem: function(key) { return sessionStorage.getItem(key); },
        /**
         * @inheritdoc
         */
        setItem: function(key, value) { return sessionStorage.setItem(key, value); },
        /**
         * @inheritdoc
         */
        removeItem: function(key) { return sessionStorage.removeItem(key); },
        /**
         * @inheritdoc
         */
        clear: function() { return sessionStorage.clear(); },

        /**
         * Returns a JSON string representation of the web storage in play
         */
        asJSON: function() {
            var len = this.length();
            var jsData = '{\n';
            for (var i = 0; i < len; i++)
            {
                var key = this.key(i);
                var value = this.getItem(key);
                jsData += key + ':' + value;
                if (i < len-1)
                {
                    jsData += ',';
                }
                jsData += '\n';
            }
            jsData += '}\n';
            return jsData;
        }
    };
});

/** Preserve legacy namespace
    @deprecated jira.app.session.storage */
AJS.namespace("jira.app.session.storage", null, require('jira/data/session-storage'));
AJS.namespace('JIRA.SessionStorage', null, require('jira/data/session-storage'));
