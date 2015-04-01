
/************************************
         Mapping Logic
 ************************************/

var Visualizer = {};

// Take data from settings.data.
// Add to the map.
Visualizer.updateMap = function(){

    Visualizer.clearMap();

    // If we're plotting paths
    if (settings.paths) {

      // Add player paths to map
      Visualizer.polylineData(settings.data);

    // Else, we're plotting points
    } else {

      // Add points to map
      Visualizer.plotPoints(settings.data);      
    }

    UI.loading(false, "Success. " + settings.data.length + " points loaded.");
}

Visualizer.clearMap = function(){
    
    // Clear active data sets
    _.each(settings.layers, function(layer){
      map.removeLayer(layer);
    })
}

// Add the provided data to the map.
// Returns a feature group.
Visualizer.plotPoints = function(data){

  var radius = 10;

  var markers = new L.FeatureGroup();

  _.each(data, function(p){

    var circle = L.circle([p.latitude, p.longitude], radius, {
      color: 'black',
      fillColor: '#000',
      fillOpacity: 1,
    }) //.addTo(map);

    markers.addLayer(circle);

  });

  // Save layer to settings.
  settings.layers.push(markers);
  
  // Save layer for reference
  map.addLayer(markers)

  return markers;
}

// Create lines between player locations
Visualizer.polylineData = function(data){

  // Group data by PlayerID
  var players = _.groupBy(data, 'playerID');
  
  // Keep track of current index
  var count = 0;

  // Create a polyline for each unique playerID
  _.each(players, function(player){

    // Create list of latLng ojects
    var latLngs = _.map(player, function(point){
      return Visualizer.toLatLng(point);
    });

    var options = {
      color: Visualizer.getColor(count++),
      opacity: 1,
      weight: 2,
    }

    // Create polyline
    var polyline = L.polyline(latLngs, options)

    settings.activeLayer = polyline;

    // Add polyline to map
    polyline.addTo(map);

    // Limit
    map.fitBounds(polyline.getBounds());

  });
}

// Convert the JSON Object to a leaflet LatLong object
Visualizer.toLatLng = function(point){

  // Extract keys. May be 'latitude' or 'lat'.
  var lat  = (point.latitude)  ? point.latitude  : point.lat;

  // Extract keys. May be 'longitude' or 'long'.
  var long = (point.longitude) ? point.longitude : point.long;

  // Return lat/long if they exist.
  if (lat && long) { return L.latLng(lat, long); }
};

// Adds a marker at the provided location
Visualizer.addMarker = function(lat, long, title){
  var title = (title) ? title : "";
  L.marker([lat, long], {title : title}).addTo(map);
}

// Get Data from API
Visualizer.loadData = function(){

  UI.loading(true, "Loading Data....");

  var options = {
    game : settings.game,
    area : settings.map.name,
    fidelity : 1,
  }

  // Hit API
  $.get(settings.API_url + "entries", options, function(data){

    offset = settings.map.offset;
    scale = settings.map.scale;

    // Validate data. Ignore NPC interactions, etc
    // @TODO: Temp data fix. Replaced by proper
    // API and data validation.
    data = _.filter(data, function(p){
      return p.posX && p.posY;
    })

    // SETUP DATA
    // Convert data points into plottable data
    data = _.map(data, function(p){
      return Visualizer.formatData(p);
    })

    // Save data for future reference
    settings.data = data;

    Visualizer.updateMap();
  })
};

Visualizer.formatData = function(data){
  
  // Create a latitude & longitude field.
  // Maps the (x,y) position to a coordinate
  // on the earth. Makes plotting MUCH easier

  data['latitude']  = ((data.posY + offset.y) * scale.y) / settings.scale;
  data['longitude'] = ((data.posX + offset.x) * scale.x) / settings.scale;
  
  return data;

}

// Export currently active data set as .csv
Visualizer.exportCSV = function(){
  // http://jsfiddle.net/sturtevant/vUnF9/
  // http://stackoverflow.com/a/4130939/317

  var json = settings.data;

  // var json = $.parseJSON(json);
  var csv = JSON2CSV(json);

  // Trick browser to force download.
  window.open("data:text/csv;charset=utf-8," + escape(csv))


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
};

Visualizer.getColor = function(i){
  
  var colors = [
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee090",
    "#ffffbf",
    "#e0f3f8",
    "#abd9e9",
    "#74add1",
    "#4575b4"
  ];

  if (i < colors.length - 1) {
    console.log(colors[i])
    return colors[i];
  } else {
    console.log("#0")
    return "#000000"
  }
}