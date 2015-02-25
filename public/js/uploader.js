
/******************************
        uploader.js 
 ******************************/

// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
function parseFile(event) {
  
  loading.start();

  var file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    dynamicTyping: true,

    // Parser Callback
    complete: function(results) {

      console.log("\n.CSV file parsed:")
      console.log(results.data);

      var data = results.data;
      var errors = results.errors;
      var meta = results.meta;

      // Remove entries that only contain an empty string
      data = _.filter(data, function(dat){
        return dat.length > 1;
      })

      var table = $("<table/>").attr("id","preview");
      var tableSize = findTableSize(data);

      for (var i in data) {
          var current = data[i];
          var tr="<tr>";
          var key = 0;
          while (tableSize > key) {
              //console.log(key);
              if (typeof current[key] != 'undefined') {
                tr+="<td>"+current[key]+"</td>";
              } else {
                tr+="<td>"+ "-" +"</td>";
              }

              key++;
          }
          tr+="</tr>";
          $("table").append(tr);
      }

      loading.end();

      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", JSON.stringify(data));
    }
  });
}

function findTableSize(data) {
  max = data[0].length;
  for (var i in data) {
    if (data[i].length > max) {
      max = data[i].length;
    }
  }
  return max;
}


// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(parseFile);
});


function upload(event) {
  $("#loading").text("Sending to database...");
  
  var upData = localStorage.getItem("upload");
  
  upData = JSON.parse(upData);

  var upData = _.filter(upData, function(current){
    return current[0].indexOf("Position_Introhouse") > -1;
  })

  var entries = _.map(upData, function(current){
    return {
      playerID : current[1],
      timestamp : current[2],
      posX : current[3],
      posY : current[4],
      cameraX : current[6],
      cameraY : current[7],
      area: current[0],
    }
  });

  console.log(entries);

  // When POSTing data to the API, we occasionally
  // encounter a size/entry limit. Just to be safe,
  // lets send the data in multiple POSTS.
  
  // Define a max entries size
  var binsize = 50;

  // Split data into multiple, smaller bins
  var bins = split(entries, entries.length / 200);

  console.log("\n" + bins.length + " created. Creating POST requests....");

  for (var i in bins){
    $.post(API.url + "entries", { entries : bins[i]}, function(data, textStatus, jqXHR){ 
      console.log(textStatus);
      
      $("#loading").text(""); 
    });    
  }
}

// http://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
// Split the array into an N different arrays
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
