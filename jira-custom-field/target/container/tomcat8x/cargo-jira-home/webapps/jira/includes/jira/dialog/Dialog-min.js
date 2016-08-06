define("jira/dialog/dialog",["jira/ajs/control","jira/ajs/layer/inline-layer","jira/util/data/meta","jira/ajs/ajax/smart-ajax","jira/loading/loading","jira/xsrf","jira/util/browser","jira/util/events","jira/util/navigator","aui/dropdown","jquery","underscore","wrm/require"],function(Control,InlineLayer,Meta,SmartAjax,Loading,XSRF,Browser,Events,Navigator,AuiDropdown,jQuery,_,wrmRequire){var bindAJS=AJS.bind;var unbindAJS=AJS.unbind;var dimAJS=AJS.dim;var layerAJS=AJS.layer;var LayerManager=AJS.LayerManager.global;var Dialog=Control.extend({_getDefaultOptions:function(){return{height:"auto",cached:false,widthClass:"medium",modeless:false,ajaxOptions:{data:{inline:true,decorator:"dialog"}}}},init:function(options){if(typeof options==="string"||options instanceof jQuery){options={trigger:options}}else{if(options&&options.width){options.widthClass="custom"}}this.classNames=Dialog.ClassNames;this.OPEN_DIALOG_SELECTOR="."+this.classNames.DIALOG+"."+this.classNames.DIALOG_OPEN;this.options=jQuery.extend(true,this._getDefaultOptions(),options);this.options.width=Dialog.WIDTH_PRESETS[this.options.widthClass]||options.width;if(typeof this.options.content==="function"){this.options.type="builder"}else{if(this.options.content instanceof jQuery||(typeof this.options.content==="object"&&this.options.nodeName)){this.options.type="element"}else{if(!this.options.type&&!this.options.content||(typeof this.options.content==="object"&&this.options.content.url)){this.options.type="ajax"}}}if(this.options.trigger){var triggerArray=jQuery.makeArray(this.options.trigger);var instance=this;jQuery.each(triggerArray,function(index,trigger){instance._assignEvents("trigger",trigger)})}this.onContentReadyCallbacks=[];this._assignEvents("container",document);this.initModeless();this.defineResources();if(this.options.prefetchResources){this.downloadResources()}},initModeless:function(){this.options.modeless=!!this.options.modeless;if(this.options.modeless){if(false===this.options.windowTitle){this.options.windowTitle=document.title}this._temporarilyHidden=false;this._auiDialogShowHandler=this._auiDialogHandlers.hideTemporarily.bind(this);this._auiDialogHideHandler=this._auiDialogHandlers.restoreVisibility.bind(this);this._auiDialogRemoveHandler=this._auiDialogHandlers.restoreVisibilityRebindable.bind(this);bindAJS("show.dialog",this._auiDialogShowHandler);bindAJS("hide.dialog",this._auiDialogHideHandler);bindAJS("remove.dialog",this._auiDialogRemoveHandler);if(AJS.dialog2){this._auiDialog2ShowHandler=this._auiDialog2Handlers.hideTemporarily.bind(this);this._auiDialog2HideHandler=this._auiDialog2Handlers.restoreVisibility.bind(this);AJS.dialog2.on("show",this._auiDialog2ShowHandler);AJS.dialog2.on("hide",this._auiDialog2HideHandler)}}},_runContentReadyCallbacks:function(){var that=this;jQuery.each(this.onContentReadyCallbacks,function(){this.call(that)})},_setContent:function(content,decorate){var node;if(!this.resourcesReady().isResolved()){this._showloadingIndicator();this.resourcesReady().done(this._setContent.bind(this,content,decorate));return }if(!content){this._contentRetrievers[this.options.type].call(this,this._setContent)}else{if(Dialog.current===this){this.get$popup().show().css("visibility","hidden").addClass("popup-width-"+this.options.widthClass);this.$content=content;this.get$popupContent().html(content);if(decorate!==false){if(this.decorateContent){this.decorateContent()}}if((node=this.get$popupContent().find("."+this.classNames.HEADING_AREA)).size()>0){this.get$popupHeading().replaceWith(node)}if((node=this.get$popupContent().find("."+this.classNames.CONTENT_AREA)).size()>0){node.contents().insertAfter(node);node.remove()}this._positionInCenter();if(decorate!==false){jQuery(document).trigger("dialogContentReady",[this]);this._runContentReadyCallbacks()}this.get$popup().css("visibility","");if(decorate!==false){if(jQuery.isFunction(this.options.onContentRefresh)){this.options.onContentRefresh.call(this)}}this._onShowContent()}else{if(this.options.cached===false){delete this.$content}}}},_ellipsify:function(context){if(!(context instanceof jQuery)){context=this.get$popup()}jQuery(".overflow-ellipsis",context).textOverflow({className:"ellipsified"})},_handleInitialDoneResponse:function(data,xhr,smartAjaxResult){},getRequestUrlFromTrigger:function(){if(this.$activeTrigger&&this.$activeTrigger.length){return this.$activeTrigger.attr("href")||this.$activeTrigger.data("url")}},_getRequestOptions:function(){var options={};if(this._getAjaxOptionsObject()===false){return false}options=jQuery.extend(true,options,this._getAjaxOptionsObject());if(!options.url){options.url=this.getRequestUrlFromTrigger()}return options},_getAjaxOptionsObject:function(){var ajaxOpts=this.options.ajaxOptions;if(jQuery.isFunction(ajaxOpts)){return ajaxOpts.call(this)}else{return ajaxOpts}},_contentRetrievers:{"element":function(callback){if(!this.$content){this.$content=jQuery(this.options.content).clone(true)}callback.call(this,this.$content)},"builder":function(callback){var instance=this;if(!this.$content){this._showloadingIndicator();this.options.content.call(this,function(content){instance.$content=jQuery(content);callback.call(instance,instance.$content)})}},"ajax":function(callback){var instance=this;var ajaxOptions;if(!this.$content){ajaxOptions=this._getRequestOptions();this._showloadingIndicator();this.serverIsDone=false;ajaxOptions.complete=function(xhr,textStatus,smartAjaxResult){if(smartAjaxResult.successful){var instructions=instance._detectRedirectInstructions(xhr);instance.serverIsDone=instructions.serverIsDone;if(instructions.redirectUrl){instance._performRedirect(instructions.redirectUrl)}else{if(ajaxOptions.dataType&&ajaxOptions.dataType.toLowerCase()==="json"&&instance._buildContentFromJSON){instance.$content=instance._buildContentFromJSON(smartAjaxResult.data)}else{instance.$content=smartAjaxResult.data}if(instance.serverIsDone){instance._handleInitialDoneResponse(smartAjaxResult.data,xhr,smartAjaxResult)}else{callback.call(instance,instance.$content)}}}else{var errorContent=SmartAjax.buildDialogErrorContent(smartAjaxResult);callback.call(instance,errorContent)}};SmartAjax.makeRequest(ajaxOptions)}}},_detectRedirectInstructions:function(xhr){var instructions={serverIsDone:false,redirectUrl:""};var doneHeader=xhr.getResponseHeader("X-Atlassian-Dialog-Control");if(doneHeader){instructions.serverIsDone=true;var idx=doneHeader.indexOf("redirect:");if(idx===0){instructions.redirectUrl=doneHeader.substr("redirect:".length)}else{if(doneHeader==="permissionviolation"){instructions.redirectUrl=window.location.href}}}return instructions},_performRedirect:function(url){Browser.reloadViaWindowLocation(url)},_renders:{popupHeading:function(){var $el=jQuery("<div />");return $el.addClass(this.classNames.HEADING_AREA)},popupContent:function(){return jQuery("<div />").addClass(this.classNames.CONTENT_AREA)},popup:function(){return jQuery("<div />").attr("id",this.options.id||"").addClass(this.classNames.DIALOG).toggleClass(this.classNames.MODELESS_DIALOG,this.options.modeless).hide()}},_events:{"trigger":{simpleClick:function(e,item){this.$activeTrigger=item;if(!this.$activeTrigger.is("a")){this.$activeTrigger=item.find("a")}this.show();e.preventDefault()}},"container":{"keydown":function(e){if(e.which===jQuery.ui.keyCode.ESCAPE){var aborted=this.handleCancel();if(Navigator.isIE()&&Navigator.majorVersion()<12&&aborted===false){e.preventDefault()}}}}},handleCancel:function(){return this.hide(true,{reason:Dialog.HIDE_REASON.escape})},_showloadingIndicator:function(){Loading.showLoadingIndicator()},_hideloadingIndicator:function(){Loading.hideLoadingIndicator()},_positionInCenter:function(){var $window=jQuery(window);var $popup=this.get$popup();var $container=this.getContentContainer();var $contentArea=this.getContentArea();var cushion=40;var windowHeight=$window.height();var top=0;if(typeof this.options.width==="number"){$popup.width(this.options.width)}if(!this.options.modeless){$popup.css({marginLeft:-$popup.outerWidth()/2,marginTop:Math.max(-$popup.outerHeight()/2,cushion-windowHeight/2)});var el=$popup[0];while(el){top+=el.offsetTop;el=el.offsetParent}}else{top=Math.round(windowHeight/2)}var popupMaxHeight=Math.max(windowHeight-top-cushion,Dialog.CONSTRAINTS.MODELESS_MIN_HEIGHT);var padding=parseInt($contentArea.css("padding-top"),10)+parseInt($contentArea.css("padding-bottom"),10);$contentArea.css("maxHeight","");var contentMaxHeight=popupMaxHeight-($popup.outerHeight()-$container.outerHeight())-padding;$contentArea.css("maxHeight",contentMaxHeight);jQuery(this).trigger("contentMaxHeightChanged",[contentMaxHeight])},getContentArea:function(){return this.$popup.find(".form-body")},getContentContainer:function(){var $container=this.$popup.find(".content-area-container");if($container.length===1){return $container}else{return this.$popup.find(".form-body")}},get$popup:function(){if(!this.$popup){this.$popup=this._render("popup").appendTo("body");this.$popup.addClass("box-shadow")}return this.$popup},bindAnchorsToDialog:function($anchors){var instance=this;$anchors.click(function(e){instance.$activeTrigger=jQuery(this);delete instance.$content;instance._setContent();e.preventDefault()})},get$popupContent:function(){if(!this.$popupContent){this.$popupContent=this._render("popupContent").appendTo(this.get$popup())}return this.$popupContent},get$popupHeading:function(){if(!this.$popupHeading){this.$popupHeading=this._render("popupHeading").prependTo(this.get$popup())}return this.$popupHeading},getLoadingIndicator:function(){return this.get$popupContent().find(".throbber:last")},showFooterLoadingIndicator:function(){var $throbber=this.getLoadingIndicator();if($throbber.length){if(!$throbber.data("spinner")){$throbber.addClass("loading").spin()}else{if(!$throbber.hasClass("loading")){$throbber.addClass("loading")}}}},hideFooterLoadingIndicator:function(){var $throbber=this.getLoadingIndicator();if($throbber.length){$throbber.removeClass("loading");_.defer(function(){if(!$throbber.hasClass("loading")){$throbber.spinStop()}})}},_watchTab:function(e){var $dialog_selectable;var $first_selectable;var $last_selectable;if(jQuery(e.target).parents(this.get$popupContent()).length>0){if(jQuery("html").hasClass("safari")){$dialog_selectable=jQuery(":input:visible:enabled, :checkbox:visible:enabled, :radio:visible:enabled",this.OPEN_DIALOG_SELECTOR)}else{$dialog_selectable=jQuery("a:visible, :input:visible:enabled, :checkbox:visible:enabled, :radio:visible:enabled",this.OPEN_DIALOG_SELECTOR)}$first_selectable=$dialog_selectable.first();$last_selectable=$dialog_selectable.last();if((e.target===$first_selectable[0]&&e.shiftKey)||(e.target===$last_selectable[0]&&!e.shiftKey)){if(e.shiftKey){$last_selectable.focus()}else{$first_selectable.focus()}e.preventDefault()}}},_show:function(forceReload){if(InlineLayer.current){InlineLayer.current.hide()}if(AuiDropdown.current){AuiDropdown.current.hide()}if(Dialog.current){var prev;if(Dialog.current.options.stacked){prev=Dialog.current;prev.stacked=true;prev.hide(false);this.prev=prev}else{Dialog.stackroot=this;var current=Dialog.current;prev=current._removeStackState();current.hide(false);while(prev){current=prev;prev=current._removeStackState();current._destroyIfNecessary()}}}else{if(this.stacked!==true){Dialog.stackroot=this;Dialog.originalWindowTitle=document.title}}if(!this.options.modeless){if(this.prev&&this.prev.options.modeless){dimAJS(false)}else{if(this.stacked!==true){dimAJS(false)}}}Dialog.current=this;var $popup=this.get$popup().addClass(this.classNames.DIALOG_OPEN);if(forceReload||(this.options.type!=="blank"&&!this.$content&&this.stacked!==true)){delete this.$content;this._setContent()}else{$popup.show();this._positionInCenter();this._onShowContent()}this.tabWatcher=function(e){if(e.keyCode===9){Dialog.current._watchTab(e)}};jQuery(document).bind("keydown",this.tabWatcher);jQuery(this).trigger("Dialog.show",[this.$popup,this,this.id]);Events.trigger("Dialog.show",[this.$popup,this,this.id]);if(!this.options.modeless){Browser.disableKeyboardScrolling()}this.stacked=false},show:function(forceReload){var delayShow=this.options.delayShowUntil;var instance=this;if(Dialog.current===this){return false}var localBeforeShowEvent=new jQuery.Event("beforeShow");var globalBeforeShowEvent=new jQuery.Event("beforeShow");jQuery(this).trigger(localBeforeShowEvent);Events.trigger(globalBeforeShowEvent,[this.options.id]);if(localBeforeShowEvent.isDefaultPrevented()||globalBeforeShowEvent.isDefaultPrevented()){return false}this.downloadResources();if(delayShow){var promise=delayShow();if(promise.state()==="resolved"){instance._show(forceReload)}else{if(!this.options.modeless){dimAJS(false)}this._showloadingIndicator();promise.done(function(){instance._show(forceReload)})}}else{instance._show(forceReload)}},_setWindowTitle:function(){var titleOption=this.options.windowTitle;var $container=this.get$popup();var dialogTitle;var $heading;if(titleOption===false){return }else{if(typeof titleOption==="string"){dialogTitle=titleOption}else{if(typeof titleOption==="function"){dialogTitle=titleOption.call(this)}else{$heading=$container.find("."+this.classNames.HEADING_AREA);if($heading.length){dialogTitle=$heading.text()}}}}if(!dialogTitle){return }var jiraTitle=Meta.get("app-title");var newTitle=[dialogTitle];if(jiraTitle){newTitle.push(jiraTitle)}document.title=newTitle.join(" - ")},_onShowContent:function(){this._setWindowTitle();this._hideloadingIndicator();this._ellipsify();this.get$popup().addClass(this.classNames.CONTENT_READY)},_resetWindowTitle:function(){if(this.stacked!==true&&Dialog.stackroot===this){if(Dialog.originalWindowTitle){if(document.title!==Dialog.originalWindowTitle){document.title=Dialog.originalWindowTitle}delete Dialog.originalWindowTitle}}},notifyOfNewContent:function(){if(this.$content){this.decorateContent();this._positionInCenter();this._onShowContent();jQuery(document).trigger("dialogContentReady",[this])}},destroy:function(){if(this.options.modeless){if(AJS.dialog2){AJS.dialog2.off("show",this._auiDialog2ShowHandler);AJS.dialog2.off("hide",this._auiDialog2HideHandler);delete this._auiDialog2ShowHandler;delete this._auiDialog2HideHandler}unbindAJS("show.dialog",this._auiDialogShowHandler);unbindAJS("hide.dialog",this._auiDialogHideHandler);unbindAJS("remove.dialog",this._auiDialogRemoveHandler);delete this._auiDialogShowHandler;delete this._auiDialogHideHandler;delete this._auiDialogRemoveHandler}this.$popup&&this.$popup.remove();delete this.$popup;delete this.$popupContent;delete this.$popupHeading;delete this.$content},_destroyIfNecessary:function(){!this.options.cached&&this.destroy()},_removeStackState:function(){var prev=this.prev;delete this.prev;delete this.stacked;return prev},isCurrent:function(){return Dialog.current===this},hide:function(undim,options){if(Dialog.current!==this){return }var globalBeforeHideEvent=new jQuery.Event("Dialog.beforeHide");var localBeforeHideEvent=new jQuery.Event("Dialog.beforeHide");options=options||{};Events.trigger(globalBeforeHideEvent,[this.$popup,options.reason,this.options.id]);jQuery(this).trigger(localBeforeHideEvent,[this.$popup,options.reason,this.options.id]);if(globalBeforeHideEvent.isDefaultPrevented()||localBeforeHideEvent.isDefaultPrevented()){return false}var atlToken=jQuery("input[name=atl_token]",this.OPEN_DIALOG_SELECTOR).attr("value");if(atlToken!==undefined){XSRF.updateTokenOnPage(atlToken)}if((undim!==false&&!this.prev&&!this.options.modeless)||(this.prev&&this.prev.options.modeless)){AJS.undim()}this.get$popup().removeClass(this.classNames.DIALOG_OPEN).removeClass(this.classNames.CONTENT_READY).hide();this._hideloadingIndicator();this._resetWindowTitle();jQuery(document).trigger("hideAllLayers",[this.$popup,options.reason,this.options.id]);jQuery(this).trigger("Dialog.hide",[this.$popup,options.reason,this.options.id]);Events.trigger("Dialog.hide",[this.$popup,options.reason,this.options.id]);Dialog.current=null;if(this.options.cached===false&&this.stacked!==true){this.destroy()}if(!this.options.modeless){Browser.enableKeyboardScrolling()}if(this.tabWatcher){jQuery(document).unbind("keydown",this.tabWatcher)}if(this.stacked!==true){if(this.prev){this.prev.show(!!this.prev.options.reloadOnPop);delete this.prev}else{if(Dialog.stackroot===this){delete Dialog.stackroot}}}},addHeading:function(heading){var $pieces=jQuery("<div/>").html(heading).contents();var $title=jQuery("<h2/>");var contents=[];$pieces.each(function(i){if(this.nodeName.toLowerCase()==="div"){contents.push(this)}else{$title.append(this)}});this.get$popupHeading().html(contents).append($title);$title.attr("title",jQuery.trim($title.text()))},onContentReady:function(func){if(jQuery.isFunction(func)){this.onContentReadyCallbacks.push(func)}},_auiDialogHandlers:{hideTemporarily:function(ev,data){if(this._temporarilyHidden){return }this._hideTemporarily()},restoreVisibility:function(ev,data){if(!this._temporarilyHidden){return }var dialog2El=LayerManager.getTopLayer();var layer=!!dialog2El&&layerAJS(dialog2El);if(layer&&layer.isVisible()&&layer.isBlanketed()){return }this._restoreVisibility()},restoreVisibilityRebindable:function(ev,data){this._restoreVisibility(ev,data);var rebindRemoveHandler=function(){bindAJS("remove.dialog",this._auiDialogRemoveHandler)};setTimeout(rebindRemoveHandler.bind(this),0)}},_auiDialog2Handlers:{hideTemporarily:function(ev,el){if(this._temporarilyHidden){return }this._hideTemporarily()},restoreVisibility:function(ev,el){if(!this._temporarilyHidden){return }if(AJS.popup.current&&AJS.popup.current.element.is(":visible")){return }while(el){var layer=layerAJS(el);if(layer.isVisible()&&layer.isBlanketed()){return }el=layer.below()}this._restoreVisibility()}},_hideTemporarily:function(){this.get$popup().addClass(this.classNames.DIALOG_NOT_VISIBLE);this._temporarilyHidden=true},_restoreVisibility:function(){this.get$popup().removeClass(this.classNames.DIALOG_NOT_VISIBLE);this._temporarilyHidden=false},defineResources:function(){if(_.isFunction(this.options.defineResources)){this.options.defineResources.call(this)}},requireContext:function(contextName){this.requireResource(contextName,"wrc!")},requireResource:function(resourceName,prefix){this.wrmResources=this.wrmResources||[];this.wrmResources.push((prefix||"wr!")+resourceName)},getRequiredResources:function(){return this.wrmResources||[]},downloadResources:function(){if(this.getRequiredResources().length>0&&!this.deferredResources){this.deferredResources=wrmRequire(this.getRequiredResources())}},resourcesReady:function(){if(this.deferredResources){return this.deferredResources.promise()}else{return new jQuery.Deferred().resolve().promise()}}});Dialog.ClassNames={DIALOG:"jira-dialog",HEADING_AREA:"jira-dialog-heading",CONTENT_AREA:"jira-dialog-content",DIALOG_OPEN:"jira-dialog-open",CONTENT_READY:"jira-dialog-content-ready",MODELESS_DIALOG:"jira-dialog-modeless",DIALOG_NOT_VISIBLE:"jira-dialog-not-visible"};Dialog.WIDTH_PRESETS={small:360,medium:540,large:810};Dialog.CONSTRAINTS={MODELESS_MIN_HEIGHT:240};Dialog.HIDE_REASON={cancel:"cancel",escape:"esc",submit:"submit"};return Dialog});AJS.namespace("AJS.FlexiPopup",null,require("jira/dialog/dialog"));AJS.namespace("JIRA.Dialog",null,require("jira/dialog/dialog"));