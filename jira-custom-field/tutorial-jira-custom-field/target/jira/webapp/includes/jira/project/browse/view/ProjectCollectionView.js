define('jira/project/browse/projectcollectionview', [
        'backbone',
        'jquery',
        'jira/project/browse/projectview',
        'jira/project/browse/projecttypesservice'
    ], function(
        Backbone,
        $,
        ProjectView,
        ProjectTypesService
    ) {
        "use strict";

        return Backbone.Marionette.CompositeView.extend({
            template: JIRA.Templates.Project.Browse.projects,
            itemView: ProjectView,
            itemViewOptions: function() {
                return {
                    filters: this.model
                };
            },
            emptyView: Backbone.Marionette.ItemView.extend({
                getTemplate: function() {
                    if (this.options.filters.get("projectType") && this.options.filters.get("projectType").key == "business" &&
                            this.options.filters.get("category").id == "all" &&
                            this.options.filters.get("contains") == ""){
                        return JIRA.Templates.Project.Browse.emptyRowForBusiness;
                    } else {
                        return JIRA.Templates.Project.Browse.emptyRow;
                    }
                },
                onRender: function() {
                    this.unwrapTemplate();
                },
                serializeData: function(){
                    return {
                        isAdmin: AJS.Meta.get("is-admin")
                    };
                }
            }),
            itemViewContainer: 'tbody',
            events: {
                'click .category': 'categoryClick'
            },
            onRender: function onRender() {
                this.unwrapTemplate();
            },
            categoryClick: function categoryClick(e) {
                var $link = $(e.currentTarget);
                var id = $link.data('category-id');

                e.preventDefault();
                this.trigger('category-change', id);
            }
        });
    }
);