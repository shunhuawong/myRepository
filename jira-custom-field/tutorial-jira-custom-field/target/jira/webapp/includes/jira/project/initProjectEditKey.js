define('jira/project/project-edit-key/element', ['require'], function(require) {
    var ProjectEditKey = require('jira/project/project-edit-key');
    var skate = require('jira/skate');

    return skate('js-edit-project-fields', {
        type: skate.type.CLASSNAME,
        attached: function editProjectFieldsAttached(form) {
            form.projectEditKey = new ProjectEditKey(form);
        },
        events: {
            "click #edit-project-key-toggle": function toggleProjectKey(element, e) {
                element.toggle();
                e.preventDefault();
            }
        },
        prototype: {
            toggle: function() {
                this.projectEditKey.toggle();
            }
        }
    });
});

// Invoke immediately.
require(['jira/project/project-edit-key/element']);
