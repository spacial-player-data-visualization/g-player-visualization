
/************************************
         Mapping Logic
 ************************************/

var Visualizer = {};

// Take data from settings.data.
// Add to the map.
Visualizer.updateMap = function(){

    // Visualizer.clearMap();

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
    
    // Clear data from memory
    settings.data = null;

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
      fillColor: '#fff',
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

// Adds a marker at the provided location
Visualizer.addMarker = function(lat, long, title){
  
  var title = (title) ? title : "";

  L.marker([lat, long], {title : title}).addTo(map);
}

// Get Data from API
Visualizer.loadData = function(){

  UI.loading(true, "Loading Data....");

  var options = Visualizer.getContext();

  // Hit API
  $.get(settings.API_url + "entries", options, function(data){

    offset = settings.map.offset;
    scale = settings.map.scale;

    // Validate data. Ignore non-spacial data
    data = _.filter(data, function(p){
      return p.posX && p.posY;
    })

    // Convert data points into plottable data
    data = _.map(data, function(p){
      return Visualizer.formatData(p);
    })

    // Save data for future reference
    settings.data = data;

    // Update our map with new data.
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

// Convert the JSON Object to a leaflet LatLong object
Visualizer.toLatLng = function(point){

  // Extract keys. May be 'latitude' or 'lat'.
  var lat  = (point.latitude)  ? point.latitude  : point.lat;

  // Extract keys. May be 'longitude' or 'long'.
  var long = (point.longitude) ? point.longitude : point.long;

  // Return lat/long if they exist.
  if (lat && long) { return L.latLng(lat, long); }

};

Visualizer.getColor = function(i){
  
  var colors = ["#d73027", "#f46d43", "#fdae61",
                "#fee090", "#ffffbf", "#e0f3f8", 
                "#abd9e9", "#74add1", "#4575b4"];

  return (i < colors.length - 1) ? colors[i] : "#000000";
}

// Returns a representation of the current state of the
// map. This object provided context for what data
// the API should return in order to be mapped.
Visualizer.getContext = function(){

  return {
    game : settings.game,
    area : settings.map.name,
    fidelity : 5,
  }
}
