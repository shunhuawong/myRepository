define('jira/project/browse/paginationview',
    ['backbone', 'jquery', 'underscore', 'jira/util/navigation'],
    function(Backbone, $, _, Navigation) {
       'use strict';

        return Backbone.Marionette.ItemView.extend({
            template: JIRA.Templates.Project.Browse.pagination,
            ui: {
                page: "li a"
            },
            events: {
                "click @ui.page": "clickPage"
            },
            collectionEvents: {
                reset: "render"
            },
            modelEvents: {
                change: "render"
            },
            onRender: function onRender() {
                this.unwrapTemplate();
            },
            serializeData: function() {
                var url = Navigation.getRoot() + this.model.getQueryParams();
                var data = _.extend({
                    url: url
                }, this.collection.state);
                data.firstPage = Math.max(data.currentPage - 5, data.firstPage);
                data.totalPages = data.lastPage;
                data.lastPage = Math.min(data.currentPage + 5, data.lastPage);
                return data;
            },
            clickPage: function clickPage(e) {
                e.preventDefault();
                var pageNumber = + $(e.target).attr("data-page");
                if (pageNumber) {
                    this.collection.getPage(pageNumber);
                    this.trigger("navigate", pageNumber);
                }
            }
        });
    }
);