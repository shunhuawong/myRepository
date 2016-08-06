AJS.test.require(["jira.webresources:select-model"], function() {
    require([
        'jira/ajs/select/suggestion-collection-model',
        'jquery'
    ],
    function(
        SuggestionCollectionModel,
        jQuery
    ) {
        module('SuggestionCollectionModel', {
            createModel: function(descriptors, id) {
                jQuery('<div/>')
                   .attr('id', id + '-options')
                   .attr('data-suggestions', JSON.stringify(descriptors))
                   .appendTo('#qunit-fixture');

                return new SuggestionCollectionModel({ element: '#' + id });
            },
            setup: function() {
                this.descriptors = [
                    {
                        label: 'Group 1',
                        items: [
                            {label: 'Descriptor 1', value: '1'},
                            {label: 'Descriptor 2', value: '2',selected:true}
                        ]
                    },
                    {label: 'Ungrouped 1',value: '1'},
                    {
                        label: 'Group 2',
                        items: [
                            {label: 'Descriptor 3', value: '3'},
                            {label: 'Descriptor 4', value: '4',selected:true},
                            {label: 'Descriptor 5', value: '5'},
                            {label: 'Descriptor 6', value: '1'}
                        ]
                    },
                    {label: 'Ungrouped 2',value: '2'},
                    {label: 'Ungrouped 3',value: '6'}
                ];
                var id = 'modelValue';
                this.$element = jQuery('<input type="text"/>').attr('id', id).appendTo(jQuery('#qunit-fixture'));
                this.model = this.createModel(this.descriptors, 'modelValue');
            }
        });

        test('Model properly parses descriptors', function() {
            var selected = this.model.getDisplayableSelectedDescriptors();
            var unselected = this.model.getUnSelectedDescriptors();

            equal(this.model.getAllDescriptors().length, this.descriptors.length, 'all of the descriptors should be parsed');
            equal(selected.length, 1, 'by default it should select only one descriptor');
            equal(selected[0].value(), '2', 'it should selects only first descriptor');
            equal(this.model.getAllDescriptors(false).length, 9, 'it should return 8 descriptors if groups are omitted');
            equal(this.model.getDisplayableUnSelectedDescriptors().length, 8, 'it should return 7 unselected descriptors');
            equal(unselected.length, this.descriptors.length - 1, 'it should filter off selected descriptor values');
            equal(unselected[0].items().length, 1, 'it should filter off selected one');
            equal(this.$element.val(), '2', 'should set value of the first encountered selected descriptor');
            equal(this.model.getSelectedValues().length, 1, 'should set value of the first encountered selected descriptor');
            equal(this.model.getSelectedValues()[0], '2', 'should set value of the first encountered selected descriptor');
        });

        test('model properly finds descriptors', function() {
            var descriptor = this.model.getDescriptor('2');

            equal(descriptor.value(), '2' , 'returned descriptor should have proper value');
            ok(descriptor.selected(), 'found descriptor should be selected');
            equal(descriptor.label(), 'Descriptor 2', 'returned descriptor should be the first one encountered');

            descriptor = this.model.getDescriptor('Ungrouped 3');
            equal(descriptor.value(),'6', 'it should be possible to find descriptors by label');
        });

        test('Model properly selects descriptors', function() {
            var changeHandler = sinon.spy();
            var result;

            this.$element.on('change',changeHandler);

            result = this.model.setSelected('6');
            equal(this.model.getDisplayableSelectedDescriptors().length, 1, 'model should still have only one value');
            equal(result, true, 'model should return that it found value');
            ok(changeHandler.calledOnce, 'model should trigger change event on underlying element');
            equal(this.$element.val(), '6', 'model should set proper value on element');
            equal(this.model.getDescriptor('6').selected(), true, 'model should change selected state of descriptor');

            result = this.model.setSelected('7');
            equal(this.$element.val(), '6', 'model should not change value if descriptors does not exist');
            equal(result, false, 'model should return that it did not find provided value');

            result = this.model.setSelected('6');
            equal(result, true, 'setSelectd should return that it found value');
            ok(changeHandler.calledOnce, 'model should not call change event when value does not change');

            this.model.setSelected('1', false);
            ok(changeHandler.calledOnce, 'model should not fire event when such argument is present');

            this.model.setSelected(this.model.descriptors[3]);
            equal(this.$element.val(), '2', 'it should be possible to select by providing descriptor');
        });

        test('Model properly selects descriptors in multiple mode', function() {
            this.model.type = 'multiple';

            this.model.setSelected('5');
            equal(this.model.getDisplayableSelectedDescriptors().length, 2, 'model should select additional descriptor');

            this.model.setAllUnSelected();
            equal(this.$element.val(),'','model should clear element value');

            this.model.setSelected('1');
            equal(this.model.getDisplayableSelectedDescriptors().length, 3, 'model should mark 3 descriptors as selected');
            equal(this.$element.val(), '1,1,1', 'Element value should have all three values');

            this.model.setAllSelected();
            equal(this.model.getAllDescriptors(false).length,this.model.getDisplayableSelectedDescriptors().length,
                'model should select all descriptors');
        });

        test('model properly removes descriptors', function() {
            this.model.remove('1');

            equal(this.model.getAllDescriptors(false).length, 6, 'model should remove all descriptors with provided value');

            this.model.remove(this.model.descriptors[3]);
            equal(this.model.getAllDescriptors().length, 3, 'model should accept ItemDescriptor as parameter and work properply');
            equal(this.model.getAllDescriptors(false).length, 5, '');

            this.model.clearUnSelected();
            equal(this.model.getAllDescriptors(false)[0],this.model.getDisplayableSelectedDescriptors()[0],
                'model should remove all unselected descriptors');
        });

        test('Model properly filters groups',function() {
            var result;

            result = this.model.setFilterGroup('Group 2');
            equal(this.model.getUnSelectedDescriptors().length, 4, 'should return only descriptors from filtered group');
            equal(this.model.getAllDescriptors().length, 4, 'should filter all get methods');
            equal(result, true, 'filtering function should return true when group is found');

            result = this.model.setSelected('2');
            equal(result, false, 'is should not be possible to select value outside of filtered group');

            result = this.model.setSelected('5');
            equal(result, true, 'it should be possible to select value from filtered group');
            equal(this.$element.val(), '5', 'element should have proper value');

            result = this.model.setFilterGroup("Not present");
            equal(result, false, 'it should return false when there is no such group');
            equal(this.model.getAllDescriptors().length, 4, 'it should not filter when there is no such group');

            this.model.clearFilterGroup();
            equal(this.model.getAllDescriptors(false).length, 9, 'it should return all ItemDescriptors after clearing filter');

        });

        test('should properly parse descriptors with newlines', function() {
            var descriptors = [
                {label: "Newline\n", value: '1'},
                {label: 'Unicode LINE SEPARATOR \u2028', value: '2'}
            ];

            var id = 'newlines';
            jQuery('<input type="text"/>').attr('id', id).appendTo(jQuery('#qunit-fixture'));
            var model = this.createModel(descriptors, id);

            var actualLabels = model.getAllDescriptors().map(function(descriptor) {
                return descriptor.label();
            });

            var expectedLabels = descriptors.map(function(descriptor) {
                return descriptor.label;
            });

            deepEqual(actualLabels, expectedLabels, 'descriptors should have proper labels');
        })

    });
});