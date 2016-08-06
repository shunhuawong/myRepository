<%@ taglib prefix="ww" uri="webwork" %>
<%@ taglib prefix="aui" uri="webwork" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html lang="en">
<head>
    <title><ww:text name="'about.jira.name'"/></title>
    <meta name="decorator" content="panel-general" />
    <meta charset="UTF-8">
</head>
<body>

    <%-- SCRIPT --%>
    <script>
        // Capture Web Action properties
        define('jira-credits-web-action-properties', {
            sounds: {
                select1: new Audio("<ww:property value="/select1SoundURL" />"),
                select2: new Audio("<ww:property value="/select2SoundURL" />"),
                turnOff: new Audio("<ww:property value="/turnoff1SoundURL" />"),
                turnOn:  new Audio("<ww:property value="/turnon1SoundURL" />")
            },
            cursorURL: '<ww:property value="/handImageURL" />'
        });
        // Require Web Resources onto page dynamically
        WRM.require(["wrc!jira.webfragments.user.navigation.bar:jira-credits-web-resource"], function(){
            require(['jquery', 'jira-credits-game'], function($, credits){
                $(function() {
                    credits.init();
                });
            });
        });
    </script>

    <%-- STYLES --%>
    <link href='//fonts.googleapis.com/css?family=Press+Start+2P' rel='stylesheet' type='text/css'>
    <style>
        /* Inject web action property into CSS */
        #jira-credits-cursor {
            background: url('<ww:property value="/cursorImageURL" />') no-repeat;
        }
    </style>

    <%-- CONTENT --%>
    <div id="jira-credits-container" class="jira-credits-vga" style="width:1024px;height:570px;background-color:#758b54">

        <!-- HOME PAGE -->
        <div id="jira-credits-home" class="jira-credits-vga">
            <img src="<ww:property value="/grassImageURL" />" alt="" class="jira-credits-grass" id="jira-credits-grass-1">
            <img src="<ww:property value="/grassImageURL" />" alt="" class="jira-credits-grass" id="jira-credits-grass-2">
            <img src="<ww:property value="/grassImageURL" />" alt="" class="jira-credits-grass" id="jira-credits-grass-3">
            <div class="jira-credits-heading">
                <span>JIRA <ww:property value="/buildVersion"/> Credits</span>
                <span class="jira-credits-instructions">
                    <span class="jira-credits-faint">Move</span> (up/down)
                    <span class="jira-credits-faint">Select</span> (enter)
                    <span class="jira-credits-sound-button jira-credits-clickable">Sound?</span>
                </span>
            </div>
            <div class="jira-credits-home-logo">
                <img src="<ww:property value="/jiraViiImageURL" />" />
            </div>

            <table id="jira-credits-home-loading">
                <tr class="jira-credits-row-item">
                    <td>Loading...</td>
                </tr>
            </table>
            <table id="jira-credits-home-menu">
                <tr id="jira-credits-home-button-game" class="jira-credits-home-button jira-credits-row-item jira-credits-clickable">
                    <td class="jira-credits-arrow"><img src="<ww:property value="/handImageURL" />" alt="select"></td>
                    <td>Play</td>
                </tr>
                <tr id="jira-credits-home-button-list" class="jira-credits-home-button jira-credits-row-item jira-credits-clickable">
                    <td class="jira-credits-arrow"><img src="<ww:property value="/handImageURL" />" alt="select"></td>
                    <td>List</td>
                </tr>
            </table>
        </div>

        <!-- LIST -->
        <div id="jira-credits-list" class="jira-credits-vga">
            <div class="jira-credits-heading">
                <span class="jira-credits-clickable jira-credits-back-button">< Home (Q)</span>
                <span class="jira-credits-instructions">
                    <span class="jira-credits-faint">Scroll Page</span> (page up/down)
                    <span class="jira-credits-faint">Move</span> (up/down)
                    <span class="jira-credits-faint">Select</span> (enter)
                    <span class="jira-credits-sound-button jira-credits-clickable">Sound?</span>
                </span>
            </div>
            <table id="jira-credits-list-rows"></table>
            <div class="jira-credits-instructions jira-credits-list-instructions">
            </div>
        </div>

        <!-- MAP -->
        <div id="jira-credits-game" class="jira-credits-vga">
            <div class="jira-credits-heading">
                <span class="jira-credits-clickable jira-credits-back-button">< Home (Q)</span>
                <span class="jira-credits-instructions">
                    <span class="jira-credits-faint">List</span> (L)
                    <span class="jira-credits-faint">Move</span> (up/down/left/right)
                    <span class="jira-credits-sound-button jira-credits-clickable">Sound?</span>
                </span>
            </div>
            <div id="jira-credits-board-container">
                <div id="jira-credits-board" class="moveable">
                    <img src='<ww:property value="/mapImageURL" />' alt="">
                </div>
                <div id="jira-credits-cursor" class="moveable"></div>
            </div>
            <div id="jira-credits-hud">
                <span id="jira-credits-name">Name</span>
                <span id="jira-credits-desc">Desc2</span>
                <span id="jira-credits-level">Level</span>
            </div>
            <!--<div id="jira-credits-minimap"></div>-->
        </div>

    </div>

</body>
</html>
