<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib prefix="page" uri="http://www.opensymphony.com/sitemesh/page" %>
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
            function drawChart() {
                var data = google.visualization.arrayToDataTable([
                    ["Name", "Enabled"],
                    <ww:iterator value='caches'>
                    ['<ww:property value="./name"/>', <ww:property value="./enabled"/>],
                    </ww:iterator>
                ]);

                var formatter = new google.visualization.PatternFormat('<a href="ViewCacheDetails.jspa?name={0}">{0}</a>');
                formatter.format(data, [0]);

                var table = new google.visualization.ChartWrapper(
                        {
                            chartType: 'Table',
                            containerId: 'chart',
                            options: {
                                vAxis: {textStyle: {'fontSize': 12}, gridLines: {count: '5'}},
                                bar: {groupWidth: '100%'},
                                sortAscending: true,
                                sortColumn: 0,
                                allowHtml: true
                            }
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

                dashboard.bind([stringFilter], [table]);
                dashboard.draw(data);

                var bufferSizeGaugeData = google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['# Reqs', <ww:property value="bufferCount"/>]
                ]);

                var gaugeOptions = {
                    width: 400, height: 120,
                    greenFrom: 0, greenTo: 7000,
                    redFrom: 9000, redTo: 10000,
                    yellowFrom: 7000, yellowTo: 9000,
                    minorTicks: 500,
                    max: 10000
                };
                var bufferSizeGauge = new google.visualization.Gauge(document.getElementById('bufferSizeGauge_div'));
                bufferSizeGauge.draw(bufferSizeGaugeData, gaugeOptions);
            }
        }
        catch (err) {
            // who cares for now
        }
    </script>
</head>
<body>
<h2>Cache Instrumentation Management</h2>
<table>
    <tr>
        <td>
            <div id="bufferSizeGauge_div"></div>
        </td>
         <td>
            <form action="EnableAll.jspa" method="post">
                <ww:component name="'atl_token'" value="/xsrfToken" template="hidden.jsp"/>
                <input type="submit" value="Enable All Caches">
            </form>
            <form action="DisableAll.jspa" method="post">
                <ww:component name="'atl_token'" value="/xsrfToken" template="hidden.jsp"/>
                <input type="submit" value="Disable All Caches">
            </form>
        </td>
    </tr>
    <tr>
        <td>
            <form action="ClearBuffer.jspa" method="post">
                <ww:component name="'atl_token'" value="/xsrfToken" template="hidden.jsp"/>
                <input type="submit" value="Clear Buffer">
            </form>
        </td>
        <td></td>
    </tr>
</table>
<div id="dashboard">
    <div id="string_filter_div"></div>
    <div id="chart"></div>
</div>
</body>
</html>
