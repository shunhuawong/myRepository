;(function() {
    var KeyboardShortcut = require('jira/ajs/keyboardshortcut/keyboard-shortcut');
    var KeyboardShortcutToggle = require('jira/ajs/keyboardshortcut/keyboard-shortcut-toggle');
    var Meta = require('jira/util/data/meta');
    var JiraDialog = require('jira/dialog/dialog');
    var AuiDropdown = require('aui/dropdown');
    var AuiPopup = require('aui/popup');
    var jQuery = require('jquery');

    /**
     * Ignore keyboard shortcuts when we have a dialog, dropdwon etc shown.
     */
    KeyboardShortcut.addIgnoreCondition(function () {
        return AuiPopup.current || AuiDropdown.current || JiraDialog.current || KeyboardShortcutToggle.areKeyboardShortcutsDisabled();
    });

    jQuery(function() {
        if (!!Meta.get("keyboard-shortcuts-enabled")) {
            KeyboardShortcutToggle.enable();
        } else {
            KeyboardShortcutToggle.disable();
        }

        if (AJS.keys) {
            AJS.activeShortcuts = KeyboardShortcut.fromJSON(AJS.keys.shortcuts);

            // Blur field when ESC key is pressed.
            jQuery(document).bind("aui:keyup", function(event) {
                var $target;
                var beforeBlurInput;

                // Short-circuit quickly if the key wasn't the escape key.
                if (event.key !== "Esc") { return; }

                $target = jQuery(event.target);
                if ($target.is(":input:not(button[type='button'])")) {
                    // Fire beforeBlurInput event to give inputs a chance to prevent blurring
                    beforeBlurInput = new jQuery.Event("beforeBlurInput");
                    $target.trigger(beforeBlurInput, [{
                        reason: "escPressed"
                    }]);
                    if (!beforeBlurInput.isDefaultPrevented()) {
                        $target.blur();
                    }
                }
            });
        }
    });

})();
