define('jira/viewissue/watchers-voters/views/watchers-view', ['require'], function(require) {
    var AbstractWatchersView = require('jira/viewissue/watchers-voters/views/abstract-watchers-view');
    var MultiUserListPicker = JIRA.MultiUserListPicker;
    var Meta = require('jira/util/data/meta');
    var _ = require('underscore');
    var TEMPLATES = JIRA.Templates.Issue;

    /**
     * View to handles internal content of inline dialog
     *
     * @class WatchersView
     * @extends AbstractWatchersView
     */
    return AbstractWatchersView.extend({

        events: {
            selected: "addWatcherToModel",
            unselect: "removeWatcherFromModel"
        },

        /**
         * Renders contents. Should only be called when watchers have been fetched.
         * @private
         */
        _render: function () {
            this.$el.html(TEMPLATES.watchersWithBrowse({ watchers: this.collection.toJSON() }));
            var picker = new MultiUserListPicker({
                element: this.$el.find(".watchers-user-picker"),
                width: 220
            });
            this.$el.find('.js-add-watchers-label').attr('for', picker.$field.attr('id'));
        },

        /**
         * @inheritdoc
         */
        focus: function () {
            this.$el.find("#watchers-textarea").focus();
        },

        /**
         * Adds watcher on server
         * @param e
         * @param descriptor
         */
        addWatcherToModel: function (e, descriptor) {
            e.preventDefault();
            this.collection.addWatcher(descriptor.value()).done(_.bind(function () {
                this._incrementWatcherCount();
                if (descriptor.value() === Meta.get("remote-user")) {
                    this.watch();
                }
            }, this));
        },

        /**
         * Removes watcher on server
         * @param e
         * @param descriptor
         */
        removeWatcherFromModel: function (e, descriptor) {
            this.collection.removeWatcher(descriptor.value()).done(_.bind(function () {
                this._decrementWatcherCount();
                if (descriptor.value() === Meta.get("remote-user")) {
                    this.unwatch();
                    JIRA.trace("jira.issue.watcher.deleted");
                }
            }, this));
        }
    });
});
