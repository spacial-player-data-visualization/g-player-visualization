
/******************************
        uploader.js 
        ******************************/

// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(parseFile);

  // Pull data from the previous upload
  var data = lastUpload();

  // Preview last upload
  populateTable(data, 0);
})

// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
function parseFile(event) {
  UI.loading(true, "Parsing File....")

  var file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    dynamicTyping: true,

    // Parser Callback
    complete: function(results) {
      UI.alert(results.data.length + " results loaded. ");
      
      if (results.errors.length > 0){
        UI.error(results.errors.length + " Errors.");  
      }

      var data = results.data;
      var errors = results.errors;
      var meta = results.meta;

      // Remove entries that only contain an empty string
      data = _.filter(data, function(dat){
        return dat.length > 1;
      });
      
      data.sort(function(a,b) { 
        var toReturn = a[0].localeCompare(b[0]);
        return toReturn;
      });

      data = sanitize(data);

      var uniques = getUniques(data);
      // UI.alert(results.data.length - data.length + " Empty Lines Removed.")
      // Fill in preview table
      for (var entry in uniques) {
        var dataset = _.filter(data, function(object) {
          return object[0].localeCompare(uniques[entry]) === 0;
        });
        populateTable(dataset, entry);
      }
      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", JSON.stringify(data));
    }
  });
}

// Render content into HTML table.
// Allow user to preview the uploaded .csv file.
function populateTable(dataSet, tableNumber){
  // Sample data for previewing
  //data = data.slice(0, 501);
  //console.log("pupulate call data is " + data);
  
  var id = "button" + tableNumber;
  var elem = document.getElementById(id);
  if (elem) { 
    console.log(elem);
    console.log(elem.parentNode);
    elem.parentNode.removeChild(elem);
  }


  id = "preview" + tableNumber;
  if (document.getElementById(id)) { 
    var table = document.getElementById(id);
    while (table.rows.length > 0) {
      table.deleteRow(0);
    }
  }

  
  var tableSize = maxEntrySize(dataSet);
  var tableTotal;
  var tableStart= '<button type="button" id="button' + tableNumber + '" class="btn btn-default button' + tableNumber +'" onclick="toggleHide(this)">Collapse This Table</button><br>';
  tableStart += "<table id=" + id + ' class="table table-striped">';
  var tableEnd = "<table/>";
  
  for (var i in dataSet) {
    var current = dataSet[i];
    var tr = "";
    var key = 0;

    while (tableSize > key) {

      if (typeof current[key] != 'undefined') {
        tr+="<td>"+current[key]+"</td>";
      } else {
        tr+="<td>"+ "-" +"</td>";
      }

      key++;
    }

    var tr = "<tr>" + tr + "</tr>";
    //console.log("103 tr is " + tr);
      // Add row to table.
      tableStart = tableStart + tr;
    }
    tableTotal = tableStart + tableEnd;
    $(".tableContainer").append(tableTotal);
    UI.alert("Data Previewed Loaded.", "preview")

  }

  function formatData(data){
    UI.alert("Filtering Valid Data.");

  // Limit Map
  var upData = _.filter(data, function(current){
    return current[0].indexOf("Position_Introhouse") > -1;
  })
  
  UI.alert(upData.length + " of " + data.length + " Entries Valid.")

  var entries = _.map(upData, function(current){

    // Map keys based on 
    return {
      playerID :  current[keyMapping.playerID],
      timestamp : current[keyMapping.timestamp],
      posX :      current[keyMapping.posX],
      posY :      current[keyMapping.posY],
      cameraX :   current[keyMapping.cameraX],
      cameraY :   current[keyMapping.cameraY],
      area:       current[keyMapping.area],
    }
  });
  return entries;
}

var bin_count = 0;

// Multi-post uploading
function bulkUpload(){
  UI.loading(true, "Uploading Data.....");

  UI.alert("Sending to database....");

  // Get data from last upload
  entries = lastUpload();

  // Convert data into JSON object.
  // All data should now be represented
  // as a key/value pair
  entries = formatData(entries);

  // When POSTing data to the API, we occasionally
  // encounter a size/entry limit. Just to be safe,
  // lets send the data in multiple POSTS.

  // Split data into multiple, smaller bins
  var bins = split(entries, entries.length / 200);

  UI.loading(true, "Uploaded " + entries.length + " entries");

  bin_count = bins.length;

  // Upload bins
  upload(bins, function(){
    UI.loading(false, "Upload COMPLETE");
  });
}

// Send data to database
function upload(bins, callback) {

    // If no bins remain, end recursion
    // and execute the callback.
    if (bins.length < 1){
      callback();
      return;
    }

    current = bins[0];

    UI.alert("Uploading " + (bin_count - bins.length) + " of " + bin_count, "count");

    // Save data into JSON object.
    // Format JSON into string
    var data = {
      entries : JSON.stringify(current),
    };

    // POST to server
    $.post(API.url + "entries", data, function(data, textStatus, jqXHR){ 

      // Log feedback
      console.log(textStatus + " " + data);

      // Pop off first object in array.
      // Recursively continue to upload
      // the rest of the array
      bins.shift();

      // If we have more bins to upload,
      // lets keep going through.
      upload(bins, callback);

    });
  }

/******************************
       Helper Functions
       ******************************/

// Find the entry with the most entries.
// This will determine the amount of
// rows to generate in the preview table.

function maxEntrySize(data) {
  var max = _.max(data, function(p){
    return p.length;
  });

  return max.length;
}

// Split the array into an N different arrays
// http://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays

function split(array, n) {
  var length = array.length
  var bins = [];
  var i = 0;

  while (i < length) {
    var size = Math.ceil((length - i) / n--);
    bins.push(array.slice(i, i + size));
    i += size;
  }

  return bins;
}

// Retrieve data from localStorage
// Returns the last JSON that the user converted.

function lastUpload(){
  return JSON.parse(localStorage.getItem("upload"));
}

// Create a new loading indicator
// var loading = new Mprogress({
//   template: 3,   // Indeterminate Progress Bar
//   parent: 'body' // Location to Insert
// });

// get the unique entries from the first field of the json objects
function getUniques(data) {
  var toReturn = [];
  for (var i in data) {
    toReturn.push(data[i][0]);
  }
  toReturn = _.uniq(toReturn, true);
  return toReturn;
}

// remove linebreaks from the data
function sanitize(data) {
  for (var index in data) {
    data[index][0] = data[index][0].replace(/(?:\r\n|\r|\n)/g, '');
  }
  return data;
}

// toggle hidden or visible for the parent div
function toggleHide(element) {
  console.log("in toggle hide");
  var table = element.parentNode.childNodes[5];
  console.log(table);
  //table.style.display = (table.style.display == "table") ? "none" : "table";
  //element.parentNode.find("table").slideToggle();
}