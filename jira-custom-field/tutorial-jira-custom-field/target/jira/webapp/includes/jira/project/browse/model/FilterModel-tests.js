AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/filtermodel"], function (FilterModel)
    {
        module("FilterModel", {
            setup: function () {

                this.proj1 = {
                    id: '11',
                    projectCategoryId: 'first',
                    recent: true,
                    name: 'first',
                    key: 'FRST',
                    lead: 'admin',
                    projectTypeKey:'business'
                };
                this.proj2 = {
                    id: '22',
                    projectCategoryId: 'second',
                    recent: false,
                    name: 'second',
                    key: 'SCND',
                    lead: 'Admin',
                    projectTypeKey: 'software'
                };
                this.proj3 = {
                    id: '33',
                    projectCategoryId: 'meh',
                    recent: false,
                    name: 'meh',
                    key: 'THRD',
                    lead: 'Admin',
                    projectTypeKey: null
                };

                this.unfiltered = [this.proj1, this.proj2, this.proj3];

                this.mockPageableCollection = {
                    getPage: sinon.stub(),
                    originalCollection: this.unfiltered,
                    fullCollection: {
                        reset: sinon.stub()
                    }
                };

                this.filterModel = new FilterModel({}, {
                    pageableCollection: this.mockPageableCollection
                });
            }
        });

        test('Should filter collection when adding new filter criteria.', function () {
            this.filterModel.set("category", {id: 'first'});
            sinon.assert.calledOnce(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj1]);

            this.filterModel.set("contains", "nothing");
            sinon.assert.calledTwice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, []);
        });

        test('Should filter collection when changing existing filter criteria.', function () {
            this.filterModel.set("category", {id: 'does-not-exists'});
            this.filterModel.set("category", {id: 'second'});
            sinon.assert.calledTwice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj2]);

            this.filterModel.set("contains", "text");
            this.filterModel.set("contains", "nothing");
            sinon.assert.callCount(this.mockPageableCollection.fullCollection.reset, 4);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, []);
        });

        test('Should filter collection when removing filter criteria.', function() {
            this.filterModel.set("category", {id: 'first'});
            this.filterModel.unset("category");
            sinon.assert.calledTwice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, this.unfiltered);

            this.filterModel.set("contains", "nothing");
            this.filterModel.unset("contains");
            sinon.assert.callCount(this.mockPageableCollection.fullCollection.reset, 4);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, this.unfiltered);
        });

        test('should trigger event after collection is filtered', function() {
            var navigateHandler = sinon.spy();

            this.filterModel.on('filter', navigateHandler);

            this.filterModel.set("contains", "first");
            sinon.assert.calledOnce(navigateHandler);
            sinon.assert.calledWith(navigateHandler, {selectedCategory: '', selectedProjectType: '',  contains: 'first'});

            this.filterModel.set("category", {id: "recent"});
            sinon.assert.calledTwice(navigateHandler);
            sinon.assert.calledWith(navigateHandler, {selectedCategory: 'recent', selectedProjectType: '', contains: 'first'});

            this.filterModel.set("projectType", {id: "business"});
            sinon.assert.calledThrice(navigateHandler);
            sinon.assert.calledWith(navigateHandler, {selectedCategory: 'recent', selectedProjectType: 'business', contains: 'first'});
        });

        test('Should set page when filter is changed', function() {
            this.filterModel.set("category", {id: 'first'});
            sinon.assert.calledOnce(this.mockPageableCollection.getPage);
            sinon.assert.calledWith(this.mockPageableCollection.getPage, 1);

            this.filterModel.set("contains", "doesn't exist");
            sinon.assert.calledTwice(this.mockPageableCollection.getPage);
            sinon.assert.calledWith(this.mockPageableCollection.getPage, 1);
        });

        test('Should work for special category values', function() {
            this.filterModel.set("category", {id: 'second'});
            sinon.assert.calledOnce(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj2]);

            this.filterModel.set("category", {id: 'all'});
            sinon.assert.calledTwice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, this.unfiltered);

            this.filterModel.set("category", {id: 'recent'});
            sinon.assert.calledThrice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj2]);
        });

        test('Should work for empty or null project type', function() {
            this.filterModel.set("projectType", {id: ''});
            sinon.assert.calledOnce(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj3]);

            this.filterModel.set("projectType", {id: null});
            sinon.assert.calledTwice(this.mockPageableCollection.fullCollection.reset);
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj3]);
        });

        test('Filtering should be case insensitive.', function () {
            this.filterModel.set("contains", "FiRsT");
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj1]);

            this.filterModel.set("contains", "admin");
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, this.unfiltered);
        });

        test('Filtering should find strings in the middle of text.', function () {
            this.filterModel.set("contains", "rst");
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj1]);

            this.filterModel.set("contains", "COND");
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj2]);
        });

        test("Filtering should work even when the project fields are not defined", function() {
            var project = {
                id: '13'
            };
            this.unfiltered.push(project);


            this.filterModel.set("contains", "admin");
            sinon.assert.calledWith(this.mockPageableCollection.fullCollection.reset, [this.proj1, this.proj2, this.proj3]);
        })
    });
});
