
/******************************
        uploader.js 
 ******************************/

// Watch File Input
$(document).ready(function(){

  // Watch the file upload. Parse when file selected.
  $("#csv-file").change(Uploader.parseFile);

  // Pull data from the previous upload
  var data = lastUpload();

  // Preview last upload
  Uploader.populateTables(data);

})

var Uploader = {};

// Extract data from the uploaded .csv file
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
      
      // @TODO: Test Errors, provide user feedback
      // var errors = results.errors;

      // Remove invalid keys from first column
      var data = sanitizeEntries(results.data, 0);

      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", JSON.stringify(data));

      // Preview data to DOM
      Uploader.populateTables(data);

      UI.loading(false);
    }
  });
}

// Takes a list of entries. Sorts into JSON arrays
// containing the same entry type. For example:,
// all "PlayerJumped" actions should be bulked together.
Uploader.sortByEntryType = function(data){

  // Order data by the first column
  data = Uploader.sortByColumn(data, 0);

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

// Sort data by values in the provided column id
Uploader.sortByColumn = function(data, column){
  return data.sort(function(a,b) { 
    var toReturn = a[column].localeCompare(b[column]);
    return toReturn;
  });
};

// Remove entries that only contain an empty string
Uploader.removeEmptyLines = function(data){
  return _.filter(data, function(dat){
    return dat.length > 1;
  });
};

// Populate multiple tables
Uploader.populateTables = function(data){

  // Clear tables
  $(".tableContainer").html("");

  // Bucket data by type of entry
  var buckets = Uploader.sortByEntryType(data);

  // Print each table to DOM
  _.each(buckets, function(bucket){

    // The first data point is the
    // type of data.
    var key = bucket[0][0];

    // Build HTML for one table at a time.
    Uploader.populateTable(bucket, key);

  })
};

// Render content into HTML table.
// Allow user to preview the uploaded .csv file.
Uploader.populateTable = function(bucket, type){

  // Sample data for previewing
  dataset = bucket.slice(0, 10);
  
  var keyMappingExists = getKeyMapping(settings.game, type) ? true : false;

  var status = (keyMappingExists) ? 
    '<span class="status key-mapping">Key Mapping Found</span>' :
    '<span class="status no-key-mapping">No Key Mapping Found</span>' ;

  var tableID = "preview" + type.replace(/\s/g, '');
  
  var tableSize = maxEntrySize(dataset);

  var tableTotal;

  var tableStart = '<div class="panel-heading">' +
                   '<button type="button" class="btn btn-default button"' +
                   'onclick="toggleHide(\'' + tableID + '\')">Toggle \"' + type + '\" Table</button>' + 
                   status + '</div>';

  var display = (keyMappingExists) ? 'none' : 'table';

  tableStart += "<table id=" + tableID + ' class="table table-striped" style="display: ' + display + ';">';
  var tableEnd = "<table/>";
  
  for (var i in dataset) {
    var current = dataset[i];
    var tr = "";
    var key = 0;

    while (tableSize > key) {

      if (typeof current[key] != 'undefined') {
        tr += "<td>" + current[key] + "</td>";
      } else {
        tr += "<td>" + "-" + "</td>";
      }

      key++;
    }

    var tr = "<tr>" + tr + "</tr>";
    tableStart = tableStart + tr;
  }

  tableTotal = tableStart + tableEnd;

  // Do we have a key mapping for this table? Apply
  // classes to the panel so that we can notify the user.
  var classes = (keyMappingExists) ? 'key-map-found' : 'key-map-missing';

  $(".tableContainer").append('<div class="panel panel-default ' + classes + '">' + tableTotal + '</div>');

  UI.alert("Data Previewed Loaded.", "preview")

};

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
  entries = Uploader.formatData(entries);

  if (!confirm("Upload " + entries.length + " entries to the database?")) return;

  // When POSTing data to the API, we occasionally
  // encounter a size/entry limit. Just to be safe,
  // lets send the data in multiple POSTS.

  // Split data into multiple, smaller bins
  var bins = split(entries, entries.length / 200);

  UI.loading(true, "Uploaded " + entries.length + " entries");

  bin_count = bins.length;

  // Upload bins
  Uploader.upload(bins, function(){
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
  $.post(settings.API_url + "entries", data, function(data, textStatus, jqXHR){ 

    // Log feedback
    console.log(textStatus + " " + data);

    // Pop off first object in array.
    // Recursively continue to upload
    // the rest of the array
    bins.shift();

    // If we have more bins to upload,
    // lets keep going through.
    Uploader.upload(bins, callback);

  });
}

// Apply a key mapping.
// Converts arrays from .csv file input
// into the corresponding JSON objects
Uploader.formatData = function(data){

  UI.alert("Filtering Valid Data.");

  var acc = [];

  _.each(data, function(current){

    var action = current[0];

    alert(action);

    // Get key mapping for the current entry
    var keyMapping = getKeyMapping(settings.game, action);

    //console.log("got key mapping " + keyMapping);
    
    // Ensure data has time, x, and y data
    // If not, get it from the last user entry that does
    // Note - this is only to fix a data error with the client's current data
    // set. It is not meant to be a full fledged feature.
    if ( keyMapping &&
      !( _.contains(keyMapping.columns, "posX") && 
        _.contains(keyMapping.columns, "posY") &&
        _.contains(keyMapping.columns, "timestamp") &&
        _.contains(keyMapping.columns, "area"))) {
      //  console.log("about to fill " + current);
    current = fillEntry(data, data.indexOf(current));
  }

    // If we have a key mapping, assign keys to the current data
    if (keyMapping){ 
      var entry = assignKeys(current, keyMapping.columns) 
    };

   // Return data that was converted.
   if (entry) { acc.push(entry); }

 });

UI.alert(acc.length + " of " + data.length + " Entries Valid.")

return acc;
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
function sanitizeEntries(data, column) {

  // Delete new lines
  data = Uploader.removeEmptyLines(data);
  
  for (var index in data) {
    data[index][column] = data[index][column].replace(/(?:\r\n|\r|\n)/g, '');
  }

  return data;
}

// toggle hidden or visible for the parent div
function toggleHide(id) {
  $("#" + id).toggle();

  //table.style.display = (table.style.display == "table") ? "none" : "table";
  //id.parentNode.find("table").slideToggle();
}

// fill in X, Y, area, and timestamp data;
// args:
  // data: the data to look through
  // index: the index to start looking at
function fillEntry(data, index) {
  
  current = data[index];

  for (var i = index; i > 0; i--) {

    // Extract event name
    var eventname = data[i][0];

    // Find key mapping
    var keyMapping = getKeyMapping(settings.game, eventname);

    if (keyMapping &&
      _.contains(keyMapping.columns, "area") &&
      _.contains(keyMapping.columns, "posX") &&
      _.contains(keyMapping.columns, "posY") && 
      _.contains(keyMapping.columns, "timestamp")) {
        console.log("found a suitable keymap");
        current["area"] = data[i]["area"];
        current["posX"] = data[i]["posX"];
        current["posY"] = data[i]["posY"];
        current["timestamp"] = data[i]["timestamp"];
        console.log(current);
        return current;
    }
  } 
return current;
}
