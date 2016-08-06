AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/projecttypecollection"], function(ProjectTypeCollection) {
        module("ProjectTypeCollection", {
            setup: function() {
                this.projectTypes = [
                    {id: 'business'},
                    {id: 'software'},
                    {id: 'service-desk'}
                ];

                this.collection = new ProjectTypeCollection(this.projectTypes);
            }
        });

        test("should select project type when told to do so", function() {
            strictEqual(this.collection.get("business").get("selected"), undefined);
            var projectType = this.collection.selectProjectType("business");

            strictEqual(projectType.get("selected"), true);
            equal(projectType.get('id'), "business", "should return selected project type");
            strictEqual(this.collection.get("business").get("selected"), true);
        });


        test("Should return selected project type", function() {
            var projectType = this.collection.selectProjectType("service-desk");

            equal(this.collection.getSelected().get("id"), "service-desk");
            equal(projectType, this.collection.getSelected());
        });

        test("should unselect project type when told so", function() {
            this.collection.selectProjectType("software");

            var projectType = this.collection.getSelected();
            this.collection.unselect();

            strictEqual(projectType.get("selected"), false);
            strictEqual(this.collection.getSelected(), undefined);
        });

        test("should keep only one project type selected", function() {
            var business = this.collection.selectProjectType("business");
            var software = this.collection.get("software");

            this.collection.selectProjectType("software");

            strictEqual(business.get("selected"), false);
            strictEqual(software.get("selected"), true);
        });


    });
});
