(function () {
    var SingleSelect = require('jira/ajs/select/single-select');

    function initSingleGroupPickers(ctx) {
        ctx.find('.js-default-single-group-picker').each(function () {
            var $el = jQuery(this);
            var $emptyValue = $el.find('option[data-empty]');
            var showLabels = $el.data("show-labels") === true;
            var userName = $el.data("user-name");
            new SingleSelect({
                element: this,
                itemAttrDisplayed: "label",
                revertOnInvalid: true,
                ajaxOptions:  {
                    data: function (query) {
                        return {
                            userName: userName,
                            query: query,
                            exclude: $el.val()
                        };
                    },
                    url: contextPath + "/rest/api/2/groups/picker",
                    query: true, // keep going back to the sever for each keystroke
                    formatResponse: function(data) {
                        var formattedData = JIRA.GroupPickerUtil.formatResponse(data, showLabels);
                        if ($emptyValue.length && $el.val() !== '') {
                            formattedData.unshift(new AJS.ItemDescriptor({
                                value: '',
                                label: $emptyValue.text(),
                                highlighted:true
                            }));
                        }
                        return formattedData;
                    }
                }
            });
        });
    }

    JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function (e, context, reason) {
        if (reason !== JIRA.CONTENT_ADDED_REASON.panelRefreshed) {
            initSingleGroupPickers(context);
        }
    });

})();
