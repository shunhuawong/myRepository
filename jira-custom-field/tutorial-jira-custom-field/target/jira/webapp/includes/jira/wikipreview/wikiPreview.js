define('jira/wikipreview/wiki-preview', [
    'wrm/context-path',
    'jquery'
], function(
    contextPath,
    jQuery
) {

    /**
     * @typedef {Object} ScrollSaver
     * @memberof module:jira/wikipreview/wiki-preview
     * @property {Function} show - reveals scrollSaver
     * @property {Function} hide - hides scrollSaver
     */

    /**
     * @exports jira/wikipreview/wiki-preview
     * @param {Object} prefs
     * @param {HTMLElement=} [ctx]
     * @returns WikiPreviewControl
     */
    return function wikiPreview(prefs, ctx)
    {

        var field;
        var editField;
        var trigger;
        var inPreviewMode = false;
        var origText;

        /**
         * Gets and sets fields as jQuery objects
         * @private
         */
        var setFields = function ()
        {
            field = jQuery("#" + prefs.fieldId, ctx);
            editField = jQuery("#" + prefs.fieldId + "-wiki-edit", ctx);
            trigger = jQuery("#" + prefs.trigger, ctx);
        };

        /**
         * Prevents scroll flicker from happending when at the bottom of the page
         *
         * @private
         * @return {ScrollSaver}
         */
        var scrollSaver = function ()
        {
            var elem;
            return {
                show: function ()
                {
                    if (!elem)
                    {
                        elem = jQuery("<div>").html("&nbsp;").css({height: "300px"}).insertBefore(editField);
                    }
                    elem.css({display: "block"});
                },
                hide: function ()
                {
                    elem.css({display: "none"});
                }
            };
        }();

        /**
         *
         * If preview not present, uses REST to get preview of rendered wiki markup. Otherwise restores original state.
         * @private
         */
        var toggleRenderPreview = function ()
        {
            if (!inPreviewMode)
            {
                editField.find(".content-inner").css({
                    maxHeight: field.css("maxHeight")
                });
                this.showPreview();
            }
            else
            {
                editField.find(".content-inner").css({
                    maxHeight: ""
                });
                this.showInput();
            }
        };

        /**
         * This function replaces the input with the rendered content.
         *
         * @param {String} data from the AJAX call
         */
        var renderData = function(data)
        {
            editField.originalHeight = editField.height();
            scrollSaver.show();
            editField.addClass("previewClass");
            origText = field.val();
            field.hide();
            trigger.removeClass("loading").addClass("selected");
            changePreviewAccessibleTextTo(AJS.I18n.getText('renderer.preview.close', prefs.fieldId));
            editField.find(".content-inner").html(data);
            scrollSaver.hide();
            inPreviewMode = true;
            jQuery(document).trigger("showWikiPreview", [editField]);
            // IE!!! - I will get to the bottom of this one day but for now work around.
            setTimeout(function() {
                trigger.focus();
            },0);
        };

        var handleError = function(previewer){
            return function(XMLHttpRequest, textStatus, errorThrown)
            {
                trigger.removeClass("loading");
                origText = field.val();
                /* [alert] */
                if (textStatus){
                    alert(textStatus);
                }
                if (errorThrown){
                    alert(errorThrown);
                }
                /* [alert] end */
                previewer.showInput();

            };
        };

        var changePreviewAccessibleTextTo = function(accessibleText)
        {
            trigger.find('.wiki-renderer-icon').text(accessibleText);
        };

        /**
         * @name WikiPreviewControl
         * @inner
         */
        return {

            /**
             * Make a request using the textarea/input value and displays the response (rendered wiki content)
             * @memberof WikiPreviewControl
             */
            showPreview: function () {
                var that = this;

                var pid = jQuery("#pid", ctx).val();
                var issueType = jQuery("#issuetype", ctx).val();

                // Handle case where project is a frother control
                if (jQuery.isArray(pid)) {
                    pid = pid[0];
                }

                // Handle case where issue type is a frother control
                if (jQuery.isArray(issueType)) {
                    issueType = issueType[0];
                }

                jQuery("#" + prefs.trigger, ctx).addClass("loading");
                jQuery.ajax({
                    url: contextPath() + "/rest/api/1.0/render",
                    contentType: "application/json",
                    type:'POST',
                    data: JSON.stringify({
                        rendererType: prefs.rendererType,
                        unrenderedMarkup: field.val(),
                        issueKey: prefs.issueKey,
                        projectId: pid,
                        issueType: issueType
                    }),
                    dataType: "html",
                    success: renderData,
                    error: handleError(that)
                });
            },

            /**
             * This restores the input field to allow the user to enter wiki text.
             * @memberof WikiPreviewControl
             */
            showInput: function (e) {
                if (editField) {
                    scrollSaver.show();
                    // clear the height before we reset
                    editField.css({height: ""});
                    editField.removeClass("previewClass").find(".content-inner").empty();
                    field = jQuery("#" + prefs.fieldId, ctx);
                    field.val(origText);
                    field.show();
                    field.focus();
                    trigger.removeClass("selected");
                    changePreviewAccessibleTextTo(AJS.I18n.getText('renderer.preview', prefs.fieldId));
                    scrollSaver.hide();

                    inPreviewMode = false;
                    jQuery(document).trigger("showWikiInput", [editField]);
                }
            },

            /**
             * Applies click handler to trigger and associated behaviour.
             * @memberof WikiPreviewControl
             */
            init: function ()
            {
                var that = this;
                var $trigger;

                if (prefs instanceof jQuery) {
                    prefs = jQuery.readData(prefs);
                }

                $trigger = jQuery("#" + prefs.trigger, ctx);
                $trigger.click(function(e) {
                    if (!$trigger.hasClass("loading")) {
                        setFields();
                        toggleRenderPreview.call(that);
                    }
                    e.preventDefault();
                });
            }
        };

    };

});

/** Preserve legacy namespace
    @deprecated jira.app.wikiPreview */
AJS.namespace("jira.app.wikiPreview", null, require('jira/wikipreview/wiki-preview'));
AJS.namespace('JIRA.wikiPreview', null, require('jira/wikipreview/wiki-preview'));
