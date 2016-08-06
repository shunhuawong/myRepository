AJS.test.require("jira.webresources:browseprojects", function() {
    require(["jira/project/browse/filterview", 'jquery'], function (FilterView, $) {
        module("FilterView", {
            setup: function () {
                this.mockModel = {
                    set: sinon.stub(),
                    get: sinon.stub().returns(""),
                    on: sinon.stub(),
                    off: sinon.stub()
                };
                this.view = new FilterView({
                    el: $(
                        '<div>' +
                        '    <input type="text" class="text" value="">' +
                        '</div>'
                    ),
                    model: this.mockModel
                });
                this.view.bindUIElements();
            }
        });

        test('Should debounce contains input changes.', function () {
            var clock = sinon.useFakeTimers();

            this.view.ui.contains.val("1");
            this.view.ui.contains.trigger("input");
            clock.tick(100);
            this.view.ui.contains.trigger("change");
            clock.tick(100);
            this.view.ui.contains.trigger("input");
            clock.tick(310);

            ok(this.mockModel.set.calledOnce, "Model was changed only once");
            ok(this.mockModel.set.calledWith("contains", "1"), "Model was changed only once");

            clock.restore();
        });
    });
});
