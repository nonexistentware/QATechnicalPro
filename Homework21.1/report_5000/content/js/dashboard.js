/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 20.753508987934005, "KoPercent": 79.24649101206599};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.19389928589017483, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.21257079537059836, 500, 1500, "Create new character"], "isController": false}, {"data": [0.21795739965525732, 500, 1500, "Delete character"], "isController": false}, {"data": [0.1445456784043339, 500, 1500, "Get all characters"], "isController": false}, {"data": [0.21712632356562422, 500, 1500, "Update character"], "isController": false}, {"data": [0.17729623245506032, 500, 1500, "Get character by id"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 81220, 64364, 79.24649101206599, 339.123934991386, 0, 7692, 87.0, 810.0, 876.0, 1137.0, 9188.8222649621, 91144.40607234274, 390.14704894501637], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create new character", 16244, 12615, 77.65944348682591, 312.122075843386, 0, 5890, 257.0, 516.0, 834.0, 2077.4499999999716, 1848.6400364174349, 3859.4076743342434, 90.34297826334357], "isController": false}, {"data": ["Delete character", 16244, 12615, 77.65944348682591, 268.7056143806937, 0, 5687, 242.0, 442.0, 799.0, 1491.0, 1854.337899543379, 3689.1147839968608, 89.04031553224885], "isController": false}, {"data": ["Get all characters", 16244, 13249, 81.56242304851023, 481.2372568332928, 0, 7692, 274.0, 880.0, 1849.0, 5111.749999999996, 1837.9723919438786, 76002.41798112555, 52.287750693030105], "isController": false}, {"data": ["Update character", 16244, 12615, 77.65944348682591, 307.3238734301911, 0, 7429, 252.0, 506.0, 872.0, 2212.0, 1850.1138952164008, 3773.4633043849662, 102.15855904755126], "isController": false}, {"data": ["Get character by id", 16244, 13270, 81.69170155134204, 326.2308544693431, 0, 7429, 258.0, 662.0, 880.0, 1884.7499999999964, 1847.1685239936319, 3929.470843934785, 58.63106237207187], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 60512, 94.01528804922006, 74.50381679389314], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 1617, 2.5122739419551303, 1.9908889436099484], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 867, 1.3470262879870736, 1.0674710662398423], "isController": false}, {"data": ["404/Not Found", 1346, 2.0912311229880056, 1.6572272839202167], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 22, 0.03418059784972966, 0.02708692440285644], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 81220, 64364, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 60512, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 1617, "404/Not Found", 1346, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 867, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 22], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create new character", 16244, 12615, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 12236, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 225, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 153, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1, "", ""], "isController": false}, {"data": ["Delete character", 16244, 12615, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11517, "404/Not Found", 693, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 242, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 163, "", ""], "isController": false}, {"data": ["Get all characters", 16244, 13249, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 12452, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 599, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 198, "", "", "", ""], "isController": false}, {"data": ["Update character", 16244, 12615, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11901, "404/Not Found", 323, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 239, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 152, "", ""], "isController": false}, {"data": ["Get character by id", 16244, 13270, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 12406, "404/Not Found", 330, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 312, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 201, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 21], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
