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

    var data = {"OkPercent": 99.03441117793145, "KoPercent": 0.9655888220685495};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9891350606859969, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9896184853997885, 500, 1500, "Create new character"], "isController": false}, {"data": [0.9912140402446669, 500, 1500, "Delete character"], "isController": false}, {"data": [0.9859630155351936, 500, 1500, "Get all characters"], "isController": false}, {"data": [0.9909357461505253, 500, 1500, "Update character"], "isController": false}, {"data": [0.9879655872804164, 500, 1500, "Get character by id"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2784415, 26886, 0.9655888220685495, 262.18618668554467, 0, 82801, 59.0, 7776.0, 15550.0, 27392.0, 14980.685113548934, 90479.54467063479, 2770.9441386515628], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create new character", 556807, 4563, 0.8194940077980342, 216.88196448679585, 0, 82782, 61.0, 65.0, 152.0, 19834.0, 2996.372970558638, 881.2478096226598, 650.0851598529815], "isController": false}, {"data": ["Delete character", 555204, 4677, 0.8423930663323751, 170.37031793718916, 0, 82780, 61.0, 65.0, 67.0, 26613.94000000001, 2987.730589577459, 900.2763928118341, 530.7070121631293], "isController": false}, {"data": ["Get all characters", 558667, 6252, 1.1190924110427143, 467.3119604343822, 0, 82801, 61.0, 65.0, 3937.0, 25817.210000000287, 3006.2690358061495, 87016.43882485511, 458.6669188798874], "isController": false}, {"data": ["Update character", 555920, 4860, 0.8742265074111383, 185.11169412865274, 0, 82780, 61.0, 65.0, 67.0, 17978.0, 2991.9861358535654, 859.4510686806053, 670.3761899784315], "isController": false}, {"data": ["Get character by id", 557817, 6534, 1.1713518949763095, 270.168189567555, 0, 82788, 61.0, 65.0, 5010.0, 23378.040000002555, 3001.5173935268635, 838.3537440474589, 461.7270366854772], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5828, 21.676709067916388, 0.20930787975212028], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 1390, 5.169976939671204, 0.04992071943298682], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1462, 5.437774306330432, 0.052506540871242256], "isController": false}, {"data": ["404/Not Found", 3021, 11.236331176076769, 0.10849675784680085], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 15185, 56.47920851000521, 0.5453569241653992], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2784415, 26886, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 15185, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5828, "404/Not Found", 3021, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1462, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 1390], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create new character", 556807, 4563, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 2916, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1167, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 244, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 236, "", ""], "isController": false}, {"data": ["Delete character", 555204, 4677, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 2518, "404/Not Found", 937, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 862, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 195, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 165], "isController": false}, {"data": ["Get all characters", 558667, 6252, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 3928, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1414, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 461, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 449, "", ""], "isController": false}, {"data": ["Update character", 555920, 4860, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 2668, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 962, "404/Not Found", 796, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 234, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 200], "isController": false}, {"data": ["Get character by id", 557817, 6534, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Operation timed out", 3155, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1423, "404/Not Found", 1288, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 348, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 320], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
