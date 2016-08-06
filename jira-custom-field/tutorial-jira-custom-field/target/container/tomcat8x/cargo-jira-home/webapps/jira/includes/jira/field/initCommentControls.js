(function () {
    var skate = require('jira/skate');
    var SecurityLevelSelect = require('jira/ajs/select/security-level-select');
    var wikiPreview = require('jira/wikipreview/wiki-preview');

    /**
     *
     */
    skate('jira-wikifield', {
        type: skate.type.CLASSNAME,
        created: function(el) {
            var prefs = {
                fieldId: el.getAttribute('field-id'),
                trigger: el.querySelector('.wiki-preview').id,
                issueKey: el.getAttribute('issue-key'),
                rendererType: el.getAttribute('renderer-type')
            };
            wikiPreview(prefs, el).init();
        }
    });

    skate('security-level', {
        type: skate.type.CLASSNAME,
        created: function(el) {
            var commentLevel = el.querySelector('#commentLevel');
            if (commentLevel) {
                new SecurityLevelSelect(commentLevel);
            }
        }
    });

})();
