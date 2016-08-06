define('jira/project/browse/layout',
    ['jquery', 'underscore', 'backbone'],
    function($, _, Backbone) {
        return Backbone.Marionette.Layout.extend({
            regions: {
                categoryNav: '.category-nav',
                projectTypeNav: '.project-type-nav',
                filter: '#filter-projects',
                content: '#projects',
                pagination: '#pagination'
            }
        });
});