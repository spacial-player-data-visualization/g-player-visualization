
/******************************
        uploader.js 
 ******************************/

// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(Uploader.parseFile);

  // Pull data from the previous upload
  var buckets = lastUpload();

  console.log(buckets);

  // Preview last upload
  Uploader.populateTables(buckets);
})

var Uploader = {};

// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
Uploader.parseFile = function(event) {
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
      // var errors = results.errors;
      // var meta = results.meta;

      // Delete new lines
      data = Uploader.removeEmptyLines(data);

      // Remove invalid keys from first column
      data = sanitizeColumn(data, 0);

      // Order data by the first column
      data = Uploader.sortByColumn(data, 0);
      
      // Bucket data by type of entry
      var buckets = Uploader.sortByEntryType(data);

      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", JSON.stringify(buckets));

      // Preview data to DOM
      Uploader.populateTables(buckets);

      UI.loading(false);
    }
  });
}

// Takes a list of entries. Sorts into JSON arrays
// containing the same entry type. For example:,
// all "PlayerJumped" actions should be bulked together.
Uploader.sortByEntryType = function(data){

  var buckets = [];

  var uniques = getUniqueKeys(data, 0);

  // Fill in preview table
  for (var i in uniques) {
    
    var dataset = _.filter(data, function(object) {
      return object[0].localeCompare(uniques[i]) === 0;
    });

    buckets.push(dataset);
  }

  return buckets;
}

Uploader.sortByColumn = function(data, column){

  var dataset = data.sort(function(a,b) { 
    var toReturn = a[column].localeCompare(b[column]);
    return toReturn;
  });

  return dataset;
}

// Remove entries that only contain an empty string
Uploader.removeEmptyLines = function(data){
    return _.filter(data, function(dat){
        return dat.length > 1;
    });
}

// Populate multiple tables
Uploader.populateTables = function(buckets){
  _.each(buckets, function(bucket){
    var key = bucket[0][0];
    Uploader.populateTable(bucket, key);
  })
}

// Render content into HTML table.
// Allow user to preview the uploaded .csv file.
Uploader.populateTable = function(bucket, tableNumber){
  
  // Sample data for previewing
  dataset = bucket.slice(0, 10);

  //console.log("pupulate call data is " + data);
  
  var id = "button" + tableNumber;
  var elem = document.getElementById(id);
  
  if (elem) { 
    // console.log(elem);
    // console.log(elem.parentNode);
    elem.parentNode.removeChild(elem);
  }

  id = "preview" + tableNumber;
  var elem2 = document.getElementById(id);

  if (elem2) { 
    var table = elem2;
    while (table.rows.length > 0) {
      table.deleteRow(0);
    }
  }
  
  var tableSize = maxEntrySize(dataset);
  var tableTotal;
  var tableStart= '<button type="button" id="button' + tableNumber + 
                  '" class="btn btn-default button' + tableNumber + 
                  '" onclick="toggleHide(this)">Collapse This Table</button><br>';

  tableStart += "<table id=" + id + ' class="table table-striped">';
  var tableEnd = "<table/>";
  
  for (var i in dataset) {
    var current = dataset[i];
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
Uploader.bulkUpload = function(){
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
Uploader.upload = function(bins, callback) {

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

// get the unique entries from the first field of the json objects
// Provide a column id to look at.
function getUniqueKeys(data, column) {
  var toReturn = [];
  
  for (var i in data) {
    toReturn.push(data[i][column]);
  }

  toReturn = _.uniq(toReturn, true);

  return toReturn;
}

// remove linebreaks and new lines from the data
// Provide a multidimensional array, and a column
function sanitizeColumn(data, column) {
  
  for (var index in data) {
    data[index][column] = data[index][column].replace(/(?:\r\n|\r|\n)/g, '');
  }

  return data;
}

// toggle hidden or visible for the parent div
function toggleHide(element) {

  console.log(element);
  
  console.log("in toggle hide");
  
  var table = element.parentNode.childNodes[5];
  console.log(table);

  //table.style.display = (table.style.display == "table") ? "none" : "table";
  //element.parentNode.find("table").slideToggle();
}