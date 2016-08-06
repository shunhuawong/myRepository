define('jira/viewissue/watchers-voters/views/watchers-inline-dialog-view', ['require'], function (require) {
    var InlineDialog = require('aui/inline-dialog');
    var InlineDialog2 = require('aui/inline-dialog2'); // Initialises our view dialog
    var Backbone = require('backbone');
    var skate = require('jira/skate');

    var _setElement = Backbone.View.prototype.setElement;

    /**
     * A wrapper layer to house an AUI Inline Dialog for the Watchers list.
     * Exists because inline dialogs are finicky things and their API changes
     * across multiple versions of AUI.
     */
    return Backbone.View.extend({
        tagName: 'aui-inline-dialog2',
        className: 'aui-layer aui-inline-dialog',

        events: {
            'click .cancel': function(e) {
                e.preventDefault();
                this.hide();
            }
        },

        setElement: function(val) {
            var el = (val instanceof Backbone.$) ? val.get(0) : val;
            if (!el) {
                return; // don't set an empty element.
            }
            if (this.el && this.el !== el) {
                this.el.remove(); // detach from DOM, allow for GC.
            }
            _setElement.call(this, el);
            skate.init(this.el);
            return this;
        },
        contents: function(html) {
            this.$el.find('.aui-inline-dialog-contents').html(html);
        },
        show: function() {
            this.el.show(); // will break in AUI 5.9
        },
        hide: function() {
            this.el.hide(); // will break in AUI 5.9
        },
        isVisible: function() {
            return this.el.isVisible ? this.el.isVisible() : this.$el.is(':visible');
        }
    });
});
