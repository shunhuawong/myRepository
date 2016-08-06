AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/categorycollection"], function(CategoryCollection) {
        module("CategoryCollection", {
            setup: function() {
                this.categories = [
                    {id: 'one'},
                    {id: 'two'},
                    {id: 'three'}
                ];

                this.collection = new CategoryCollection(this.categories);
            }
        });

        test("should select category when told to do so", function() {
            strictEqual(this.collection.get("one").get("selected"), undefined);
            var category = this.collection.selectCategory("one");

            strictEqual(category.get("selected"), true);
            equal(category.get('id'), "one", "should return selected category");
            strictEqual(this.collection.get("one").get("selected"), true);
        });

        test("Should return selected category", function() {
            var category = this.collection.selectCategory("three");

            equal(this.collection.getSelected().get("id"), "three");
            equal(category, this.collection.getSelected());
        });

        test("should unselect categories when told so", function() {
            this.collection.selectCategory("two");

            var category = this.collection.getSelected();
            this.collection.unselect();

            strictEqual(category.get("selected"), false);
            strictEqual(this.collection.getSelected(), undefined);
        });

        test("should keep only one category selected", function() {
            var one = this.collection.selectCategory("one");
            var two = this.collection.get("two");

            this.collection.selectCategory("two");

            strictEqual(one.get("selected"), false);
            strictEqual(two.get("selected"), true);
        });
    });
});
