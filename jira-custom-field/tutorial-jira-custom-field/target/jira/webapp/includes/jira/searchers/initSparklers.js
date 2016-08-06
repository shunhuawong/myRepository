define('jira/searchers/element/sparkler', [
    'jira/ajs/select/checkbox-multi-select',
    'jira/skate'
], function (CheckboxMultiSelect, skate) {

    return skate("js-default-checkboxmultiselect", {
        type: skate.type.CLASSNAME,
        created: function checkboxMultiSelectCreated(element) {
            new CheckboxMultiSelect({
                element: element
            });
        }
    });
});

define('jira/searchers/element/status-lozenge-sparkler', [
    'jira/ajs/select/checkbox-multi-select-status-lozenge',
    'jira/skate'
], function (CheckboxMultiSelectStatusLozenge, skate) {

    return skate("js-default-checkboxmultiselectstatuslozenge", {
        type: skate.type.CLASSNAME,
        created: function checkboxMultiSelectCreated(element) {
            new CheckboxMultiSelectStatusLozenge({
                element: element
            });
        }
    });
});

define("jira/searchers/element/label-sparkler", [
    'jira/ajs/select/checkbox-multi-select',
    'jira/ajs/list/group-descriptor',
    'jira/ajs/list/item-descriptor',
    'jira/skate',
    'jquery',
    'underscore',
    'wrm/context-path'
], function(
    CheckboxMultiSelect,
    GroupDescriptor,
    ItemDescriptor,
    skate,
    $,
    _,
    contextPath
) {

    return skate("js-label-checkboxmultiselect", {
        type: skate.type.CLASSNAME,
        created: function checkboxMultiSeletCreated(element) {
            var cms = new CheckboxMultiSelect({
                element: element,
                ajaxOptions: {
                    url: contextPath() + "/rest/api/1.0/labels/suggest",
                    query: true,
                    minQueryLength: 0,
                    formatResponse: function (response) {
                        var selectedValues = cms.model.getSelectedValues();
                        return [new GroupDescriptor({
                            items: _.map(_.sortBy(_.reject(response.suggestions, function (suggestion) {
                                return _.contains(selectedValues, suggestion.label);
                            }), "label"), function (suggestion) {
                                return new ItemDescriptor({
                                    highlighted: true,
                                    html: suggestion.html,
                                    label: suggestion.label,
                                    value: suggestion.label,
                                    title: suggestion.label
                                });
                            })
                        })];
                    }
                }
            });
        }
    });
});

// Invoke immediately
require([
    "jira/searchers/element/sparkler",
    "jira/searchers/element/status-lozenge-sparkler",
    "jira/searchers/element/label-sparkler"
]);
