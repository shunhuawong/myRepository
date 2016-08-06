(function () {
    var jQuery =  require('jquery');
    var Events =  require('jira/util/events');
    var Types =  require('jira/util/events/types');
    var Tabs = require('jira/viewissue/tabs');

    jQuery(function () {
        // Remembering focused activity after we refresh panel
        if (Types.PANEL_REFRESHED) {
            // kickass
            Events.bind(Types.PANEL_REFRESHED, function (e, panel, $new, $existing) {
                if (panel === "activitymodule") {
                    var $focusedTab = $existing.find("#issue_actions_container > .issue-data-block.focused");
                    //assume only one focused tab
                    if ($focusedTab.length === 1) {
                        $new.find("#" + $focusedTab.attr("id")).addClass("focused");
                    }
                }
            });
        }
    });

    Events.bind(Types.NEW_CONTENT_ADDED, function(event, $el) {
        Tabs.domReady($el);
    });
})();