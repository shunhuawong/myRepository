(function() {
    "use strict";
    var Backbone = require('backbone');
    var extensions = {
        /**
         * This method unwraps the Backbone.View.
         *
         * By default, Backbone will create a <div> and render the template inside. By calling this
         * method, you can get rid of that <div>, so the main element in your template will be the
         * root element in your template.
         */
        unwrapTemplate: function unwrapTemplate() {
            if (this.$el.parent().length) {
                // If the template is already rendered in the page
                var children = this.$el.children();
                this.$el.replaceWith(children);
                this.setElement(children);
            } else {
                // If the template is in memory
                this.setElement(this.$el.children());
            }
        }
    };
    _.extend(Backbone.Marionette.View.prototype, extensions);
})();