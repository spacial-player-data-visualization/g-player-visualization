
/******************************
        uploader.js 
 ******************************/

// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(parseFile);

  console.log("\nFetching data from localStorage.")
  var data = lastUpload();

  console.log(data);

  // Preview last upload
  populateTable(data);
})

// Create a new loading indicator
// var loading = new Mprogress({
//   template: 3,   // Indeterminate Progress Bar
//   parent: 'body' // Location to Insert
// });

// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
function parseFile(event) {
  
  loading.start();

  var file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    dynamicTyping: true,

    // Parser Callback
    complete: function(results) {

      console.log("\n.CSV file parsed. " + results.data.length + " results loaded.");

      var data = results.data;
      var errors = results.errors;
      var meta = results.meta;

      // Remove entries that only contain an empty string
      data = _.filter(data, function(dat){
        return dat.length > 1;
      })

      // Fill in preview table
      populateTable(data);

      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", JSON.stringify(data));

      // Stop loading indicator
      loading.end();
    }
  });
}

// Render content into HTML table.
// Allow user to preview the uploaded .csv file.
function populateTable(data){
  
  // Sample data for previewing
  data = _.sample(data, 500);

  var table = $("<table/>").attr("id","preview");
  var tableSize = maxEntrySize(data);

  for (var i in data) {
      var current = data[i];
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

      var tr = $("<tr>").append(tr);

      // Add row to table.
      $("table").append(tr);
  }
}

function formatData(data){
  
  // Limit Map
  var upData = _.filter(data, function(current){
    return current[0].indexOf("Position_Introhouse") > -1;
  })

  var entries = _.map(upData, function(current){
    
    // Map keys based on 
    return {
      playerID :  keyMapping.playerID,
      timestamp : keyMapping.timestamp,
      posX :      keyMapping.posX,
      posY :      keyMapping.posY,
      cameraX :   keyMapping.cameraX,
      cameraY :   keyMapping.cameraY,
      area:       keyMapping.area,
    }
  });

  return entries;
}

// Multi-post uploading
function bulkUpload(){
  $("#loading").text("Sending to database...");

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

  console.log("\n" + bins.length + " bins created. Creating POST requests....");

  // Upload bins
  upload(bins, function(){
    console.log("UPLOADS DONE!");
  });

  $("#loading").text(""); 
}

// Send data to database
function upload(bins, callback) {
    
    // If no bins remain, let's hollaback.
    if (bins.length <= 0){
      callback();
    }

    current = bins[0];

    console.log(bins.length + " Bins Remain.... ");

    // POST to server
    $.post(API.url + "entries", { entries : current }, function(data, textStatus, jqXHR){ 
      
      console.log(textStatus);

      // Save locally
      bins = data;

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