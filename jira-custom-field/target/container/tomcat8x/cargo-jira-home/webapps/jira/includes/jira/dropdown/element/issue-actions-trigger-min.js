define("jira/dropdown/element/issue-actions-trigger",["jira/ajs/dropdown/dropdown","jira/skate","jquery"],function(Dropdown,skate,$){var TEMPLATE=JIRA.FRAGMENTS.issueActionsFragment;function getIssueActionFormatHandlers(){var options={};if(JIRA.Issues&&JIRA.Issues.Api){options.ajaxOptions={};options.ajaxOptions.formatError=JIRA.Issues.Api.showInlineIssueLoadError}return options}return skate("issue-actions-trigger",{type:skate.type.CLASSNAME,attached:function issueActionTriggerAttached(element){var $trigger=$(element);var dropdownConfig={hideOnScroll:".issue-container",trigger:$trigger,ajaxOptions:{dataType:"json",cache:false,formatSuccess:TEMPLATE},onerror:function(instance){instance.layerController.initialized=true;instance.hide()}};dropdownConfig=$.extend(true,dropdownConfig,getIssueActionFormatHandlers());new Dropdown(dropdownConfig);$trigger.addClass("trigger-happy")}})});