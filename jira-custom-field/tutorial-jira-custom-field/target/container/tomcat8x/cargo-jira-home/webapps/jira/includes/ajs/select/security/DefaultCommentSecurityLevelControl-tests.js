AJS.test.require([], function() {

    require([
        'jira/ajs/select/security/default-comment-security-level-control',
        'jquery'
    ],
    function(
        DefaultCommentSecurityLevelControl,
        jQuery
    ) {
        var assert = sinon.assert;

        module("SaveDefaultLevelControl", {
            setup: function() {
                var $defaultCommentLevelSpan = jQuery('<span class="default-comment-level" data-project-id="123456"></span>');
                var $errorSpan = jQuery('<span class="security-level-inline-error"></span>');
                var adapterMock = {
                    selectUnavailble: function(text) {}
                };

                var defaultControl = new DefaultCommentSecurityLevelControl($defaultCommentLevelSpan, $errorSpan, adapterMock);

                this.$containerSpan = jQuery('<span class="default-comment-level-container"/>');
                this.defaultModelMock = {
                    updateDefault: function() {}
                };
                var lvlObj = {
                    level: 'foo',
                    levelName: 'bar'
                };
                this.saveControl = new defaultControl._SaveDefaultLevelControl(this.$containerSpan, this.defaultModelMock, lvlObj);
            }
        });

        test("check if _putStatusSpan is setting correct content", function() {
            this.saveControl._putStatusSpan({
                text: "this is text",
                status: "this is status",
                fade: false,
                icon_classes: "those are icon classes",
                text_classes: "those are text classes"
            });

            var $status = this.$containerSpan.find('.default-comment-level-status');
            equal($status.attr('status'), 'this is status', 'status should be set to "this is status"');

            var $icon = this.$containerSpan.find('.default-comment-level-status-icon');
            ok($icon.hasClass('those') && $icon.hasClass('are') && $icon.hasClass('icon') && $icon.hasClass('classes'),
                'icon should have specified classes');

            var $text = this.$containerSpan.find('.default-comment-level-status-text');
            ok($text.hasClass('those') && $text.hasClass('are') && $text.hasClass('text') && $text.hasClass('classes'),
                'text should have specified classes');
            equal($text.text(), 'this is text', 'text should be set to "this is text"');
        });

        test("check if _putLinkToSetDefault creates only one link", function() {
            this.saveControl._sendDefaultChangedAnalytics = function(){};
            this.defaultModelMock.updateDefault = this.sandbox.spy();

            var linkToSetDefault = this.$containerSpan.find('.default-comment-level-switch');

            equal(linkToSetDefault.length, 1, 'there should be exactly 1 link to set default');
        });

        test("check if link created by _putLinkToSetDefault() is calling updateDefault() when clicked", function() {
            this.saveControl._sendDefaultChangedAnalytics = function(){};
            this.defaultModelMock.updateDefault = this.sandbox.spy();

            var linkToSetDefault = this.$containerSpan.find('.default-comment-level-switch');

            linkToSetDefault.trigger('click');

            assert.calledOnce(this.defaultModelMock.updateDefault, 'updateDefault should be called once');

            var lvlObj = this.defaultModelMock.updateDefault.getCall(0).args[0];
            ok(lvlObj.level == 'foo' && lvlObj.levelName == 'bar', 'updateDefault should be called with proper object');

        });

        module("DefaultCommentSecurityLevelControl", {

            SecuritySelectAdapterMock: function() {
                this.hasSecurityLevel = function(level) {
                    return false;
                };

                this.selectUnavailble = function(){};

                this.selectLevel = function(){};

                this.getSelectedLevel = function() {
                    return "foo";
                };

                this.getSelectedLevelName = function() {
                    return "bar";
                };
            },

            setup: function() {
                this.sandbox = sinon.sandbox.create();
                this.$defaultCommentLevelSpan = jQuery('<span class="default-comment-level" data-project-id="123456"></span>');
                this.$errorSpan = jQuery('<span class="security-level-inline-error"></span>');
                this.adapterMock = new this.SecuritySelectAdapterMock();
                this.saveControl = new DefaultCommentSecurityLevelControl(
                    this.$defaultCommentLevelSpan, this.$errorSpan, this.adapterMock);

                this.saveControl.selectionSpi.selectUnavailble = this.sandbox.spy();
                this.saveControl.selectionSpi.selectLevel = this.sandbox.spy();
            }
        });

        test("check if _applyDefaultToSelection() called with available level sets selection to this level", function() {
            this.saveControl.selectionSpi.hasSecurityLevel = function() { return true; };

            this.saveControl.defaultLevelModel.updateDefault = this.sandbox.spy();

            this.saveControl._applyDefaultToSelection({level: 'foo', levelName: 'bar'});

            assert.calledOnce(this.saveControl.selectionSpi.selectLevel,
                'selectLevel should be called exactly once');
            assert.calledWith(this.saveControl.selectionSpi.selectLevel, 'foo');
        });

        test("check if _applyDefaultToSelection() called with available, but outdated levelname updates default to have new levelname", function() {
            this.saveControl.selectionSpi.hasSecurityLevel = function() { return true; };

            this.saveControl.defaultLevelModel.updateDefault = this.sandbox.spy();

            this.saveControl._applyDefaultToSelection({level: 'foo', levelName: 'outdated bar'});

            assert.calledOnce(this.saveControl.defaultLevelModel.updateDefault,
                'updateDefault should be called once');

            var lvlObj = this.saveControl.defaultLevelModel.updateDefault.getCall(0).args[0];
            ok(lvlObj.level == 'foo' && lvlObj.levelName == 'bar', 'updateDefault should be called with proper object');
        });

        test("check if _applyDefaultToSelection() called with not available level makes unavailable selection", function() {
            this.saveControl.selectionSpi.hasSecurityLevel = function() { return false; };

            this.saveControl._applyDefaultToSelection({level: 'foo', levelName: 'bar'});

            assert.calledOnce(this.saveControl.selectionSpi.selectUnavailble, 'unavailable selection should be made');
        });
    });
});