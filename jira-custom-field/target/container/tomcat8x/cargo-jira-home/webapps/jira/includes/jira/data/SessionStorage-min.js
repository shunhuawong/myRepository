define("jira/data/session-storage",function(){return{nativesupport:true,length:function(){return sessionStorage.length},key:function(index){return sessionStorage.key(index)},getItem:function(key){return sessionStorage.getItem(key)},setItem:function(key,value){return sessionStorage.setItem(key,value)},removeItem:function(key){return sessionStorage.removeItem(key)},clear:function(){return sessionStorage.clear()},asJSON:function(){var len=this.length();var jsData="{\n";for(var i=0;i<len;i++){var key=this.key(i);var value=this.getItem(key);jsData+=key+":"+value;if(i<len-1){jsData+=","}jsData+="\n"}jsData+="}\n";return jsData}}});AJS.namespace("jira.app.session.storage",null,require("jira/data/session-storage"));AJS.namespace("JIRA.SessionStorage",null,require("jira/data/session-storage"));