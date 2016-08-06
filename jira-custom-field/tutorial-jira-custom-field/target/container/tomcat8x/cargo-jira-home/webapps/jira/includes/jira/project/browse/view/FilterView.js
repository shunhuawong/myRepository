define('jira/project/browse/filterview',
    ['backbone', 'underscore'],
    function(Backbone, _) {
        return Backbone.Marionette.ItemView.extend({
            ui: {
                'contains': '.text'
            },
            events: {
                'change @ui.contains': 'inputContains',
                'keydown @ui.contains': 'inputContains',
                'submit form': 'formSubmit'
            },
            modelEvents: {
                'change:category': 'render',
                'change:projectType': 'render'
            },
            template: JIRA.Templates.Project.Browse.filter,
            inputContains: _.debounce(function inputsContains(e) {
                var filter = this.ui.contains.val();
                this.model.set('contains', filter);
            }, 300),
            formSubmit: function formSubmit(e) {
                e.preventDefault();
            }
        });
    }
);