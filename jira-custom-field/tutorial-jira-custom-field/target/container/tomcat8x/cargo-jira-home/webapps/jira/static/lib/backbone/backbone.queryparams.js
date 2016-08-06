/*! THIS FILE HAS BEEN MODIFIED BY ATLASSIAN, SEE https://github.com/jhudson8/backbone-query-parameters/pull/63/files */
(function (root, factory) {
    if (typeof exports === 'object' && root.require) {
        module.exports = factory(require("underscore"), require("backbone"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["underscore","backbone"], function(_, Backbone) {
            // Use global variables if the locals are undefined.
            return factory(_ || root._, Backbone || root.Backbone);
        });
    } else {
        // RequireJS isn't being used. Assume underscore and backbone are loaded in <script> tags
        factory(_, Backbone);
    }
}(this, function(_, Backbone) {

    var queryStringParam = /^\?(.*)/,
            optionalParam = /\((.*?)\)/g,
            namedParam    = /(\(\?)?:\w+/g,
            splatParam    = /\*\w+/g,
            escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g,
            fragmentStrip = /^([^\?]*)/,
            namesPattern = /[\:\*]([^\:\?\/]+)/g,
            routeStripper = /^[#\/]|\s+$/g,
            trailingSlash = /\/$/;
    Backbone.Router.arrayValueSplit = '|';

    var _getFragment = function(fragment, forcePushState) {
        if (fragment == null) {
            if (this._hasPushState || !this._wantsHashChange || forcePushState) {
                fragment = this.location.pathname;
                var root = this.root.replace(trailingSlash, '');
                var search = this.location.search;
                if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
                if (search) fragment += search;
            } else {
                fragment = this.getHash();
            }
        }
        return fragment.replace(routeStripper, '');
    };

    function proxy(source, proxy, name) {
        _.each(Array.prototype.slice.call(arguments, 2), function (name) {
            Object.defineProperty(proxy, name, {
                get: function () { return source[name]; },
                set: function (value) { source[name] = value; }
            });
        });
    }

    proxy.isSupported = (function () {
        try {
            Object.defineProperty({}, 'x', {})
            return true;
        } catch (e) {
            return false;
        }
    })();

    function LocationRewriter(history) {
        var original = history.location,
                replacement = {};

        proxy(original, replacement, "assign", "ancestorOrigins",
                "origin", "hash", "search", "pathname", "port", "hostname", "host",
                "protocol", "href", "reload");

        replacement.replace = function() {
            original.replace(history.root + '#' + history.fragment);
        };

        replacement.unPatch = function() {
            return history.location = original;
        };

        history.location = replacement;
    }

    function HistoryRewriter(history) {
        var original = history.history,
                replacement = {};

        proxy(original, replacement, "length", "state", "back", "forward", "go",
                "pushState");

        replacement.replaceState = function(state, title, url) {
            url = history.root + history.fragment;
            return original.replaceState(state, title, url);
        };

        replacement.unPatch = function () {
            history.history = original;
        };

        history.history = replacement;
    }

    var _start = Backbone.History.prototype.start,
            _loadUrl = Backbone.History.prototype.loadUrl;

    _.extend(Backbone.History.prototype, {
        getFragment: _getFragment,

        // this will not perform custom query param serialization specific to the router
        // but will return a map of key/value pairs (the value is a string or array)
        getQueryParameters: function(fragment, forcePushState) {
            fragment = _getFragment.apply(this, arguments);
            // if no query string exists, this will still be the original fragment
            var queryString = fragment.replace(fragmentStrip, '');
            var match = queryString.match(queryStringParam);
            if (match) {
                queryString = match[1];
                var rtn = {};
                iterateQueryString(queryString, function(name, value) {
                    // decodeURIComponent doesn't touch '+'
                    value = value.replace(/\+/g, '%20');
                    value = decodeURIComponent(value);
                    if (!rtn[name]) {
                        rtn[name] = value;
                    } else if (_.isString(rtn[name])) {
                        rtn[name] = [rtn[name], value];
                    } else {
                        rtn[name].push(value);
                    }
                });
                return rtn;
            } else {
                // no values
                return {};
            }
        },

        start: function() {
            if (proxy.isSupported) {
                LocationRewriter(this);
                HistoryRewriter(this);
            }
            try {
                return _start.apply(this, arguments);
            } finally {
                this.location.unPatch && this.location.unPatch();
                this.history.unPatch && this.history.unPatch();
            }
        },

        loadUrl: function () {
            this.location && this.location.unPatch && this.location.unPatch();
            this.history && this.history.unPatch && this.history.unPatch();
            return _loadUrl.apply(this, arguments);
        }
    });

    _.extend(Backbone.Router.prototype, {
        initialize: function(options) {
            this.encodedSplatParts = options && options.encodedSplatParts;
        },

        getFragment: _getFragment,

        _routeToRegExp: function(route) {
            var splatMatch = (splatParam.exec(route) || {index: -1}),
                    namedMatch = (namedParam.exec(route) || {index: -1}),
                    paramNames = route.match(namesPattern) || [];

            route = route.replace(escapeRegExp, '\\$&')
                    .replace(optionalParam, '(?:$1)?')
                    .replace(namedParam, function(match, optional){
                        return optional ? match : '([^\\/\\?]+)';
                    })
                // `[^??]` is hacking around a regular expression bug under iOS4.
                // If only `[^?]` is used then paths like signin/photos will fail
                // while paths with `?` anywhere, like `signin/photos?`, will succeed.
                    .replace(splatParam, '([^??]*?)');
            route += '(\\?.*)?';
            var rtn = new RegExp('^' + route + '$');

            // use the rtn value to hold some parameter data
            if (splatMatch.index >= 0) {
                // there is a splat
                if (namedMatch >= 0) {
                    // negative value will indicate there is a splat match before any named matches
                    rtn.splatMatch = splatMatch.index - namedMatch.index;
                } else {
                    rtn.splatMatch = -1;
                }
            }
            rtn.paramNames = _.map(paramNames, function(name) { return name.substring(1); });
            rtn.namedParameters = this.namedParameters;

            return rtn;
        },

        /**
         * Given a route, and a URL fragment that it matches, return the array of
         * extracted parameters.
         */
        _extractParameters: function(route, fragment) {
            var params = route.exec(fragment).slice(1),
                    namedParams = {};
            if (params.length > 0 && _.isUndefined(params[params.length - 1])) {
                // remove potential invalid data from query params match
                params.splice(params.length - 1, 1);
            }

            // do we have an additional query string?
            var match = params.length && params[params.length-1] && params[params.length-1].match(queryStringParam);
            if (match) {
                var queryString = match[1];
                var data = {};
                if (queryString) {
                    var self = this;
                    iterateQueryString(queryString, function(name, value) {
                        self._setParamValue(name, value, data);
                    });
                }
                params[params.length-1] = data;
                _.extend(namedParams, data);
            }

            // decode params
            var length = params.length;
            if (route.splatMatch && this.encodedSplatParts) {
                if (route.splatMatch < 0) {
                    // splat param is first
                    return params;
                } else {
                    length = length - 1;
                }
            }

            for (var i=0; i<length; i++) {
                if (_.isString(params[i])) {
                    params[i] = decodeURIComponent(params[i]);
                    if (route.paramNames && route.paramNames.length >= i-1) {
                        namedParams[route.paramNames[i]] = params[i];
                    }
                }
            }

            return (Backbone.Router.namedParameters || route.namedParameters) ? [namedParams] : params;
        },

        /**
         * Set the parameter value on the data hash
         */
        _setParamValue: function(key, value, data) {
            // use '.' to define hash separators
            key = key.replace('[]', '');
            var parts = key.split('.');
            var _data = data;
            for (var i=0; i<parts.length; i++) {
                var part = parts[i];
                if (i === parts.length-1) {
                    // set the value
                    _data[part] = this._decodeParamValue(value, _data[part]);
                } else {
                    _data = _data[part] = _data[part] || {};
                }
            }
        },

        /**
         * Decode an individual parameter value (or list of values)
         * @param value the complete value
         * @param currentValue the currently known value (or list of values)
         */
        _decodeParamValue: function(value, currentValue) {
            // decodeURIComponent doesn't translate '+'
            value = value.replace(/\+/g, '%20');

            // '|' will indicate an array.  Array with 1 value is a=|b - multiple values can be a=b|c
            var splitChar = Backbone.Router.arrayValueSplit;
            if (splitChar && value.indexOf(splitChar) >= 0) {
                var values = value.split(splitChar);
                // clean it up
                for (var i=values.length-1; i>=0; i--) {
                    if (!values[i]) {
                        values.splice(i, 1);
                    } else {
                        values[i] = decodeURIComponent(values[i]);
                    }
                }
                return values;
            }
            value = decodeURIComponent(value);
            if (!currentValue) {
                return value;
            } else if (_.isArray(currentValue)) {
                currentValue.push(value);
                return currentValue;
            } else {
                return [currentValue, value];
            }
        },

        /**
         * Return the route fragment with queryParameters serialized to query parameter string
         */
        toFragment: function(route, queryParameters) {
            if (queryParameters) {
                if (!_.isString(queryParameters)) {
                    queryParameters = this._toQueryString(queryParameters);
                }
                if(queryParameters) {
                    route += '?' + queryParameters;
                }
            }
            return route;
        },

        /**
         * Serialize the val hash to query parameters and return it.  Use the namePrefix to prefix all param names (for recursion)
         */
        _toQueryString: function(val, namePrefix) {
            var splitChar = Backbone.Router.arrayValueSplit;
            function encodeSplit(val) { return String(val).replace(splitChar, encodeURIComponent(splitChar)); }

            if (!val) return '';
            namePrefix = namePrefix || '';
            var rtn = '';
            for (var name in val) {
                var _val = val[name];
                if (_.isString(_val) || _.isNumber(_val) || _.isBoolean(_val) || _.isDate(_val)) {
                    // primitive type
                    _val = this._toQueryParam(_val);
                    if (_.isBoolean(_val) || _.isNumber(_val) || _.isString(_val) || _val) {
                        rtn += (rtn ? '&' : '') + this._toQueryParamName(name, namePrefix) + '=' + encodeSplit(encodeURIComponent(_val));
                    }
                } else if (_.isArray(_val)) {
                    // arrays use Backbone.Router.arrayValueSplit separator
                    var str = '';
                    for (var i = 0; i < _val.length; i++) {
                        var param = this._toQueryParam(_val[i]);
                        if (_.isBoolean(param) || param !== null) {
                            str += splitChar + encodeSplit(param);
                        }
                    }
                    if (str) {
                        rtn += (rtn ? '&' : '') + this._toQueryParamName(name, namePrefix) + '=' + str;
                    }
                } else {
                    // dig into hash
                    var result = this._toQueryString(_val, this._toQueryParamName(name, namePrefix, true));
                    if (result) {
                        rtn += (rtn ? '&' : '') + result;
                    }
                }
            }
            return rtn;
        },

        /**
         * return the actual parameter name
         * @param name the parameter name
         * @param namePrefix the prefix to the name
         * @param createPrefix true if we're creating a name prefix, false if we're creating the name
         */
        _toQueryParamName: function(name, prefix, isPrefix) {
            return (prefix + name + (isPrefix ? '.' : ''));
        },

        /**
         * Return the string representation of the param used for the query string
         */
        _toQueryParam: function (param) {
            if (_.isNull(param) || _.isUndefined(param)) {
                return null;
            }
            return param;
        }
    });

    function iterateQueryString(queryString, callback) {
        var keyValues = queryString.split('&');
        _.each(keyValues, function(keyValue) {
            var arr = keyValue.split('=');
            callback(arr.shift(), arr.join('='));
        });
    }

}));