AJS.test.require("jira.webresources:browseprojects", function () {
    require(["jira/project/browse/tabsview", 'jquery'], function (TabsView, $) {
        module("TabsView", {
            setup: function () {
                this.$markup = $(
                    '<ul>' +
                    '   <li><a href="#" rel="category-id">Tab 1</a></li>' +
                    '</ul>'
                );

                this.tabsView = new TabsView({
                    el: this.$markup
                });
            }
        });

        test('should trigger event when category is clicked', function () {
            var catChangeHandler = sinon.spy();

            this.tabsView.on('category-change', catChangeHandler);
            this.$markup.find('a').click();

            sinon.assert.calledOnce(catChangeHandler);
            sinon.assert.calledWith(catChangeHandler,'category-id');
        });
    });
});
