define('jira/project/browse/filtermodel',
    ['backbone', 'jquery', 'jira/util/navigation'],
    function(Backbone, $, Navigation) {
        'use strict';

        return Backbone.Model.extend({
            defaults: {
                contains: ''
            },
            initialize: function initialize(attributes, options) {
                this.pageableCollection = options.pageableCollection;

                this.on('change:category change:contains change:projectType', this.filterCollection);
                this.on('change:category change:contains change:projectType', this.triggerFilterEvent);
            },
            changeCategory: function categoryChange(category) {
                if (category) {
                    $.ajax({
                        url : contextPath + "/rest/api/1.0/browse-project/category/active",
                        data: JSON.stringify({
                            current: category.get("id")
                        }),
                        dataType: "json",
                        contentType: "application/json",
                        type:  "POST"
                    });
                    this.set('category', category.toJSON());
                }
            },
            changeProjectType: function changeProjectType(projectType) {
                if(projectType) {
                    $.ajax({
                        url : contextPath + "/rest/api/1.0/browse-project/project-type/active",
                        data: projectType.get("id"),
                        dataType: "json",
                        contentType: "application/json",
                        type:  "POST"
                    });
                    this.set('projectType', projectType.toJSON());
                }
            },
            filterCollection: function filterCollection() {
                var filtered = this.pageableCollection.originalCollection;
                var categoryFilter = this.get('category') ? this.get('category').id : '';
                var projectTypeFilter = this.get('projectType') ? this.get('projectType').key : null;
                var textFilter = (this.get('contains') || '').toLowerCase();

                if (projectTypeFilter !== null && projectTypeFilter !== 'all') {
                    filtered = filtered.filter(function(item) {
                        return item.projectTypeKey == projectTypeFilter
                            || projectTypeFilter === "" && item.projectTypeKey === null; //we use empty string from the URL to represent a null project type.
                    });
                }

                if (categoryFilter && categoryFilter !== 'all') {
                    filtered = filtered.filter(function(item) {
                        return categoryFilter == 'none' && !item.projectCategoryId ||
                                categoryFilter == 'recent' && item.recent == true ||
                                item.projectCategoryId == categoryFilter;
                    });
                }

                if (textFilter != '') {
                    filtered = filtered.filter(function(item) {
                        return (item.name && item.name.toLowerCase().indexOf(textFilter) > -1) ||
                                (item.key && item.key.toLowerCase().indexOf(textFilter) > -1) ||
                                (item.lead && item.lead.toLowerCase().indexOf(textFilter) > -1);
                    });
                }

                this.pageableCollection.fullCollection.reset(filtered);
                this.pageableCollection.getPage(1);
            },
            triggerFilterEvent: function triggerFilterEvent() {
                this.trigger('filter', this.getQueryParams(false));
            },
            getQueryParams: function getQueryParams(urlFormat) {
                urlFormat = typeof urlFormat === 'undefined'? true : urlFormat;

                var params = {
                    selectedCategory: this.get('category') ? this.get('category').id : '',
                    selectedProjectType: this.get('projectType') ? this.get('projectType').id : '',
                    contains: this.get('contains') || false
                };
                return urlFormat ? Navigation.buildQuery(params) : params;
            }
        });
    }
);