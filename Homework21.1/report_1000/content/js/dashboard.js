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

    var data = {"OkPercent": 90.08, "KoPercent": 9.92};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8865, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.92175, 500, 1500, "Create new character"], "isController": false}, {"data": [0.922, 500, 1500, "Delete character"], "isController": false}, {"data": [0.79775, 500, 1500, "Get all characters"], "isController": false}, {"data": [0.922, 500, 1500, "Update character"], "isController": false}, {"data": [0.869, 500, 1500, "Get character by id"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 992, 9.92, 57.89649999999994, 0, 1058, 2.0, 152.0, 259.8499999999967, 783.9899999999998, 5305.039787798409, 195736.23849883952, 915.6187831564987], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create new character", 2000, 156, 7.8, 22.6605, 0, 502, 2.0, 32.0, 122.0, 280.8800000000001, 1081.6657652785289, 489.9417759599784, 218.1584640346133], "isController": false}, {"data": ["Delete character", 2000, 156, 7.8, 15.168500000000005, 0, 410, 2.0, 33.0, 34.0, 244.0, 1085.1871947911013, 400.3614817892024, 187.8968775434075], "isController": false}, {"data": ["Get all characters", 2000, 262, 13.1, 189.6095, 0, 1058, 104.0, 574.0, 769.0, 1055.0, 1061.5711252653928, 194039.31078738722, 142.3396861730361], "isController": false}, {"data": ["Update character", 2000, 156, 7.8, 17.930000000000003, 0, 571, 2.0, 33.0, 60.0, 284.9000000000001, 1083.4236186348862, 430.0837325636511, 231.83360983206933], "isController": false}, {"data": ["Get character by id", 2000, 262, 13.1, 44.11400000000006, 0, 1054, 2.0, 159.9000000000001, 203.94999999999982, 381.8700000000001, 1078.167115902965, 514.8490144878706, 151.01867840296495], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 225, 22.681451612903224, 2.25], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 373, 37.600806451612904, 3.73], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 206, 20.766129032258064, 2.06], "isController": false}, {"data": ["404/Not Found", 188, 18.951612903225808, 1.88], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 992, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 373, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 225, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 206, "404/Not Found", 188, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create new character", 2000, 156, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 56, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 38, "", "", "", ""], "isController": false}, {"data": ["Delete character", 2000, 156, "404/Not Found", 81, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 32, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 27, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 16, "", ""], "isController": false}, {"data": ["Get all characters", 2000, 262, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 147, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 53, "", "", "", ""], "isController": false}, {"data": ["Update character", 2000, 156, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 44, "404/Not Found", 44, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 40, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 28, "", ""], "isController": false}, {"data": ["Get character by id", 2000, 262, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 93, "404/Not Found", 63, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 53, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 53, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
