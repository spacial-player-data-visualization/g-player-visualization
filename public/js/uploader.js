// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
function parseFile(event) {
  
  $("#loading").text("Loading...");
  var file = event.target.files[0];

  loading.start();

  Papa.parse(file, {
    header: false,
    dynamicTyping: true,

    // Parser Callback
    complete: function(results) {

      console.log(results.data);

      loading.end();

      var data = results.data;
      var errors = results.errors;
      var meta = results.meta;

      // Remove entries that only contain an empty string
      data = _.filter(data, function(dat){
        return dat.length > 1;
      })

      data = _.sample(data, 100);

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
      $("#loading").text("");
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

  console.log(upData);

  var upData = _.filter(upData, function(current){
    return current[0].indexOf("Position_Introhouse") > -1;
  })

  var entries = {
    entries : _.map(upData, function(current){
      return {
        playerID : current[1],
        timestamp : current[2],
        posX : current[3],
        posY : current[4],
        cameraX : current[6],
        cameraY : current[7],
        area: current[0],
      }
    })
  }

  console.log(entries);
  
  $.post(API.url + "entries", entries, function(data, textStatus, jqXHR){ 
    // put the check mark next to the row in the table

    console.log(textStatus);

    // this will go into the callback as soon as posting error is fixed
    
    $("#loading").text(""); 

  });
  
}
