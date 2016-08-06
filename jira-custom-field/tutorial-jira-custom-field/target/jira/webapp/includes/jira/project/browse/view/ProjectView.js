define('jira/project/browse/projectview',
    ['jquery', 'underscore', 'backbone'],
    function ($, _, Backbone) {
        "use strict";

        return Backbone.Marionette.ItemView.extend({
            template: JIRA.Templates.Project.Browse.projectRow,
            onRender: function onRender() {
                this.unwrapTemplate();
            }
        });
    });