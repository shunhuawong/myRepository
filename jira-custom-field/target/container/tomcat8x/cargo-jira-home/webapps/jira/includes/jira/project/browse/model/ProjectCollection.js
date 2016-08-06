define('jira/project/browse/projectcollection', [
    'jira/backbone/backbone-paginator',
    'jira/project/browse/projectmodel'
], function(PageableCollection, ProjectModel) {
        'use strict';

        return PageableCollection.extend({
            model: ProjectModel,
            initialize: function initialize(items, options) {
                this.originalCollection = items;
                this.categories = options.categories;
            }
        });
});
