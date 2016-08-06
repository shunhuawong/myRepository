define("jira/moment/moment.jira.formatter", ["underscore", "exports"], function(_, exports) {
    "use strict";
    var map = {
        d: "D",       // day
        y: "Y",       // year
        a: "A",       // meridiem
        E: "d",       // day name of week
        u: "d",       // day number of week
        Z: "ZZ",      // RFC 822 time zone
        z: "[GMT]ZZ", // replacing time zone name with offset
        XX: "ZZ",     // ISO 8601 time zone
        XXX: "Z"      // ISO 8601 time zone
    };

    function actuallyTranslate(tmpBuffer) {
        return map[tmpBuffer] || _.reduce(tmpBuffer, function (memo, value) {
            return memo + (map[value] || value);
        }, "");
    }

    function translateSimpleDateFormat(pattern) {
        var inQuote = false;
        var skip = false;
        var tmpBuffer = "";
        var reduction = _.reduce(pattern, function (memo, value, index, list) {
                if (skip) {
                    skip = false;
                }
                else if (value === '\'') {
                    if (tmpBuffer) {
                        memo += actuallyTranslate(tmpBuffer);
                        tmpBuffer = "";
                    }
                    if (list[index + 1] === '\'') {
                        memo += value;
                        skip = true;
                    }
                    else {
                        memo += !inQuote ? "[" : "]";
                        inQuote = !inQuote;
                    }
                }
                else if (inQuote) {
                    memo += value;
                }
                else if (!/[a-zA-Z]/.test(value)) {
                    if (tmpBuffer) {
                        memo += actuallyTranslate(tmpBuffer);
                        tmpBuffer = "";
                    }
                    memo += value;
                }
                else if (!tmpBuffer || tmpBuffer[tmpBuffer.length - 1] === value) {
                    tmpBuffer += value;
                }
                else {
                    memo += actuallyTranslate(tmpBuffer);
                    tmpBuffer = value;
                }
                return memo;
            }, "");
        if (tmpBuffer) {
            reduction += actuallyTranslate(tmpBuffer);
        }
        return reduction;
    }

    exports.translateSimpleDateFormat = translateSimpleDateFormat;
});
