/*

uploader.js
G-Player Data Visualization

- This is an endpoint for uploading data to the Mongo DB

Created: March 23, 2015
Authors:
Alex Johnson @alexjohnson505
Alex Jacks @alexjacks92

*/

var Uploader = { CSV: {}, SSIEGE: {}, };
var selectedGame = "";

/*
name: loader
author: Alex Jacks
created: March 23, 2015
purpose: Load games into dropdown
modifications by: Alex Johnson
*/

function loader(){
  var selector = $("#gameSelect");

  // add game options to dropdown
  for (var index in options.games) {
    var option = options.games[index];
    var dropdownAdd = document.createElement("option");
    dropdownAdd.textContent = option;
    dropdownAdd.value = option;
    selector.append(dropdownAdd);
  }

  // make settings.game the selected option
  $("#gameSelect").val(localStorage.getItem("selectedGame"));
  settings.game = localStorage.getItem("selectedGame");
}

// Watch File Input
$(document).ready(function(){

  // Watch the file upload. Parse when file selected.
  $("#up-file").change(Uploader.parseFile);

})

$('#gameSelect').on('change', function(){
  var selected = $(this).find("option:selected").val();

  settings.game = selected;
  localStorage.setItem("selectedGame", settings.game);
});

/*
name: parseFile
author: Alex Jacks
created: March 23, 2015
purpose: Extract data from the uploaded .csv file
http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
argument: event is parsing event
*/
Uploader.parseFile = function(event) {

  UI.loading(true, "Parsing File....");

  var file = event.target.files[0];
  var ext = file.name.split('.').pop();
  var url = URL.createObjectURL(file);

  if (ext == "json") {
    $.getJSON(url, function(data){
      // TODO: ONLY DO THIS IF THE GAME IS SSIEGE / DIFFERENT FOR EACH GAME
      data = data.Events;
      // setLocalJSON(data);
      UI.alert(data.length + " results loaded.");
      console.log("The following data was taken from the uploaded .json:");
      console.log(data);
      Uploader.SSIEGE.testUpload(data);
    });

    UI.loading(false);
  } else if (ext == "csv") {
    Papa.parse(file, {

      header: false,
      dynamicTyping: true,

      // Parser Callback
      complete: function(results) {

        // error checking. Display errors to user.
        if (results.errors.length != 0) {
          Uploader.parserErrors(results.errors);
        }

        UI.alert(results.data.length + " results loaded.");

        // TODO: Test Errors, provide user feedback
        // var errors = results.errors;

        // Remove invalid keys from first column
        var data = Uploader.CSV.sanitizeEntries(results.data);

        // Backup uploaded data to Local Storage
        setLocalJSON(data);

        UI.loading(false);
      },
    });
  } else {
    UI.error("Warning, the file you selected has no extension");
    UI.loading(false);
  }
}




/*
name: parseErrors
author: Alex Jacks
created: April 13, 2015
purpose: take a list of errors from papaparse and
         display them to the user.
argument: errors is an array of papaparse error objects.
*/
Uploader.parserErrors = function(errors) {
  var toDisplay = "The following errors occured while trying to parse your file.\n";
  for (index in errors) {
    toDisplay = toDisplay.concat("Error on row " + errors[index].row + " was ");
    toDisplay = toDisplay.concat('"' + errors[index].message + '"' + '\n');
    //toDisplay = toDisplay.concat("Error: " + errors[index].message + "\nOn row:" errors[index].row + "\n");
  }
  alert(toDisplay);
}

/*
name: sortByEntryType
author: Alex Jacks
created: March 23, 2015
purpose: Takes a list of entries. Sorts into JSON arrays ontaining the same
         entry type. For example:, all "PlayerJumped" actions should be bulked
         together.
argument: data is the active dataset
*/
Uploader.sortByEntryType = function(data){

  // Order data by the first column
  data = Uploader.sortByColumn(data, 0);

  var buckets = [];

  var uniques = getUniqueKeys(data, 0);

  // Fill in preview table
  for (var i in uniques) {

    var dataset = _.filter(data, function(object) {
      return object[0].toString().localeCompare(uniques[i]) === 0;
    });

    buckets.push(dataset);
  }

  return buckets;
}

// Sort data by values in the provided column id
Uploader.sortByColumn = function(data, column){
  return data.sort(function(a,b) {
    var toReturn = a[column].toString().localeCompare(b[column].toString());
    return toReturn;
  });
};

/*
name: populateTables
author: Alex Johnson
created: March 23, 2015
purpose: populate multiple tables
argument: data is the active dataset
contributions by: Alex Jacks
*/

