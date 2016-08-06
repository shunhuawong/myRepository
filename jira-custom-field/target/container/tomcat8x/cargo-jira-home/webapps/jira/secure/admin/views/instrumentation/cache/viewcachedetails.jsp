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
            google.load("visualization", "1.0", {packages: ["gauge", "table", "corechart", 'controls']});
            google.setOnLoadCallback(drawChart);
            var data = null;
            function drawChart() {

                data = google.visualization.arrayToDataTable([
                    ["Name", "Name", "Hit Rate", "Hits", "Misses", "Puts", "Removes", "Load Time (ns)"],
                    <ww:iterator value='cacheDetails'>
                    ['<ww:property value="./name"/>', '<ww:property value="./name"/>',
                        <ww:property value="./hitRate"/>,
                        <ww:property value="./hits"/>,
                        <ww:property value="./misses"/>, <ww:property value="./removes"/>, <ww:property value="./loads"/>, <ww:property value="./loadTime"/>],                    </ww:iterator>
                ]);

                var formatter = new google.visualization.PatternFormat('<a href="ViewCachesByRequest.jspa?r={0}">{0}</a>');
                formatter.format(data, [0]);

                var percentFormatter = new google.visualization.NumberFormat({pattern: '#0.0'});
                percentFormatter.format(data, 2);

                var doubleFormatter = new google.visualization.NumberFormat({pattern: '#0.00'});
                doubleFormatter.format(data, 7);

                var hitCountFormatter = new google.visualization.BarFormat({width: 100});
                hitCountFormatter.format(data, 3);

                var tree = new google.visualization.ChartWrapper(
                        {
                            chartType: 'Table',
                            containerId: 'chart',
                            view: {'columns': [0, 2, 3, 4, 5, 6, 7]},
                            options: {
                                vAxis: {textStyle: {'fontSize': 12}, gridLines: {count: '5'}},
                                bar: {groupWidth: '100%'},
                                sortAscending: false,
                                sortColumn: 2,
                                allowHtml: true
                            }
                        }
                );
                var pie = new google.visualization.ChartWrapper(
                        {
                            chartType: 'PieChart',
                            containerId: 'piechart',
                            options: {
                                title: 'Hits',
                                allowHtml: true
                            },
                            view: {'columns': [1, 3]}
                        }
                );

                var pieMisses = new google.visualization.ChartWrapper(
                        {
                            chartType: 'PieChart',
                            containerId: 'pieMissChart',
                            options: {
                                title: 'Misses',
                                allowHtml: true
                            },
                            'view': {'columns': [1, 4]}
                        }
                );

                var pieLoadTime = new google.visualization.ChartWrapper(
                        {
                            chartType: 'PieChart',
                            containerId: 'pieLoadTimeChart',
                            options: {
                                title: 'Load Time',
                                allowHtml: true
                            },
                            'view': {'columns': [1, 7]}
                        }
                );

                var dashboard = new google.visualization.Dashboard(document.querySelector('#dashboard'));

                var stringFilter = new google.visualization.ControlWrapper({
                    controlType: 'StringFilter',
                    containerId: 'string_filter_div',
                    options: {
                        filterColumnIndex: 0,
                        matchType: 'any',
                        caseSensitive: false,
                        ui: {label: 'Search'}
                    }
                });

                dashboard.bind([stringFilter], [tree, pie, pieMisses, pieLoadTime]);
                dashboard.draw(data);

                var bufferSizeGaugeData = google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['Entries', <ww:property value="cacheEntryCount"/>],
                    ['Total Load', <ww:property value="totalLoadTime"/>],
                    ['Requests', <ww:property value="requestCount"/>],
                ]);

                var gaugeOptions = {
                    width: 400, height: 120,
                    max: 10000
                };
                var bufferSizeGauge = new google.visualization.Gauge(document.getElementById('bufferSizeGauge_div'));
                bufferSizeGauge.draw(bufferSizeGaugeData, gaugeOptions);

            }

            function downloadCSV() {

                var dv = new google.visualization.DataView(data);
                dv.hideColumns([0]);
                var filteredTable = dv.toDataTable();

                var blob = new Blob([google.visualization.dataTableToCsv(filteredTable)], {type: 'text/csv;charset=utf-8'});
                var url  = window.URL || window.webkitURL;
                var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                link.href = url.createObjectURL(blob);
                link.download = "download.csv";

                var event = document.createEvent("MouseEvents");
                event.initEvent("click", true, false);
                link.dispatchEvent(event);
            }

        }
        catch (err) {
            window.onload = function () {
                document.getElementById('piechart').innerHTML = "<p/>Google charts not available: " + err.message;
            }
        }

    </script>
</head>
<body>
<header class="aui-page-header">
    <div class="aui-page-header-inner">
        <div class="aui-page-header-main">
            <h2>Statistics for Cache: <ww:property value="name"/></h2>
        </div>
        <div style="float: right"><a href="ViewCacheStats.jspa">Back to Cache Stats</a></div>
    </div>
</header>
<div id="bufferSizeGauge_div"></div>
<div id="dashboard">
    <table>
        <tr>
            <td><div id="piechart"></div></td>
            <td><div id="pieMissChart"></div></td>
            <td><div id="pieLoadTimeChart"></div></td>
        </tr>
    </table>
    <div style="float:right"><a href='javascript:downloadCSV()'>CSV</a></div>
    <div id="string_filter_div"></div>
    <div id="chart"></div>
</div>
</body>
</html>
