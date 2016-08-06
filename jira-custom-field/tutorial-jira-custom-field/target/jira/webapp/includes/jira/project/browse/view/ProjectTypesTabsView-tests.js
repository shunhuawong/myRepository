AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/projecttypestabsview", 'jquery'], function (ProjectTypesTabsView, $) {
        module("ProjectTypesTabsView", {
            setup: function () {
                this.$markup = $(
                    '<ul>' +
                    '   <li><a href="#" rel="project-type-id">Tab 1</a></li>' +
                    '</ul>'
                );

                this.projectTypesTabsView = new ProjectTypesTabsView({
                    el: this.$markup
                });
            }
        });

        test('should trigger event when project type is clicked', function() {
            var projectTypeChangeHandler = sinon.spy();

            this.projectTypesTabsView.on('project-type-change', projectTypeChangeHandler);
            this.$markup.find('a').click();

            sinon.assert.calledOnce(projectTypeChangeHandler);
            sinon.assert.calledWith(projectTypeChangeHandler,'project-type-id');
        });
    });
});