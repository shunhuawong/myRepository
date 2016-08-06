AJS.test.require(["jira.webresources:mentions-feature"], function () {
    var MentionMatcher = require('jira/mention/mention-matcher');
    var $ = require('jquery');

    function match(text, length) {
        length || (length = text.length);
        return MentionMatcher.getUserNameFromCurrentWord(text, length);
    }

    module("getUserNameFromCurrentWord - triggers");

    test("empty searches", function () {
        equal(match("@"), "", "matching @");
        equal(match("[@"), "", "matching [@");
        equal(match("[~"), "", "matching [~");
        equal(match("[~@"), "", "matching [~@");
        equal(match('~@'), "", "matching ~@");
    });

    test("non-valid syntaxes do not trigger autocomplete", function () {
        equal(match("["), null, "matching [");
        equal(match("[a"), null, "matching [a");
    });

    test("simple search for 'a'", function () {
        equal(match("@a"), "a", "matching @a");
        equal(match("[@a"), "a", "matching [@a");
        equal(match("[~a"), "a", "matching [~a");
        equal(match("[~@a"), "a", "matching [~@a");
    });

    test("takes the last occurrence of [~ to start the search", function () {
        equal(match('[~[~['), "[", "should only return data after the last [~");
    });

    test("the @ syntax takes precedence over [~ syntax", function () {
        equal(match("[@~"), "~", "matching [@~");
        equal(match("[@~a"), "~a", "matching [@~a");
    });

    test("the @ syntax does not match if preceded by alpha-numeric characters", function () {
        equal(match("test@a"), null, "matching test@a");

        equal(match("the quick brown fox jumped over the lazy@dog"), null, "there's an alphanumeric character before the @, so shouldn't match");
        equal(match("the quick brown fox jumped over the lazy @dog"), "dog", "no alphanumeric character before the @, so should search for 'dog'");
    });

    test("the [~ syntax does not match if preceded by alpha-numeric characters", function () {
        equal(match("test[~a"), null, "matching test[~a");

        equal(match("the quick brown fox jumped over the lazy[~dog"), null, "there's an alphanumeric character before the [~, so shouldn't match");
        equal(match("the quick brown fox jumped over the lazy [~dog"), "dog", "no alphanumeric character before the [~, so should search for 'dog'");
    });

    test("the rest", function () {
        equal(match("test[@a"), "a", "matching test[@a");
        equal(match("test[@~a"), "~a", "matching test[@~a");
        equal(match("test[~@a"), "a", "matching test[~@a");

        equal(match("a test[@a"), "a", "matching a test[@a");
        equal(match("a test[@~a"), "~a", "matching a test[@~a");
        equal(match("a test[~@a"), "a", "matching a test[~@a");
    });

    module("getUserNameFromCurrentWord - query");

    test("can have multiple words in the query", function () {
        equal(match("the quick brown fox jumped over the @lazy dog"), "lazy dog", "should return 'lazy dog'");
        equal(match("the quick brown fox jumped over @the lazy dog"), "the lazy dog", "should return 'the lazy dog'");
    });

    test("the query is limited to three words maximum", function () {
        var content = "the quick brown fox @jumped over the lazy dog";
        equal(match(content, content.length), null, "caret is at end of 5th word after the @, so should return null");
        equal(match(content, content.length - 4), null, "caret is at end of 4th word after the @, so should return null");
        equal(match(content, content.length - 7), null, "caret is inside 4th word after the @, so should return null");
        equal(match(content, content.length - 9), "jumped over the", "caret is at end of 3rd word after the @, so should return 'jumped over the'");
    });

    test("the query will return multiple words up to and including any whitespace before the 4th word", function () {
        var content = "the quick brown fox @jumped over the lazy dog";
        equal(match(content, content.length - 8), "jumped over the ", "caret is just before the 4th word after the @, so should return everything before it (including the whitespace)");
        equal(match(content, content.length - 7), null, "caret is just after the 'l' in lazy, which is in the 4th word, so should return null");
    });

    test("trailing whitespace is 'preserved' in the query", function () {
        equal(match("the quick brown fox jumped over the @lazy dog  "), "lazy dog  ", "should keep the space after 'dog'");
    });

    test("infix whitespace is preserved in the query", function () {
        equal(match("jumped over the @lazy   dog"), "lazy   dog", "should keep the three spaces between 'lazy' and 'dog'");
        equal(match("jumped over the @lazy \t\t  dog"), "lazy \t\t  dog", "keeps everything between 'lazy' and 'dog'");
    });

    test("carriage return and newline break the query", function () {
        var content = "jumped over the @lazy\ndog";
        equal(match(content, content.length), null, "when the user's caret is on the next line, it returns false"); //
        equal(match(content, content.length - 3), null, "when the user's caret is just after the new line, it returns false"); //
        equal(match(content, content.length - 4), "lazy", "when the user's caret is just before the new line (i.e, just after 'lazy'), it will return 'lazy'");
    });

    function check() {
        return JIRA.Mention.prototype._stringPartStartsWith.apply(JIRA.Mention.prototype, arguments);
    }

    module("Mention#_stringPartStartsWith - single word");

    test("strings do not start with empty string", function () {
        ok(!check("something", ""), "empty string shouldn't be considered the start of a string");
    });

    test("string starts with", function () {
        ok(check("admin", "a"), "'admin' starts with 'a'");
        ok(check("admin", "admin"), "identity check -- 'admin' starts with itself");
        ok(!check("admin", "n"), "'admin' does not start with 'n'");
        ok(!check("admin", "administrator"), "'admin' does not start with 'administrator'");
    });

    test("is (alpha-numeric) case-insensitive", function () {
        ok(check("admin", "ADM"));
        ok(check("admin", "Adm"));
        ok(check("Admin", "adm"));
        ok(check("aDmIn", "adm"));
        ok(check("ADMIN", "adm"));
    });

    test("string can not start with whitespace", function () {
        ok(!check(" something", " "), "will not match starting whitespace");
        ok(!check(" something", " s"), "will not match literal ' s'");
        ok(!check(" something", "  "), "string does not start with two spaces");
    });

    test("matches start at first non-whitespace word boundary", function () {
        ok(check(" something", "s"), "ignores whitespace when doing startsWith match");
    });

    test("doesn't treat regex characters specially", function () {
        ok(check("$AUD", "$"), "should match literal '$' and not treat it as end of regex");
        ok(check("$.fn.ready", "$."), "should match the literal string '$.'");
        ok(!check("$$$", "$."), "should match literal string '$.' and not use period as any character");
    });

    test("no errors when ill-formed regex", function () {
        ok(check("[Administrator]", "["));
    });

    test("no errors with special HTML characters", function () {
        ok(check("<strong><em>awesome</em></strong>", "<strong><em>a"));
        ok(check("<script>alert(document.cookie)</script>", "<script>alert("), "should start with literal html");
    });

    module("Mention#_stringPartStartsWith - multiple words");

    test("finds against multiple words", function () {
        ok(check("the quick brown fox jumps over the lazy dog", "b"), "finds startsWith match in the third word.");
        ok(check("the quick brown fox jumps over the lazy dog", "d"), "finds startsWith match in last word.");
    });

    test("words are seperated by any kind of whitespace", function () {
        var sentence = "  the       quick @brown  .fox (jum-ped o'ver the,lazy  \"dog   ";
        ok(check(sentence, "t"), "should match 'the' at the start of the sentence, preceded by two spaces");
        ok(check(sentence, "q"), "should match 'quick' which is preceded by several spaces");
        ok(check(sentence, "b"), "should match 'brown' which is preceded by an @ symbol");
        ok(check(sentence, "f"), "should match 'fox' which is preceded by a period");
        ok(check(sentence, "p"), "should match 'ped' which is preceded by a dash");
        ok(check(sentence, "d"), "should match 'dog' which is preceded by a double-quote");
        ok(check(sentence, "l"), "should match 'lazy' which is preceded by a comma");
        ok(check(sentence, "t"), "should match 'the' which is preceded by a single-quote");
        ok(check(sentence, "j"), "should match 'jum' which is preceded by an open bracket");
    });

    test("does not find words starting with whitespace", function () {
        ok(!check("the quick brown fox jumps over the lazy dog", " quick"), " the word 'quick' should not start with a space");
    });

    test("does not find prefixes that don't exist in the sentence", function () {
        ok(!check("the quick brown fox jumps over the lazy dog", "z"), "z does not occur at the start of a word");
        ok(!check("the quick brown fox jumps over the lazy dog", "azy"), "azy does not occur at the start of a word");
    });

    test("multi-word prefixes match at start of sentence", function () {
        ok(check("the quick brown fox jumps over the lazy dog", "the q"));
        ok(check("the quick brown fox jumps over the lazy dog", "the quick"));
        ok(check("the quick brown fox jumps over the lazy dog", "the quick brown fox jumps over the lazy dog"));
    });

    test("multi-word prefixes match in middle of sentence", function () {
        ok(check("the quick brown fox jumps over the lazy dog", "the l"));
        ok(check("the quick brown fox jumps over the lazy dog", "the lazy"));
        ok(check("the quick brown fox jumps over the lazy dog", "lazy dog"));
    });

    test("single-word prefixes can include odd non-alphanumeric characters", function () {
        var username = "¾dmin <A New Beginning>";
        ok(check(username, "¾dm"));
        ok(check(username, "¾dmin <"));
        ok(check(username, "¾dmin <A New B"));
        ok(check(username, "<A"));
        ok(check(username, "Beginning>"));
    });

    test("multi-word prefixes do not match 'logical' nested sentences", function () {
        ok(!check("¾dmin <A New Beginning>", "A New"));
        ok(check("¾dmin <A New Beginning>", "<A New"));
        ok(check("¾dmin <A New Beginning>", "New Begin"));
    });

    module("Mention - role help text");

    function isHelpTextVisible(isRolesEnabled) {
        return !!$(JIRA.Templates.mentionsSuggestions({
            suggestions: [],
            activity: false,
            query: null,
            isRolesEnabled: isRolesEnabled
        })).find('.aui-list-section-footer').length;
    }

    test("help text should be available when roles is enabled", function () {
        ok(isHelpTextVisible(true));
    });

    test("help text should not be available when roles is not enabled", function () {
        ok(!isHelpTextVisible(false));
    });

    module("Mention#_indexOfFirstMatch");

    test("_indexOfFirstMatch", function () {
        var indexOfFirstMatch = JIRA.Mention.prototype._indexOfFirstMatch;
        equal(indexOfFirstMatch('Mike Cannon-Brooks', 'Br'), 12);
        equal(indexOfFirstMatch('Mike Cannon-Brooks', 'Bre'), -1);
        equal(indexOfFirstMatch('Mike Cannon-Brooks', 'Mi'), 0);
        equal(indexOfFirstMatch('Mike Cannon-Brooks', 'Cann'), 5);
        equal(indexOfFirstMatch('Mike Cannon-Brooks', 'Cannon-Brooks'), 5);
        equal(indexOfFirstMatch('James O\'Brian', 'Br'), 8);
        equal(indexOfFirstMatch('James O\'Brian', 'O\'Br'), 6);
        equal(indexOfFirstMatch('cat@hat.com', 'ca'), 0);
        equal(indexOfFirstMatch('cat@hat.com', 'ha'), 4);
        equal(indexOfFirstMatch('cat@hat.com', 'at'), -1);
        equal(indexOfFirstMatch('cat@hat.com', 'co'), 8);
    });
});
