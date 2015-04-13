/*
exporter.js
G-Player Data Visualization

- Allows the exporting of present dataset as a downloadable .csv file

Authors:
Alex Johnson @alexjohnson505

Created: April 1, 2015
*/
var Exporter = {};

// Export provided data set as .csv
Exporter.toCSV = function(){

  // http://jsfiddle.net/sturtevant/vUnF9/
  // http://stackoverflow.com/a/4130939/317

  var json = settings.data;

  // var json = $.parseJSON(json);
  var csv = JSON2CSV(json);

  // Trick browser to force download.
  window.open("data:text/csv;charset=utf-8," + escape(csv))

};

/* 
name: JSON2CSV
created: April 1, 2015
purpose: makes conversion of data saved in settings.js to .csv file
*/
function JSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';

    if ($("#labels").is(':checked')) {
        var head = array[0];
        if ($("#quote").is(':checked')) {
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[0]) {
                line += index + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }

    for (var i = 0; i < array.length; i++) {
        var line = '';

        if ($("#quote").is(':checked')) {
            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[i]) {
                line += array[i][index] + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;   
}