<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<html>
<head>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/troubleshooting_and_support"/>
    <meta name="admin.active.tab" content="instrumentation"/>
    <title><ww:text name="'admin.instrumentation.page.title'"/></title>

    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script>
        try
        {
            google.load("visualization", "1.0", {packages: ["table", "corechart", 'controls']});
            google.setOnLoadCallback(drawChart);
            var data = null;
            function drawChart()
            {
                data = google.visualization.arrayToDataTable([
                    ["Name", "Name", "Type", "Hit Count", "Hit Count", "Miss Count", "Load Time(ns)", "Size"],
                    <ww:iterator value='cacheStats'>
                        ['<ww:property value="./name"/>', '<ww:property value="./shortName"/>', '<ww:property value="./cacheType"/>', <ww:property value="./hitCount"/>, <ww:property value="./hitCount"/>, <ww:property value="./missCount"/>, <ww:property value="./avgLoadTime"/>, <ww:property value="./size"/>],
                    </ww:iterator>
                ]);

                // Format the data in the table.
                var formatter = new google.visualization.PatternFormat('<a href="ViewCacheDetails.jspa?name={0}">{1}</a>');
                formatter.format(data, [0, 1]);

                var hitCountFormatter = new google.visualization.BarFormat({width: 100});
                hitCountFormatter.format(data, 3);

                var loadTimeFormatter = new google.visualization.NumberFormat({pattern: '#0.00'});
                loadTimeFormatter.format(data, 6);

                var sizeFormatter = new google.visualization.NumberFormat({pattern: '####'});
                sizeFormatter.format(data, 7);

                // Build wrapper so we  can tie it to the filters
                var table = new google.visualization.ChartWrapper(
                {
                    chartType: 'Table',
                    containerId: 'chart',
                    view: {columns: [0, 2, 3, 5, 6, 7]},
                    options:
                    {
                        vAxis: {textStyle: {fontSize: 12}, gridLines: {count: '5'}},
                        bar: {groupWidth: '100%'},
                        sortAscending: false,
                        sortColumn: 2,
                        allowHtml: true
                    }
                });


                var dashboard = new google.visualization.Dashboard(document.querySelector('#dashboard'));

                var stringFilter = new google.visualization.ControlWrapper(
                {
                    controlType: 'StringFilter',
                    containerId: 'string_filter_div',
                    options:
                    {
                        filterColumnIndex: 0,
                        matchType: 'any',
                        caseSensitive: false,
                        ui: {label: 'Search'}
                    }
                });

                dashboard.bind([stringFilter], [table]);
                dashboard.draw(data)
            }

            // Convert the DataView to a CSV
            function downloadCSV()
            {
                var dv = new google.visualization.DataView(data);
                dv.hideColumns([0, 3]);
                var filteredTable = dv.toDataTable();

                var blob = new Blob([google.visualization.dataTableToCsv(filteredTable)], {type: 'text/csv;charset=utf-8'});
                var url = window.URL || window.webkitURL;
                var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                link.href = url.createObjectURL(blob);
                link.download = "download.csv";

                var event = document.createEvent("MouseEvents");
                event.initEvent("click", true, false);
                link.dispatchEvent(event);
            }
        }
        catch(err)
        {
            // who cares for now
        }
    </script>
</head>
<body>
<h2>Cache Statistics</h2>
<div id="dashboard">
    <div style="float:right"><a href='javascript:downloadCSV()'>CSV</a></div>
    <div id="string_filter_div"></div>
    <div id="chart"></div>
</div>
</body>
</html>
