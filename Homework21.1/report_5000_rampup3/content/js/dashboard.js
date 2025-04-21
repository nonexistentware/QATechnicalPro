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

    var data = {"OkPercent": 98.90224201346042, "KoPercent": 1.0977579865395735};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.985209477141716, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9794231523774977, 500, 1500, "Create new character"], "isController": false}, {"data": [0.9991746425975284, 500, 1500, "Delete character"], "isController": false}, {"data": [0.9746504590600864, 500, 1500, "Get all characters"], "isController": false}, {"data": [0.9958182955221856, 500, 1500, "Update character"], "isController": false}, {"data": [0.9775493463593434, 500, 1500, "Get character by id"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 671004, 7366, 1.0977579865395735, 359.92750117733937, 0, 40538, 119.0, 5284.0, 5293.0, 27657.0, 10202.590925678142, 183840.97117424128, 1889.286770233054], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create new character", 135079, 624, 0.461951894817107, 276.62278370434933, 0, 40538, 114.0, 2856.0, 5289.0, 27652.0, 2054.839740176765, 589.6360390172201, 447.41973698221705], "isController": false}, {"data": ["Delete character", 132064, 109, 0.08253574024715289, 96.23894475406004, 0, 34867, 115.0, 151.0, 158.0, 166.0, 2028.8510285284133, 581.1719326098812, 364.5106358642634], "isController": false}, {"data": ["Get all characters", 135821, 3040, 2.238240036518653, 684.9031593052614, 0, 40378, 113.0, 151.0, 157.0, 169.0, 2071.989748440146, 182098.54992141138, 312.54585527871427], "isController": false}, {"data": ["Update character", 132721, 555, 0.41817044778143625, 122.29499476345188, 0, 32368, 108.0, 152.0, 160.0, 5290.0, 2026.2129400628987, 553.9720519029954, 458.7059662777473], "isController": false}, {"data": ["Get character by id", 135319, 3038, 2.245065364065652, 607.3191347852169, 0, 39542, 115.0, 175.0, 27654.0, 27659.0, 2080.9023666364237, 634.0792575475942, 316.49938753286995], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1016, 13.793103448275861, 0.1514148946951136], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 252, 3.4211240836274777, 0.037555662857449434], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 476, 6.462123269074124, 0.07093847428629338], "isController": false}, {"data": ["404/Not Found", 788, 10.69780070594624, 0.11743596163361172], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 4834, 65.62584849307629, 0.7204129930671054], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 671004, 7366, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 4834, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1016, "404/Not Found", 788, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 476, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 252], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create new character", 135079, 624, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 299, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 183, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 89, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 53, "", ""], "isController": false}, {"data": ["Delete character", 132064, 109, "404/Not Found", 89, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 2], "isController": false}, {"data": ["Get all characters", 135821, 3040, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 2391, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 349, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 207, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 93, "", ""], "isController": false}, {"data": ["Update character", 132721, 555, "404/Not Found", 442, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 51, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 18, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 17], "isController": false}, {"data": ["Get character by id", 135319, 3038, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 2083, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 454, "404/Not Found", 257, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 160, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 84], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
