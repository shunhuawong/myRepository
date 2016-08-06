AJS.test.require([], function() {

    require([
        'jira/ajs/select/security-level-select',
        'jquery'
    ],
    function(
        SecuritySelect,
        jQuery
    ) {

        module("SecurityLevelSelect", {
            setup: function() {
                this.$securityLevelDiv = jQuery(
                    '<div class="security-level">' +
                        '<a class="drop" href="#">' +
                            '<span class="security-level-drop-icon aui-icon aui-icon-small aui-iconfont-unlocked"/>' +
                            '<span class="icon drop-menu"></span>' +
                        '</a>' +
                        '<select name="commentLevel" id="commentLevel" data-enable-default="false">' +
                            '<option value="option1" selected="true">Option 1</option>' +
                            '<option value="option2">Option 2</option>' +
                            '<option value="option3">Option 3</option>' +
                        '</select>' +
                        '<span class="current-level"></span>' +
                        '<span class="default-comment-level" data-project-id="123456"></span>' +
                    '</div>');

                this.$commentLevel = this.$securityLevelDiv.find("#commentLevel");

                this.levelSelect = new SecuritySelect(this.$commentLevel);
            }
        });

        test("check if _updateView() makes comment-level span show proper text", function() {
            var selectionDescriptor = this.$securityLevelDiv.find('option[value="option2"]').data("descriptor");
            this.levelSelect._updateView(selectionDescriptor);

            var $commentLevelSpan = this.$securityLevelDiv.find('.current-level');

            equal($commentLevelSpan.text(), AJS.I18n.getText("security.level.restricted.to", "Option 2"),
                "comment-level span should be showing 'Option 2' selected");
        });
    });
});