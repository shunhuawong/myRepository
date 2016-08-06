AJS.test.require(['jira.webresources:jira-metadata'], function () {
    require(['jira/util/strings'], function(Strings) {

        module('Strings');

        test('Test for nulls in string', function() {
            equal(Strings.startsWith(null, 'str'), false);
            equal(Strings.endsWith(null, 'str'), false);
            equal(Strings.substringAfter(null, 'str'), null);
            equal(Strings.contains(null, 'str'), false);
        });

        test('Test for nulls in a search string', function() {
            equal(Strings.startsWith('str', null), false);
            equal(Strings.endsWith('str', null), false);
            equal(Strings.substringAfter('str', null), '');
            equal(Strings.contains('str', null), false);
        });

        test('Empty string should have an empty hash', function() {
           equal(Strings.hashCode(), "", "Empty string returns empty hash");
           equal(Strings.hashCode(null), "", "Empty string returns empty hash");
           equal(Strings.hashCode(""), "", "Empty string returns empty hash");
        });

        test('Returns hash of a string', function() {
            equal(Strings.hashCode("test"), "3556498", "String gets hashed");
        });

        test('Replace string', function() {
            equal(Strings.replace("test", "e", "o"), "tost", "Single character should be replaced");
            equal(Strings.replace("test", "test", "beer"), "beer", "Full string match should be replaced");
            equal(Strings.replace("my best test for a string replace test", "test", "quest"), "my best quest for a string replace quest", "All of the multiple string matches should be replaced");
            equal(Strings.replace("abba abba abba abba", "abba", "abba abba"), "abba abba abba abba abba abba abba abba", "String should be replaced even if replace string is the same");
            equal(Strings.replace("|abba| |abba| |abba| |abba|", "abba", ""), "|| || || ||", "Replace string empty should remove occurrence from the original string");
            equal(Strings.replace("|abba| |abba| |abba| |abba|", "not matched", ""), "|abba| |abba| |abba| |abba|", "No match should not be replaced");
        });

    });
});