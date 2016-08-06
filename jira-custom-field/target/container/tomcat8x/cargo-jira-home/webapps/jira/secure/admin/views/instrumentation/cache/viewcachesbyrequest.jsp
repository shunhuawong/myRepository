<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<html>
<head>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/troubleshooting_and_support"/>
    <meta name="admin.active.tab" content="instrumentation"/>
    <title><ww:text name="'admin.instrumentation.page.title'"/></title>

    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script>
        try {
            google.load("visualization", "1.0", {packages: ["table", "corechart", 'controls']});
            google.setOnLoadCallback(drawChart);
            var data = null;

            function drawChart() {
                data = google.visualization.arrayToDataTable([
                    ["Name", "Name", "Avg Hits", "Avg Misses", "Avg Puts", "Avg Removes", "Avg Loads", "Avg Load Time (ns)"],
                    <ww:iterator value='requestStats'>
                    ['<ww:property value="./name"/>', '<ww:property value="./name"/>', <ww:property value="./hits"/>, <ww:property value="./misses"/>, <ww:property value="./puts"/>, <ww:property value="./removes"/>, <ww:property value="./loads"/>, <ww:property value="./loadTime"/>],
                    </ww:iterator>
                ]);

                var formatter = new google.visualization.PatternFormat('<a href="ViewCacheDetails.jspa?name={0}">{0}</a>');
                formatter.format(data, [0]);

                var doubleFormatter = new google.visualization.NumberFormat({pattern: '#0.00'});
                doubleFormatter.format(data, 2);
                doubleFormatter.format(data, 3);
                doubleFormatter.format(data, 4);
                doubleFormatter.format(data, 5);
                doubleFormatter.format(data, 6);
                doubleFormatter.format(data, 7);

                var tree = new google.visualization.ChartWrapper(
                        {
                            chartType: 'Table',
                            containerId: 'chart',
                            options: {
                                vAxis: {textStyle: {'fontSize': 12}, gridLines: {count: '5'}},
                                bar: {groupWidth: '100%'},
                                sortAscending: false,
                                sortColumn: 1,
                                allowHtml: true
                            },
                            view: {columns: [0, 2, 3, 4, 5, 6, 7]}
                        }
                );

                var pie = new google.visualization.ChartWrapper({
                    chartType: 'PieChart',
                    containerId: 'piechart',
                    view: {columns: [1, 2]},
                    options: {
                        title: 'Hits'
                    }
                });
                var pieMisses = new google.visualization.ChartWrapper({
                    chartType: 'PieChart',
                    containerId: 'pieMissChart',
                    view: {columns: [1, 3]},
                    options: {
                        title: 'Misses'
                    }
                });

                var pieLoadTime = new google.visualization.ChartWrapper({
                    chartType: 'PieChart',
                    containerId: 'pieLoadTimeChart',
                    view: {columns: [1, 7]},
                    options: {
                        title: 'Load Time'
                    }
                });

                var dashboard = new google.visualization.Dashboard(document.querySelector('#dashboard'));

                var stringFilter = new google.visualization.ControlWrapper({
                    controlType: 'StringFilter',
                    containerId: 'string_filter_div',
                    options: {
                        filterColumnIndex: 0,
                        matchType: 'any',
                        caseSensitive: false,
                        ui: {label: 'Search'}
                    },
                });
                dashboard.bind([stringFilter], [tree, pie, pieMisses, pieLoadTime]);

                dashboard.draw(data);

            }
        }
        catch (err) {
            window.onload = function () {
                document.getElementById('piechart').innerHTML = "<p/>Google charts not available: " + err.message;
            }

            function downloadCSV() {

                var dv = new google.visualization.DataView(data);
                dv.hideColumns([0]);
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
    </script>
</head>
<body>
<header class="aui-page-header">
    <div class="aui-page-header-inner">
        <div class="aui-page-header-main"><h2>Cache Statistics For Request: <ww:property value="./req"/></h2></div>
        <div style="float: right"><a href="ViewUris.jspa">Back to URI list</a></div>
    </div>
</header>
<div id="dashboard">
    <table>
        <tr>
            <td>
                <div id="piechart"></div>
            </td>
            <td>
                <div id="pieMissChart"></div>
            </td>
            <td>
                <div id="pieLoadTimeChart"></div>
            </td>
        </tr>
    </table>
    <div>
        <div style="float:right"><a href='javascript:downloadCSV()'>CSV</a></div>
        <div id="string_filter_div"></div>
    </div>
    <div id="chart" style="height:800px"></div>
</div>
</body>
</html>
