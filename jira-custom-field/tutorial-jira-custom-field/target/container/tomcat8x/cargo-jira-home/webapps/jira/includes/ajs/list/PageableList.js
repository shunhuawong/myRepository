define('jira/ajs/list/pageable-list',[
    'jira/ajs/list/list',
    'jira/ajs/list/group-descriptor',
    'underscore'
],function(
    List,
    GroupDescriptor,
    _
) {
    /**
     * @class PageableList
     * @extends List
     */
    return List.extend({
        init: function(options) {
            var defaults = {
                pageSize: 50,
                pagingThreshold: 100
            };

            options = jQuery.extend(true,defaults, options);
            this._super(options);

            this.pageSize = this.options.pageSize;
        },
        generateListFromJSON: function(data, query, forceAllResults) {
            var filteredData = [], suggestionsCount = 0,
                regexEscapedQuery, labelRegex;
            this.pageNumber = this.pageNumber || 1;

            //reset page number when rendering new list
            if (query !== this.lastQuery) {
                this.pageNumber = 1;
            }

            if (query) {
                regexEscapedQuery = RegExp.escape(query);
                labelRegex = new RegExp(AJS.format(this.options.matchingStrategy, regexEscapedQuery), "i");
                for (var i = 0; i < data.length; i++) {
                    //copying GroupDescriptor so that original data is left untouched
                    filteredData.push(new GroupDescriptor(_.omit(data[i].allProperties(),'items')));
                    filteredData[i].items(this._filterOptions(data[i].items(), regexEscapedQuery, labelRegex));
                    suggestionsCount += filteredData[i].items().length;
                }
            }
            else {
                filteredData = data;
                for (var i = 0; i < data.length; i++) {
                    suggestionsCount += data[i].items().length;
                }
            }

            if (suggestionsCount < this.options.pagingThreshold) {
                forceAllResults = true;
            }

            this._super(filteredData,query,forceAllResults);
        },
        _filterAndAddOptions: function (options, container, query) {
            var labelRegex;

            if (query) {
                labelRegex = new RegExp(AJS.format(this.options.matchingStrategy, RegExp.escape(query)), "i");
            }
            //filtering is done upon calling generateListFromJSON
            return this._addOptionsToContainer(options, container, query, labelRegex);
        },
        _addOptionsToContainer: function(options, $container, query, labelRegex) {
                var hasSuggestion = false,
                suggestions = [],
                shouldBeVisible = this.pageNumber * this.pageSize;

            for (var i = 0, len = options.length; i < len; i++) {
                var option = options[i];
                if (this.forceAllResults || this.suggestions < shouldBeVisible ) {
                    var $suggestion = this._generateOption(option, query, labelRegex);
                    if ($suggestion) {
                        hasSuggestion = true;
                        suggestions.push($suggestion[0]);
                    }
                }
            }
            if ($container.children().length) {
                $container.find('.aui-list-item:last').after(jQuery(suggestions));
            }
            else {
                $container.html(jQuery(suggestions));
            }

            return hasSuggestion;
        },
        /**
         * Renders next page of results from cached data
         *
         * @return {int} number of currently displayed items
         */
        addNextPage: function() {
            var displayed = this.suggestions,
                group,$groupContainer,$resultContainer;
            this.pageNumber++;
            for (var i=0; i < this.lastData.length; i++) {
                group = this.lastData[i];
                if (group.items().length > displayed) {
                    $groupContainer = this.$container.find('#' + this._buildElementId(group.label()));
                    if ($groupContainer.length === 0) {
                        //prolly the group hasn't been rendered yet
                        $groupContainer = this._generateOptGroup(group, this.lastQuery);
                        $resultContainer = group.placement() === 'fixed' ? this.$container.find('.aui-list-fixed') : this.$container.find('.aui-list-scroll');
                        $resultContainer.append($groupContainer);
                    }
                    else {
                        this._filterAndAddOptions(group.items().slice(displayed), $groupContainer, this.lastQuery);
                    }
                }
                displayed = displayed - group.items().length;
            }

            this.reset(this.index);
            return this.suggestions;
        },
        // JRA-28357 performance optimisation: when the dropdown list is disabled/dismissed,
        // resetting the page number to 1 prevents browser hangs if the list was completely rendered before
        // as it would be re-rendered with all items visible in the next SingleSelect interaction
        disable: function () {
            this._super();
            this.pageNumber = 1;
        },

        showPageRenderError: function() {
            this.$container.find('.aui-last').append(this._render('errorRenderingPage'));
        },

        _renders: {
            errorRenderingPage: function() {
                return jQuery("<li class='no-suggestions'>" + AJS.I18n.getText("common.concepts.error.fetching.page") + "</li>");
            }
        },

        isDisplayedAllItems: function () {
            var currentDisplayedItems =  _.reduce(this.lastData, function(memo, group) {
                return memo + group.items().length;
            }, 0);
            return currentDisplayedItems === this.suggestions;
        }
    });
});