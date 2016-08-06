define('jira/dropdown/element/default-dropdown', [
    'jira/ajs/dropdown/dropdown',
    'jira/skate',
    'jquery'
], function(Dropdown, skate, $) {

    /**
     * These are the buttons in the toolbar of a view issue page, such as the
     * workflow transition buttons (the "More" link), the "Admin" options, or
     * the "Export" button, etc.
     *
     * @skate js-default-dropdown
     */
    return skate("js-default-dropdown", {
        type: skate.type.CLASSNAME,
        created: function dropdownCreated(element) {

        },
        attached: function dropdownAttached(element) {
            var $trigger = $(element);
            var $content = $trigger.next(".aui-list");
            var alignment = $trigger.attr("data-alignment") || AJS.RIGHT;
            var hasDropdown = !!$trigger.data("hasDropdown");

            if ($content.length === 0) {
                console.warn("Dropdown init failied. Could not find content. Printing culprit...");
                console.log($trigger);
            }

            if (!hasDropdown) {
                $trigger.data("hasDropdown", true);
                new Dropdown({
                    trigger: $trigger,
                    content: $content,
                    alignment: alignment,
                    setMaxHeightToWindow: $trigger.attr("data-contain-to-window"),
                    hideOnScroll: $trigger.attr("data-hide-on-scroll") || ".issue-container"
                });
            }
        }
    });
});
