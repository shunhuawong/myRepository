AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/projectcollectionview", "jira/project/browse/projecttypesservice", "jquery"], function (ProjectCollectionView, ProjectTypesService, $) {
        module("jira/project/browse/projectcollectionview", {
            setup: function () {
                var projectData = {
                    "id": "proj1",
                    "name": "Project 1",
                    "projectCategoryId": "cat1",
                    "projectCategoryName": "Category 1"
                };

                this.$projectTable = $("<table></table>").append(JIRA.Templates.Project.Browse.projectRow(projectData));
                this.collectionView = new ProjectCollectionView({
                    el: this.$projectTable
                });

                ProjectTypesService.init({ business: { icon: "business-icon" }});
            }
        });

        test("should trigger event when category is clicked", function() {
            var catChangeHandler = sinon.spy();
            this.collectionView.on("category-change", catChangeHandler);
            this.$projectTable.find("a.category").click();

            sinon.assert.calledOnce(catChangeHandler);
            sinon.assert.calledWith(catChangeHandler,"cat1");
        });

    });
});
