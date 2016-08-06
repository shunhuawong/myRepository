define('jira/searchers/user-utils', [
    'jira/ajs/list/group-descriptor',
    'jira/ajs/list/item-descriptor',
    'underscore',
    'wrm/context-path'
], function(
    GroupDescriptor,
    ItemDescriptor,
    _,
    contextPath
) {

    // Creates group/item descriptors from an AJAX response.
    function _formatUserGroupResponse(response) {
        var users = _formatUserResponse(response.users, true);
        var groups = _formatGroupResponse(response.groups, true);
        var items = [].concat(users).concat(groups);
        return [new GroupDescriptor({items: items})];
    }

    function _formatUserResponse(response, prefix) {
        return _.map(response.users, function (item) {
            return new ItemDescriptor({
                highlighted: true,
                html: item.html,
                icon: item.avatarUrl,
                label: item.displayName,
                value: (prefix ? "user:" : "") + item.name
            });
        });
    }

    function _formatGroupResponse(response, prefix) {
        return _.map(response.groups, function (item) {
            return new ItemDescriptor({
                highlighted: true,
                html: item.html,
                icon: contextPath() + "/images/icons/icon_groups_16.png",
                label: item.name,
                value: (prefix ? "group:" : "") + item.name
            });
        });
    }

    return {
        formatGroupResponse: _formatGroupResponse,
        formatUserResponse: _formatUserResponse,
        formatUserGroupResponse: _formatUserGroupResponse
    };
});

define('jira/searchers/elements/user-group-sparkler', [
    'jira/ajs/select/checkbox-multi-select',
    'jira/data/parse-options-from-fieldset',
    'jira/searchers/user-utils',
    'jira/skate',
    'jquery',
    'wrm/context-path'
], function(
    CheckboxMultiSelect,
    parseOptionsFromFieldset,
    utils,
    skate,
    $,
    contextPath
) {

    return skate("js-usergroup-checkboxmultiselect", {
        type: skate.type.CLASSNAME,
        created: function usergroupSparklerCreated(element) {
            var ajaxData = {};
            // grab additional parameters from fieldset
            $(element).siblings(".user-group-searcher-params").each(function () {
                ajaxData = parseOptionsFromFieldset($(this));
            });
            ajaxData.showAvatar = true;
            new CheckboxMultiSelect({
                element: element,
                maxInlineResultsDisplayed: 10,
                content: "mixed",
                ajaxOptions: {
                    url: contextPath() + "/rest/api/latest/groupuserpicker",
                    data: ajaxData,
                    query: true,
                    formatResponse: utils.formatUserGroupResponse
                }
            });
        }
    });
});

define('jira/searchers/elements/user-sparkler', [
    'jira/ajs/select/checkbox-multi-select',
    'jira/searchers/user-utils',
    'jira/skate',
    'wrm/context-path'
], function(
    CheckboxMultiSelect,
    utils,
    skate,
    contextPath
) {

    return skate("js-user-checkboxmultiselect", {
        type: skate.type.CLASSNAME,
        created: function userSparklerCreated(element) {
            new CheckboxMultiSelect({
                element: element,
                maxInlineResultsDisplayed: 5,
                content: "mixed",
                ajaxOptions: {
                    url: contextPath() + "/rest/api/latest/user/picker",
                    data: {
                        showAvatar: true
                    },
                    query: true,
                    formatResponse: function (items) {
                        return utils.formatUserResponse(items, false);
                    }
                }
            });
        }
    });
});

define('jira/searchers/elements/group-sparkler', [
    'jira/ajs/select/checkbox-multi-select',
    'jira/searchers/user-utils',
    'jira/skate',
    'wrm/context-path'
], function(
    CheckboxMultiSelect,
    utils,
    skate,
    contextPath
) {

    return skate("js-group-checkboxmultiselect", {
        type: skate.type.CLASSNAME,
        created: function groupSparklerCreated(element) {
            new CheckboxMultiSelect({
                element: element,
                maxInlineResultsDisplayed: 5,
                content: "mixed",
                ajaxOptions: {
                    url: contextPath() + "/rest/api/latest/groups/picker",
                    data: {
                        showAvatar: true
                    },
                    query: true,
                    formatResponse: function (items) {
                        return utils.formatGroupResponse(items, false);
                    }
                }
            });
        }
    });
});

// Invoke immediately
require([
    'jira/searchers/elements/group-sparkler',
    'jira/searchers/elements/user-sparkler',
    'jira/searchers/elements/user-group-sparkler'
]);
