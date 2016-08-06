    JIRA.GroupPickerUtil = {
        formatResponseWithLabels: function(data) {
            return JIRA.GroupPickerUtil.formatResponse(data, true);
        },

        formatResponse: function (data, showLabels) {
            var ret = [];

            var template = showLabels ? JIRA.Templates.GroupPickerUtil.formatResponseWithLabels :
                                        JIRA.Templates.GroupPickerUtil.formatResponse;

            AJS.$(data).each(function(i, suggestions) {

                var groupDescriptor = new AJS.GroupDescriptor({
                    weight: i, // order or groups in suggestions dropdown
                    label: suggestions.header
                });
                AJS.$(suggestions.groups).each(function(){
                        groupDescriptor.addItem(new AJS.ItemDescriptor({
                            value: this.name, // value of item added to select
                            label: this.name, // title of lozenge
                            title: this.name, // tooltip
                            html: template(this),
                            highlighted: true
                        }));
                });

                ret.push(groupDescriptor);
            });

            return ret;
        }
    };
