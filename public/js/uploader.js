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

      var table = $("<table/>").attr("id","preview");
      // console.log(data);
      for (var i in data) {
          //console.log(data[i]);
          var tr="<tr>";
          for (var key in data[i]) {
              //console.log(key);
              tr+="<td>"+data[i][key]+"</td>";
          }
          tr+="</tr>";
          $("table").append(tr);
      }
      $("#loading").text("");
      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", data);
    }
  });
}

// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(parseFile);
});
