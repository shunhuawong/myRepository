(function(){
    var contextPath = null;

    (window.AJS || (window.AJS = {}));

    AJS.contextPath = function(){
        return contextPath ? contextPath : "";
    };

    AJS.$(function($){
        contextPath = $("meta[name='ajs-setup-context-path']").attr("content");
    });
}());

define ("wrm/context-path", [], function() {
    return function() {
        return AJS.contextPath();
    }
});