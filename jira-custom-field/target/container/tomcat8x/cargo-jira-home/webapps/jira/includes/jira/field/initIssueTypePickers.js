/**
 * Initialises issuetype picker frother fields
 *
 * @deprecated All initialization of issue type fields has been moved to initProjectIssueTypeSelect.
 */

(function () {

    function createissueTypePicker(context) {
        context.find(".issuetype-field").each(function () {

            var $select = jQuery(this);

            // Remove redundant "please select" option
            $select.bind("reset", function () {
                $select.find("option[value='']").remove();
            }).trigger("reset");

            new AJS.SingleSelect({
                element: this,
                revertOnInvalid: true
            });

        });
    }
})();

