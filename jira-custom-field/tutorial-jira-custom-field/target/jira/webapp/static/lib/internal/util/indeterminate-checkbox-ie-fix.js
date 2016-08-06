/**
 * Fix problems with checkbox with indeterminate state on IE:
 * - IE doesn't fire `change` event on click (by mouse or space) on checkbox with indeterminate state
 * - on FF and Chrome transition is `indeterminate -> checked`. On IE by default transition is `indeterminate -> unchecked`.
 *   After fix transition on IE is the same as in FF and Chrome.
 */
define("internal/util/indeterminate-checkbox-ie-fix", [
    'internal/util/navigator',
    'jira/skate',
    'jquery'
], function(
    Navigator,
    skate,
    $
) {
    function clickedOrPressedSpace(event) {
        return event.type === "mouseup" || event.type === "click" || (event.type === "keyup" && event.keyCode === 32);
    }

    // do not initialize plugin if browser is not IE
    if (!Navigator.isIE()) {
        return;
    }

    // skate is not exported as module, yet so we are relying on a global variable
    skate('indeterminate-ie-fix', {
        type: skate.type.CLASSNAME,
        insert: function(element) {
            var $element = $(element);
            var initialIndeterminateState;

            $element.on("keyup mouseup", function(event) {
                if (clickedOrPressedSpace(event)) {
                    initialIndeterminateState = $element.is(":indeterminate");
                }
            });

            $element.click(function(event) {
                if (!clickedOrPressedSpace(event)) {
                    return;
                }

                if (initialIndeterminateState) {
                    $element.prop('checked', true);
                    $element.trigger('change');
                }
            });
        }
    });
});
