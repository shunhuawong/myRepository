define('jira/project/browse/projecttypecollection',
        ['backbone'],
        function(Backbone) {
            'use strict';

            return Backbone.Collection.extend({
                unselect: function unselect() {
                    this.filter(function(projectType) {
                        return projectType.get('selected');
                    }).forEach(function(projectType) {
                        projectType.set('selected', false, {silent: true});
                    });
                },
                getSelected: function getSelected() {
                    return this.find(function(projectType) {
                        return projectType.get('selected');
                    });
                },
                selectProjectType: function selectProjectType(id) {
                    var projectType = this.get(id);

                    if (!projectType) return false;

                    this.unselect();

                    projectType.set('selected', true);
                    return projectType;
                }
            });
        }
);