/**
 *
 * A way to handle duplicate access keys in forms. So for instance using accesskey="s" does not submit a different form
 * to the one you have focus in.
 *
 * @example
 * jQuery("form").handleAccessKeys();
 *
 * @function external:"jQuery.fn".handleAccessKeys
 * @param {Boolean} options.selective - Remove all access keys or just the ones that exist elsewhere
 */
jQuery.fn.handleAccessKeys = function (options) {

    var accessKeyAttr = "accesskey";

    if (jQuery.browser.msie && jQuery.browser.version == "7.0") {
        accessKeyAttr = "accessKey";
    }

    options = options || {};

    this.each(function () {

        var $form = AJS.$(this),
            accesskeyElements = {
                getBlackList: _.once(function getBlackList() {
                    var blacklist = [];
                    this.getMyAccesskeyElems().each(function () {
                        if (this.hasAttribute(accessKeyAttr)) {
                            blacklist.push(this.getAttribute(accessKeyAttr).toLowerCase());
                        }
                    });
                    return blacklist;
                }),
                getMyAccesskeyElems: _.once(function getMyAccesskeyElems() {
                    return jQuery(":input[" + accessKeyAttr + "], a[" + accessKeyAttr + "]", $form);
                }),
                getOtherAccesskeyElems: _.once(function getOtherAccesskeyElems() {
                    return jQuery("form")
                            .not($form)
                            .find(":input[" + accessKeyAttr + "], a[" + accessKeyAttr + "]")
                })
            };

        if (!$form.is("form")) {
            console.warn("jQuery.fn.handleAccessKeys: node type [" + $form.prop("nodeName") + "] is not valid. "
                + "Only <form> supported");
            return this;
        }

        if ($form.data("handleAccessKeys.applied")) {
            return;
        }

        $form.data("handleAccessKeys.applied", true);

        $form.delegate(":input, a", "focus", function() {
            removeAccessKeys(accesskeyElements.getOtherAccesskeyElems(), accesskeyElements.getBlackList());
            attachAccessKeys(accesskeyElements.getMyAccesskeyElems());
        })
        .delegate(":input, a", "blur", function () {
            attachAccessKeys(accesskeyElements.getOtherAccesskeyElems());
        });

    });

    function isInvalid(key, blackList) {
        if (key) {
            if (options.selective === false) {
                return true;
            }
            if (/[a-z]/i.test(key)) {
                key = key.toLowerCase();
            }
            return jQuery.inArray(key, blackList) !== -1;
        }
    }

    function attachAccessKeys ($accessKeyElems) {
        $accessKeyElems.each(function () {
            var $this = AJS.$(this);
            if ($this.data(accessKeyAttr)) {
                $this.attr(accessKeyAttr, $this.data(accessKeyAttr));
            }
        });
    }

    function removeAccessKeys ($accessKeyElems, blackList) {
       $accessKeyElems.each(function () {
            var $this = AJS.$(this);
            if (isInvalid($this.attr(accessKeyAttr), blackList)) {
                $this.data(accessKeyAttr, $this.attr(accessKeyAttr));
                $this.removeAttr(accessKeyAttr);
            }
        });
    }

    return this;
};
