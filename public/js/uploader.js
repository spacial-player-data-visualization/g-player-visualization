// http://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/
function parseFile(event) {
  var file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    dynamicTyping: true,

    // Parser Callback
    complete: function(results) {
      
      var data = results.data;
      var errors = results.errors;
      var meta = results.meta;

      // Remove entries that only contain an empty string
      data = _.filter(data, function(dat){
        return dat.length > 1;
      })

      console.log(data);

      // Backup uploaded data to Local Storage
      localStorage.setItem("upload", data);
    }
  });
}

// Watch File Input
$(document).ready(function(){
  $("#csv-file").change(parseFile);
});