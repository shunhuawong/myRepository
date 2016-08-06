define("jira/issuenavigator/issue-navigator/shortcuts",["jira/issuenavigator/issue-navigator","jira/focus/set-focus","jira/ajs/persistence","jira/util/events","jira/issue","jira/message","jquery"],function(IssueNavigator,SetFocus,Persistence,Events,Issue,Messages,$){var Shortcuts={};Shortcuts._quickEditSessionCompleteHandler=function(e,issues){IssueNavigator.setIssueUpdatedMsg();IssueNavigator.reload()};Shortcuts._quickCreateSubtaskSessionCompleteHandler=function(e,issues){var lastIssue=issues[issues.length-1],msg=Issue.issueCreatedMessage(lastIssue,true);IssueNavigator.setIssueUpdatedMsg({issueMsg:msg});IssueNavigator.reload()};var $rows,index,$nextPage,$previousPage,helpText,isLoadingNewPage=false;var issueIdToRowIndex={};$(document).ready(function(){if(IssueNavigator.isNavigator()){var $focusedRow;var focusedClassName=/(?:^|\s)focused(?!\S)/;var preventFocus=function(){$(this).attr("tabIndex",-1)};$rows=$("#issuetable").find("tr.issuerow");$rows.each(function(i){var $row=$(this);$("a.hidden-link",this).blur(preventFocus);if(!$focusedRow&&focusedClassName.test(this.className)){$focusedRow=$row;index=i}issueIdToRowIndex[$row.attr("rel")]=i});if(!$focusedRow){$focusedRow=$rows.first().addClass("focused")}var jqlHasFocus=$("#jqltext").hasClass("focused");if(!jqlHasFocus){var triggerConfig=new SetFocus.FocusConfiguration();triggerConfig.focusNow=function(){focusRow(index)};SetFocus.pushConfiguration(triggerConfig)}$(document).keypress(function(e){if(e.keyCode=="13"&&$("div.aui-blanket").length==0){var target=e.target;if(target===undefined||target.nodeName==="HTML"||target.nodeName==="BODY"||target==document){if(hasResults()&&$rows[index]){window.location=contextPath+"/browse/"+$rows.eq(index).data("issuekey")}}}});var $pager=$("div.pagination").first(),shouldFocusSearch=$("#focusSearch").attr("content")==="true";$nextPage=$pager.find("a.icon-next");$previousPage=$pager.find("a.icon-previous");if(!shouldFocusSearch){var activeElement=$(document.activeElement);if(activeElement.is(":input")){activeElement.blur()}}if(hasResults()&&!$(document.activeElement).is(":input")){setTimeout(function(){$rows.eq(index).scrollIntoView()},0)}$(".issue-actions-trigger").click(function(){var $row=$(this).closest("tr");var issueId=$row.attr("rel");if(issueId){Shortcuts.focusRow(issueId,0,true)}});Events.bind("QuickCreateSubtask.sessionComplete",Shortcuts._quickCreateSubtaskSessionCompleteHandler);Events.bind("QuickEdit.sessionComplete",Shortcuts._quickEditSessionCompleteHandler)}});Shortcuts.selectNextIssue=function(){if(hasResults()&&!isLoadingNewPage){if(index===$rows.length-1){followLink($nextPage)}else{unselectRow(index++);selectRow(index)}}};Shortcuts.selectPreviousIssue=function(){if(hasResults()&&!isLoadingNewPage){if(index===0){followLink($previousPage)}else{unselectRow(index--);selectRow(index)}}};Shortcuts.viewSelectedIssue=function(){if(hasResults()&&$($rows[index]).length){try{window.location=contextPath+"/browse/"+$($rows[index]).data("issuekey")}catch(err){}}};Shortcuts.focusRow=function(issueId,delay,supressLinkFocus){if(hasResults()){if(issueId){selectRowViaIssueId(issueId,delay,supressLinkFocus)}else{if(!supressLinkFocus){$($rows[index]).find("a:first").focus()}}}};Shortcuts.focusSearch=function(){var $jqlTextArea=$("#jqltext");$("#jira").scrollIntoView();if($jqlTextArea.length>0){$jqlTextArea.focus()}else{var $issuenav=$("#issuenav");if($issuenav.hasClass("lhc-collapsed")){$(".toggle-lhc").click()}var $textSection=$("#navigator-filter-subheading-textsearch-group");if($textSection.hasClass("collapsed")){$("#searcher-pid").focus()}else{$("#searcher-query").focus()}}};function hasResults(){return $rows&&$rows.length>0}function followLink($a){var href=$a.attr("href");if(href){isLoadingNewPage=true;Persistence.nextPage("blurSearch",true);window.location=href;setTimeout(function(){isLoadingNewPage=false},5000)}}function unselectRow(i){var $td=$($rows[i]).find("td:first");$($rows[i]).removeClass("focused");helpText=$td.attr("title");$td.removeAttr("title")}function selectRow(i,delay,supressLinkFocus){var $selected=$($rows[i]).addClass("focused").scrollIntoView();$selected.find("td").first().attr("title",helpText);if(!supressLinkFocus){focusRow(i)}}function selectRowViaIssueId(issueId,delay,supressLinkFocus){var newIndex=issueIdToRowIndex[issueId];if(newIndex||newIndex===0){unselectRow(index);selectRow(index=newIndex,delay,supressLinkFocus)}}function focusRow(i){var $selected=$($rows[i]);$selected.find(".hidden-link").removeAttr("tabIndex").focus()}return Shortcuts});AJS.namespace("jira.app.issuenavigator.shortcuts",null,require("jira/issuenavigator/issue-navigator/shortcuts"));AJS.namespace("JIRA.IssueNavigator.Shortcuts",null,require("jira/issuenavigator/issue-navigator/shortcuts"));