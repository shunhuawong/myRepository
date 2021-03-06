define('jira/viewissue/element/shorten', [
    'jira/ajs/shorten/shortener',
    'jira/skate'
], function(Shortener, skate) {
    return skate('shorten', {
        type: skate.type.CLASSNAME,
        attached: function(element) {
            var options = {};
            options.element = element;
            new Shortener(options);
        }
    });
});
