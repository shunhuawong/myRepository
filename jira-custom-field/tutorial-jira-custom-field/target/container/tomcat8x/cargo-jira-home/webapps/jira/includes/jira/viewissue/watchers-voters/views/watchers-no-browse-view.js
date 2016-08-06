define('jira/viewissue/watchers-voters/views/watchers-no-browse-view', ['require'], function(require) {
    var AbstractWatchersView = require('jira/viewissue/watchers-voters/views/abstract-watchers-view');
    var Meta = require('jira/util/data/meta');
    var _ = require('underscore');
    var $ = require('jquery');
    var TEMPLATES = JIRA.Templates.Issue;

    /**
     * @class WatchersNoBrowseView
     * @extends AbstractWatchersView
     */
    return AbstractWatchersView.extend({

        events: {
            "click .remove-recipient" : "removeWatcher",
            "submit" : "addWatcher"
        },

        addWatcher: function (e) {
            e.preventDefault();
            this.removeInlineError();
            var $field = $("#watchers-nosearch");
            var username = $.trim($field.val());
            $field.attr("disabled", "disabled");
            if (this.hasUsername(username)) {
                $field.removeAttr("disabled");
                this.showInlineError(AJS.I18n.getText("watching.manage.user.already.watching", username));
                $field.val("");
            } else {
                this.collection.getUser(username).done(_.bind(function (data) {
                    var html = JIRA.Templates.Fields.recipientUsername({
                        icon: data.avatarUrls["16x16"],
                        username: data.name,
                        displayName: data.displayName
                    });
                    if (username === Meta.get("remote-user")) {
                        this.watch();
                    }
                    $field.val("");
                    this.$(".watchers").append(html);
                    this.collection.addWatcher(data.name);
                    this._incrementWatcherCount();
                }, this)).fail(_.bind(function (xhr) {
                    if (xhr.status === 404) {
                        this.showInlineError(AJS.I18n.getText("admin.viewuser.user.does.not.exist.title"));
                    }
                }, this)).always(function () {
                    $field.removeAttr("disabled").focus();
                });
            }

        },

        hasUsername: function (username) {
            var result = false;
            this.$(".watchers li").each(function () {
                if ($(this).attr("data-username") === username) {
                    result = true;
                    return false;
                }
            });
            return result;
        },

        removeInlineError: function () {
            this.$(".error").remove();
        },

        showInlineError: function (msg) {
            $("<div />").addClass("error").text(msg).insertAfter(this.$(".description"));
        },

        focus: function () {
            $("#watchers-nosearch").focus();
        },

        removeWatcher: function (e) {
            e.preventDefault();
            var $item = $(e.target).closest("li");
            var username = $item.attr("data-username");
            if (username) {
                $item.remove();
                this.collection.removeWatcher(username);
                this._decrementWatcherCount();
                if (username === Meta.get("remote-user")) {
                    this.unwatch();
                }
            }
            JIRA.trace("jira.issue.watcher.deleted");
        },
        _render: function () {
            this.$el.html(TEMPLATES.watchersNoBrowse({ watchers: this.collection.toJSON() }));
        }
    });

});
