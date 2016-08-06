define('jira/project/browse/app',
    ['jquery', 'underscore', 'backbone',
        'jira/project/browse/layout',
        'jira/project/browse/tabsview',
        'jira/project/browse/projecttypestabsview',
        'jira/project/browse/projectcollection',
        'jira/project/browse/projectcollectionview',
        'jira/project/browse/paginationview',
        'jira/project/browse/filtermodel',
        'jira/project/browse/filterview',
        'jira/util/navigation',
        'jira/project/browse/categorycollection',
        'jira/project/browse/projecttypecollection',
        'jira/util/users/logged-in-user'
    ],
    function($, _, Backbone,
            Layout,
            TabsView,
            ProjectTypesTabsView,
            ProjectCollection,
            ProjectCollectionView,
            PaginationView,
            FilterModel,
            FilterView,
            Navigation,
            CategoryCollection,
            ProjectTypeCollection,
            User
    ) {
        'use strict';

        var application = new Backbone.Marionette.Application();

        application.on('start', function(options) {
            var $el = options.container;

            this.categories = new CategoryCollection(options.categories);
            this.availableProjectTypes = new ProjectTypeCollection(options.availableProjectTypes);
            this.projects = new ProjectCollection(options.projects,{
                mode: 'client',
                state: {
                    pageSize: 25,
                    currentPage: 1
                },
                categories: this.categories
            });

            this.categories.selectCategory(options.selectedCategory);

            if(options.availableProjectTypes){
                //JC-430: If an invalid project is specified in the URL just go back to 'all'
                if (!this.availableProjectTypes.selectProjectType(options.selectedProjectType)) {
                    this.availableProjectTypes.selectProjectType("all");
                }
                this.filter = new FilterModel({
                    category: this.categories.getSelected().toJSON(),
                    projectType: this.availableProjectTypes.getSelected().toJSON()
                }, {
                    pageableCollection: this.projects
                });

            }else{

                this.filter = new FilterModel({
                    category: this.categories.getSelected().toJSON()
                }, {
                    pageableCollection: this.projects
                });
            }

            this.layout = new Layout({
                el: $el
            });

            this.projectCollectionView = new ProjectCollectionView({
                model: this.filter,
                collection: this.projects
            });

            var categoryChange = function categoryChange(categoryId) {
                var category = application.categories.selectCategory(categoryId);

                if (category) {
                    application.filter.changeCategory(category);
                }
            };

            if (User.username() !== '' || this.categories.length > 1) {
                this.tabsView = new TabsView({
                    collection: this.categories
                });
                this.tabsView.on('category-change', categoryChange);

                this.layout.categoryNav.show(this.tabsView);
            }
            else {
                this.layout.$el.find(this.layout.categoryNav.el).addClass('hidden');
            }

            var projectTypeChange = function projectTypeChange(projectTypeId) {
                var projectType = application.availableProjectTypes.selectProjectType(projectTypeId);
                if(projectType){
                    application.filter.changeProjectType(projectType);
                }
            };
            if (this.availableProjectTypes.length > 0)
            {
                this.projectTypesTabsView = new ProjectTypesTabsView({
                    collection: this.availableProjectTypes
                });
                this.projectTypesTabsView.on('project-type-change', projectTypeChange);
                this.layout.projectTypeNav.show(this.projectTypesTabsView);
            }else{
                this.layout.$el.find(".project-type-nav").addClass('hidden');
            }

            this.projectCollectionView.on('category-change', categoryChange);

            this.layout.content.show(this.projectCollectionView);
            this.layout.pagination.show(new PaginationView({
                collection: this.projects,
                model: this.filter
            }));
            this.layout.filter.show(new FilterView({
                model: this.filter
            }));

            this.layout.pagination.currentView.on('navigate',function(pageNumber) {
                var params = _.extend(application.filter.getQueryParams(false), {
                    'page': pageNumber
                });
                Navigation.navigate(params);
            });
            this.filter.on('filter', function(params) {
                Navigation.navigate(params);
            });

            var router = new (Backbone.Router.extend({
                initialize: function initialize(){
                    this.route(/(.*)/, 'every');
                }
            }));

            router.on('route:every',function() {
                var page = + Navigation.getParam('page', true) || 1;
                var contains = Navigation.getParam('contains', true) || '';
                var categoryId = Navigation.getParam('selectedCategory') || '';
                var category = application.categories.selectCategory(categoryId);
                var projectTypeId = Navigation.getParam('selectedProjectType') || '';
                var projectType = application.availableProjectTypes.selectProjectType(projectTypeId);

                application.filter.set('contains', contains, {silent: true});
                if (category !== false) {
                    application.filter.set('category', category.toJSON(), {silent: true});
                }
                if (projectType !== false) {
                    application.filter.set('projectType', projectType.toJSON(), {silent: true});
                }
                application.filter.filterCollection();
                application.projects.getPage(page);
                application.layout.filter.currentView.render();
            });

            if (!Backbone.History.started) {
                Backbone.history.start({
                    pushState: Navigation.pushStateSupported,
                    root: Navigation.getBackboneHistoryRoot()
                });
            }

            //rewrite old-style url to new style one:
            if (window.location.hash) {
                var categoryId = window.location.hash.substring(1);
                var category = this.categories.get(categoryId);
                if (category) {
                    categoryChange(categoryId);
                }
            }
        });

        return application;
    });