Uploader.populateTables = function(data){
  // Clear tables
  $(".tableContainer").html("");

  // some games only have 1 data type, which doesn't
  // need to be "bucketed"

  var element = document.getElementById("gameSelect");

  selectedGame = element.value;

  if (numberOfGameMappings(selectedGame) > 1) {
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
  } else {
     // settings.game -> eventName
    Uploader.populateTable(data, data[0][0]);
  }


};

/*
name: populateTable
author: Alex Johnson
created: March 23, 2015
purpose: Render content into HTML table.
         Allow user to preview the uploaded .csv file.
argument: bucket is the action subtable it falls to
          and type is key mapping type
contributions by: Alex Jacks
*/
Uploader.populateTable = function(bucket, eventName){

  var entryCount = bucket.length;

  // Sample data for previewing
  dataset = bucket.slice(0, 10);

  var keyMappingExists = getKeyMapping(settings.game, eventName) ? true : false;

  // Create status <span>.
  var status = (keyMappingExists) ?
  '<span class="status key-mapping">Key Mapping Found</span>' :
  '<span class="status no-key-mapping">No Key Mapping Found</span>' ;

  var tableID = "preview" + eventName.toString().replace(/\s/g, '');

  // Calculate number of columns
  var tableSize = maxEntrySize(dataset);

  var tableTotal;

  var tableStart = '<div class="panel-heading">' +
  '<button type="button" class="btn btn-default button"' +
  'onclick="toggleHide(\'' + tableID + '\')">Toggle \"' + eventName + '\" Table</button>' + entryCount + " Entries"  +
  status + '</div>';

  // Hide table if we have a key mapping
  var display = (keyMappingExists) ? 'none' : 'table';

  // Build the HTML table
  tableStart += "<table id=" + tableID + ' class="table table-striped" style="display: ' + display + ';">';
  var tableEnd = "<table/>";

  if (keyMappingExists) {
    var columns = getKeyMapping(settings.game, eventName).columns;
    var tr = "<tr>";
    for (var column in columns) {
      var th = "<th>";
      th += columns[column];
      th += "</th>";
      tr += th;
    }
    tr = tr + "</tr>";
    tableStart += tr;
  }

  for (var i in dataset) {
    var current = dataset[i];
    var tr = "";
    var key = 0;

    while (tableSize > key) {

      var a = (typeof current[key] != 'undefined') ? current[key] : "-"

      tr += "<td>" + a + "</td>";

      key++;
    }

    var tr = "<tr>" + tr + "</tr>";

    tableStart = tableStart + tr;
  }

  tableTotal = tableStart + tableEnd;

  // Do we have a key mapping for this table? Apply
  // classes to the panel so that we can notify the user.
  var classes = (keyMappingExists) ? 'key-map-found' : 'key-map-missing';

  $(".tableContainer").append('<div class="panel panel-default preview ' + classes + '">' + tableTotal + '</div>');

  UI.alert("Data Previewed Loaded.", "preview")

};

var bin_count = 0;

/*
TODO: THIS IS A TEST UPLOAD FUNCTION. NEEDS A TON OF WORK
*/
Uploader.SSIEGE.testUpload = function() {

  UI.loading(true, "Uploading Data.....");
  UI.alert("Sending to database.....");

  entries = getLocalJSON();

  console.log(entries)

  // TODO: in order to remove invalid entries, we must first create a set of required
  // TODO: keys for the game SSIEGE. We also have to check the node.js models and make
  // TODO: one that matches the fields for SSIEGE (playerID, area, posX, posY, timestamp)
  // Remove invalid entries
  // entries = Uploader.removeInvalidEntries(entries);

  if (!confirm("Upload " + entries.length + " entries to the database?")) {
      UI.loading(false, "Upload cancelled.");
      return;
  }

  // Split data into multiple, smaller bins
  var bins = split(entries, entries.length / 200);
  console.log("bins")
  console.log(bins)

  UI.loading(true, "Uploaded " + entries.length + " entries");

  bin_count = bins.length;

  // Upload bins
  Uploader.upload(bins, function(){
    UI.loading(false, "Upload complete!");
  });
}

