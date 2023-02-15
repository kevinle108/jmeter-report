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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.42184848484848486, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3, 500, 1500, "Tutorial"], "isController": false}, {"data": [0.255, 500, 1500, "HomePage"], "isController": false}, {"data": [0.7836666666666666, 500, 1500, "Tutorial-0"], "isController": false}, {"data": [0.3433333333333333, 500, 1500, "REPL"], "isController": false}, {"data": [0.5653333333333334, 500, 1500, "Tutorial-1"], "isController": false}, {"data": [0.0023333333333333335, 500, 1500, "Docs"], "isController": false}, {"data": [0.6176666666666667, 500, 1500, "REPL-1"], "isController": false}, {"data": [0.7363333333333333, 500, 1500, "REPL-0"], "isController": false}, {"data": [0.4206666666666667, 500, 1500, "Blog"], "isController": false}, {"data": [0.37566666666666665, 500, 1500, "FAQs"], "isController": false}, {"data": [0.24033333333333334, 500, 1500, "Examples"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16500, 0, 0.0, 6280.1895757575685, 36, 246794, 1086.0, 11000.599999999999, 40671.44999999999, 91933.12999999996, 60.87707258760764, 7814.974986642786, 8.409510382308016], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Tutorial", 1500, 0, 0.0, 2936.392666666666, 125, 197197, 1246.0, 5746.000000000003, 8699.200000000004, 21431.480000000003, 5.566172514240125, 173.70589025711078, 1.3426216904465924], "isController": false}, {"data": ["HomePage", 1500, 0, 0.0, 3505.6653333333397, 114, 246794, 1581.5, 6490.9, 9807.100000000002, 27558.090000000026, 5.558726088213277, 160.2956379518318, 0.6079856658983271], "isController": false}, {"data": ["Tutorial-0", 1500, 0, 0.0, 608.5926666666672, 86, 5500, 461.0, 1279.5000000000005, 1510.7500000000002, 2329.6900000000005, 5.567060814572339, 1.8632691590397934, 0.6523899392076958], "isController": false}, {"data": ["REPL", 1500, 0, 0.0, 1767.2426666666659, 159, 48867, 1164.0, 3344.8, 4872.35, 9708.300000000005, 5.586072060329578, 76.83973792011918, 1.3310562331254074], "isController": false}, {"data": ["Tutorial-1", 1500, 0, 0.0, 2327.6893333333355, 38, 195617, 607.5, 4991.0, 7618.900000000003, 20761.190000000002, 5.567970066592922, 171.89841374912766, 0.690558787555958], "isController": false}, {"data": ["Docs", 1500, 0, 0.0, 48888.549333333336, 733, 203872, 42825.0, 93474.6, 114157.85, 146310.41, 5.553663196244242, 6536.855218979783, 0.6291259089495431], "isController": false}, {"data": ["REPL-1", 1500, 0, 0.0, 1086.6079999999993, 89, 44362, 572.0, 2417.3000000000006, 3596.600000000002, 7951.620000000001, 5.590881644762835, 75.02805923725465, 0.6988602055953544], "isController": false}, {"data": ["REPL-0", 1500, 0, 0.0, 680.5733333333343, 54, 15511, 471.5, 1340.000000000001, 1733.95, 3324.5700000000006, 5.5881114790986, 1.8769069430422423, 0.6330282534916383], "isController": false}, {"data": ["Blog", 1500, 0, 0.0, 2093.9200000000014, 36, 63587, 1072.5, 4681.700000000003, 6653.600000000002, 12161.460000000001, 5.596158796602012, 193.78833368775673, 0.6339398636775717], "isController": false}, {"data": ["FAQs", 1500, 0, 0.0, 2296.4766666666637, 41, 80611, 1190.0, 5039.100000000002, 6768.150000000001, 14419.440000000006, 5.6014459199067925, 228.7545689710704, 0.6290686335832822], "isController": false}, {"data": ["Examples", 1500, 0, 0.0, 2890.3753333333348, 41, 69393, 1945.0, 5582.4000000000015, 8045.050000000001, 15685.610000000002, 5.582662483391579, 227.98760544253764, 0.6269591656152652], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16500, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
