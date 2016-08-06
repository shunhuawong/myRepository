define('jira/viewissue/watchers-voters/views/voters-view', ['require'], function(require) {
    var AuiMessages = require('aui/message');
    var Backbone = require('backbone');
    var _ = require('underscore');
    var jQuery = require('jquery');
    var TEMPLATES = JIRA.Templates.Issue;

    /**
     * View for Voters
     * @class VotersView
     * @extends Backbone.View
     */
    return Backbone.View.extend({
        $empty: undefined,

        initialize: function(options) {
            this.collection = options.collection;
            this.collection.bind("replace reset add remove", this.render, this);
        },

        renderNoWatchers: function () {
            if (this.$(".recipients li").length === 0) {
                this.$empty = AuiMessages.info({
                    closeable: false,
                    body: AJS.I18n.getText("voters.novoters")
                });
                this.$("fieldset").append(this.$empty);
            } else if (this.$empty) {
                this.$empty.remove();
            }
        },

        /**
         * Goes to server to get watchers before rendering contents
         *
         * @return {jQuery.Deferred}
         */
        render: function () {
            var deferred = jQuery.Deferred();
            this.collection.fetch().done(_.bind(function () {
                this.$el.html(TEMPLATES.usersListReadOnly({ users: this.collection.toJSON() }));
                this.renderNoWatchers();
                deferred.resolve(this.$el);
            }, this));
            return deferred.promise();
        }
    });
});
