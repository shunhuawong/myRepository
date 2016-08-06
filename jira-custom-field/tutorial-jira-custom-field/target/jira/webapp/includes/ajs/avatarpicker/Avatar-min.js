JIRA.Avatar=Class.extend({init:function(options){this._id=options.id;this._isSystemAvatar=options.isSystemAvatar;this._isSelected=options.isSelected;this._urls=options.urls},setUnSelected:function(){this._isSelected=false},setSelected:function(){this._isSelected=true},isSelected:function(){return !!this._isSelected},isSystemAvatar:function(){return this._isSystemAvatar},getId:function(){return this._id},getUrl:function(size){return this._urls[size]},toJSON:function(){return{id:this._id,isSystemAvatar:this._isSystemAvatar,isSelected:this._isSelected,urls:this._urls}}});JIRA.Avatar.createCustomAvatar=function(descriptor){descriptor.isSystemAvatar=false;return new JIRA.Avatar(descriptor)};JIRA.Avatar.createSystemAvatar=function(descriptor){descriptor.isSystemAvatar=true;return new JIRA.Avatar(descriptor)};JIRA.Avatar.getSizeObjectFromName=function(name){if("object"===typeof name){return name}var nameTrimmed="string"===typeof name?jQuery.trim(name):"";if(JIRA.Avatar.LARGE.param===name){return JIRA.Avatar.LARGE}else{if(JIRA.Avatar.MEDIUM.param===name){return JIRA.Avatar.MEDIUM}else{if(JIRA.Avatar.SMALL.param===name){return JIRA.Avatar.SMALL}else{if("xsmall"===name){return JIRA.Avatar.SMALL}else{return JIRA.Avatar.LARGE}}}}};JIRA.Avatar.LARGE={param:"large",height:48,width:48};JIRA.Avatar.MEDIUM={param:"medium",width:32,height:32};JIRA.Avatar.SMALL={param:"small",width:16,height:16};