/*
name: bulkUpload
author: Alex Jacks
created: March 23, 2015
purpose: Multi-post uploading
*/
Uploader.bulkUpload = function(){

  UI.loading(true, "Uploading Data.....");

  UI.alert("Sending to database....");

  // Get data from last upload
  entries = getLocalJSON();

   // Convert data into JSON object.
  // All data should now be represented
  // as a key/value pair
  var flag = numberOfGameMappings(settings.game);
  entries = Uploader.formatData(entries, flag);

  // Populate missing fields. In the case of bad data,
  // we'll use previous entries to make the data
  // 'at least' plottable
  entries = Uploader.fillMissingData(entries);


  var playerUploaded = false;

  $.get(Visualizer.API_url + "players", { game : settings.game}, function(data) {
    var players = data;

    playerUploaded = _.contains(players, entries[0].playerID);
    if (playerUploaded == true) {
      if (!confirm('Warning: The database already contains entries for player '
        + entries[0].playerID + ' for ' + settings.game + '. Are you sure you would' +
        ' like to proceed in uploading this dataset?' +
        ' This may result in adding duplicate data to the database.')) {
        UI.loading(false, "Upload cancelled.");
      return;
    }
  }

    // Remove invalid entries
    entries = Uploader.removeInvalidEntries(entries);

    // Get user approval before storing in database
    if (!confirm("Upload " + entries.length + " entries to the database?")) {
      UI.loading(false, "Upload cancelled.");
      return;
    }

    // When POSTing data to the API, we occasionally
    // encounter a size/entry limit. Just to be safe,
    // lets send the data in multiple POSTS.

    // Split data into multiple, smaller bins
    var bins = split(entries, entries.length / 200);

    UI.loading(true, "Uploaded " + entries.length + " entries");

    bin_count = bins.length;

    // Upload bins
    Uploader.upload(bins, function(){
      UI.loading(false, "Upload complete!");
    });
  });
}
/*
name: upload
author: Alex Jacks
created: March 23, 2015
purpose: Send data to database
argument: bins is the data being uploaded and callback is some call
contributions by: Alex Johnson
*/
Uploader.upload = function(bins, callback) {

  // If no bins remain, end recursion
  // and execute the callback.
  if (bins.length < 1){
    callback();
    return;
  }

  current = bins[0];

  UI.alert("Uploading " + (bin_count - bins.length + 1) + " of " + bin_count, "count");

  // Save data into JSON object.
  // Format JSON into string
  var data = {
    entries : JSON.stringify(current),
  };

  // POST to server
  $.post(Visualizer.API_url + "entries", data, function(data, textStatus, jqXHR){

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

/*
name: formatData
author: Alex Jacks
created: March 23, 2015
purpose: Apply a key mapping.
         Converts arrays from .csv file input
         into the corresponding JSON objects
argument: data is uploaded data and flag is whether or not multiple key
          mappings need to be found.
contributions by: Alex Johnson
*/
Uploader.formatData = function(data, flag){

  UI.alert("Filtering Valid Data.");

  if (!settings.game) {
    alert("No game selected. Please select the game for which you are currently uploading data.")
    return;
  }

  var acc = [];

  if (flag > 1) {

    _.each(data, function(current){

      var action = current[0];

      // Get key mapping for the current entry
      var keyMapping = getKeyMapping(settings.game, action);

      // If we have a key mapping, assign keys to the current data
      if (keyMapping){
        var entry = assignKeys(current, keyMapping.columns, keyMapping.type !== 'position')
      };

      // Return data that was converted.
      if (entry) { acc.push(entry); }

    });
  } else {

      var keyMapping = getKeyMapping(settings.game, data[0][0]);
      _.each(data, function(current) {

        if (keyMapping) {
          var entry = assignKeys(current, keyMapping.columns, keyMapping.type !== 'position')
        };

        if (entry) { acc.push(entry); };

      });
  }

  UI.alert(acc.length + " of " + data.length + " Entries Valid.")

  if (acc.length != data.length) {
    UI.alert("For invalid entries, make sure each entry has "
      + "X and Y position data, and a timestamp.")
  }

  return acc;
}

/*
name: fillMissingData
author: Alex Jacks
created: March 23, 2015
purpose: populate certain data types with a player idea based on nearby actions
e.g. dialogue has no playerId, so we use the id from nearby position events
argument: data is uploaded data
*/
Uploader.fillMissingData = function(data) {
  var entries = [];

  // Iterate through entries
  var playerID = '';
  if (data[0].playerID) {
    playerID = data[0].playerID;
  } else {
    playerID = prompt("The data seems to be missing a player ID."
      + " Please indicate one to use.");
  }
  for (var i = data.length - 1; i >= 0; i--) {

    // Current entry
    var current = data[i];
    // Ensure data has time, x, and y data
    // If not, get it from the last user entry that does
    if (current.posX &&  current.posY && current.timestamp && current.area) {

      //
      data[i] = current;

    // Else, if data is missing:
    // Populate the missing data
    } else {
      if (numberOfGameMappings(selectedGame) < 2) {
        data[i] = current;
        data[i].area = "default";
        data[i].playerID = playerID;
      } else {
        current.playerID = playerID;
        data[i] = fillEntry(data, current);
      }
    }
  };

return data;
}

// Remove blank entries from the uploaded data
Uploader.removeInvalidEntries = function(data){
  return _.filter(data, function(d){
    return containsRequiredKeys(d);
  })
}

/******************************
       Helper Functions
 ******************************/

// Retrieve data from localStorage
// Returns the last JSON that the user converted.
function getLocalJSON() {
  return JSON.parse(localStorage.getItem("upload"));
}

// Sets the localStorage "upload" to the string contents of the given JSON
function setLocalJSON(data) {
  localStorage.setItem("upload", JSON.stringify(data));
}

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

// Remove empty lines, new lines, line breaks, etc
Uploader.CSV.sanitizeEntries = function(data) {
  // Remove lines that contain 1 or fewer entries
  data = _.filter(data, function(row){ return row.length > 1; });

  // Remove line breaks, new lines, etc
  for (var index in data) {
    if (typeof data[index][0] == 'string' || data[index][0] instanceof String) {
        data[index][0] = data[index][0].replace(/(?:\r\n|\r|\n)/g, '');
    }
  }
  return data;
}

// toggle hidden or visible for the parent div
function toggleHide(id) {
  $("#" + id).toggle();
}

// fill in X, Y, area, and timestamp data;
// args:
//  - data: the data to look through
//  - current: the index to start looking at
function fillEntry(data, current) {

  // Find current data's location in array
  var currentIndex = data.indexOf(current);

  // Find data to check against.
  var indexToCheck = currentIndex;
  var entryToCheck = data[indexToCheck];

  // Find the LAST valid object that contains the required keys.
  while (entryToCheck && !containsRequiredKeys(entryToCheck) && indexToCheck > -1) {

    indexToCheck--;
    entryToCheck = data[indexToCheck];
  }

  if (entryToCheck && containsRequiredKeys(entryToCheck)) {

    current["playerID"]  = entryToCheck["playerID"];
    current["area"]      = entryToCheck["area"];
    current["posX"]      = entryToCheck["posX"];
    current["posY"]      = entryToCheck["posY"];
    current["timestamp"] = entryToCheck["timestamp"];

    // Data is fixed.
    // Return fixed data
    return current;

  } else {

    // If data is not fixed,
    // don't return broken data;
    return null;

  }
}

// find how many mappings exist for a game
// take in a game, return a number
function numberOfGameMappings(gameSelected) {
  var gameMappings = _.where(options.mappings, {game : gameSelected});
  return gameMappings.length;
}

// Return the key mapping given the
// game name, and the event name
// ex: getKeyMapping("Fallout New Vegas", "Attacked")
var getKeyMapping = function(game, eventName){

  var mappings = _.where(options.mappings, { "game" : game });

  for (index in mappings) {

    var actionList = mappings[index].actions;
    var eventName = eventName;

    if (_.contains(actionList, eventName)) {
      return mappings[index];
    }
  }

  var msg = "Unable to find key mapping for: " + eventName;

  console.error(msg);
  UI.error(msg);

  return;
}

// assignKeys() returns a JSON object, where
// the values of the 'values' array are assigned
// to the column names provided in the 'mapping' array.

// For example:
// values : ["apple", "orange", "pear"]
// columns : ["fruit", "color", "shape"]

// Results in:
// { fruit : "Apple", color : "orange", shape : "pear" }

var assignKeys = function(values, columns, isAction){
  var acc = {};

  // Check data. Make sure we have enough keys for our data.
  // TODO: comment this out for now, lots of problems with VPAL data
  /*
  if (columns.length != values.length){
    console.error("Warning: Mismatch in key mapping. Amount of keys and values differ." + columns.length + " Columns, " + values.length + " Values");
    console.log(columns);
    console.log(values);
    console.log("\n");
  }
  */

  if (isAction) {
    acc['action'] = values[0]
  }

  values = values.slice(1)

  _.each(columns, function(colName, i){

    // Ensure data exists. If not, make it null for DB.
    if (!values[i]) {
      values[i] = null;
    };

    // Create key/value pair
    acc[colName] = values[i];
  });

  acc["game"] = settings.game;

  return acc;
}
