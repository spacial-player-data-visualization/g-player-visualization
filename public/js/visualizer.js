
/************************************
         Mapping Logic
 ************************************/

var Visualizer = {};

// Take data from settings.data.
// Add to the map.
// Draw lines on the map
Visualizer.update = function(){

  var data = settings.data;

  // Group data by PlayerID
  var players = _.groupBy(data, 'playerID');
  
  // Keep track of current index
  var count = 0;

  // Create a polyline for each unique playerID
  // Loop for each player we have
  _.each(players, function(entries){

    var color = Visualizer.getColor(count++);

    // Ensure chronological order
    entries = sortBy(entries, "timestamp");

    // @TODO : Find a better way to seperate this.

    // Get list of actions
    var actions = _.filter(entries, function(d){

      // Do we have an action key?
      return (d.action) ? true : false;
    });

    // get list of positions
    var positions = _.filter(entries, function(d){

      // Do we not have an action key?
      return !d.action;
    });

    console.log("Actions : " + actions.length);
    console.log("Positions : " + positions.length);

    // Create list of latLng ojects
    var positions = _.map(positions, function(point){

      // Return formatted latLng point
      return Visualizer.toLatLng(point);
    });

    var options = {
      stroke: true,
      color: color,
      weight: 2,
      opacity: 1,
    }

    // Create polyline
    var polyline = L.polyline(positions, options)

    var positionsGroup = new L.FeatureGroup();

    positionsGroup.addLayer(polyline);
    
    settings.layers.push(positionsGroup);

    map.addLayer(positionsGroup);

    // ***************
    // Plot Points
    // ***************

    var markers = new L.FeatureGroup();

    _.each(actions, function(p){

      var latLng = [p.latitude, p.longitude]

      var circle = L.circleMarker(latLng, {
        stroke: true,
        color: color,
        fill: true,
        fillColor: "#fff",
        fillOpacity: 1,
        radius: 5,
      })

      // Create a new popup object
      var popup = L.popup()
        .setLatLng(latLng)
        .setContent(convertJSONtoHTML(p))

      // Add popup to the circle
      circle.bindPopup(popup);

      // Provide hover of JUST the action
      circle.on('mouseover', function(e) {

        // $("#legend").html(p.action);
        console.log(p.action)

      });

      markers.addLayer(circle);

    });

    // Save layer to settings.
    settings.layers.push(markers);
    
    // Save layer for reference
    map.addLayer(markers)

    UI.loading(false, "Success. " + settings.data.length + " points loaded.");

  });

  // Set view
  map.fitBounds(settings.layers[0].getBounds());
}

// Clears the active data set. Resets map
Visualizer.clear = function(){
    
    // Clear data from memory
    settings.data = null;

    // Clear active data sets
    _.each(settings.layers, function(layer){
      map.removeLayer(layer);
    })
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

    // Validate data. Ignore non-spacial data
    data = _.filter(data, function(p){
      return containsRequiredKeys(p);
    })

    // Convert data points into plottable data
    data = _.map(data, function(p){
      return Visualizer.formatData(p);
    })

    // Save data for future reference
    settings.data = data;

    // Update our map with new data.
    Visualizer.update();

  })
};

Visualizer.formatData = function(data){
  
  // Create a latitude & longitude field.
  // Maps the (x,y) position to a coordinate
  // on the earth. Makes plotting MUCH easier

  data['latitude']  = ((data.posY + settings.map.offset.y) * settings.map.scale.y) / settings.scale;
  data['longitude'] = ((data.posX + settings.map.offset.x) * settings.map.scale.x) / settings.scale;
  
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
    fidelity : 1,
  }
}

// Sort the provided list by the provided key
function sortBy (list, key){
  return _.sortBy(list, function(l){
        return l[key];
      })
}

// Convert the provided JSON object into an
// HTML representation
function convertJSONtoHTML(JSON){
  var acc = "";

  _.each(JSON, function(val, key){

    // Lets ignore a few keys
    // These keys are automatically generated
    // by the system, so the end user
    // won't miss them.

    if (key != "__v" &&
        key != "latitude" &&
        key != "longitude"){

      acc += "<p>" + key + " : <b>" + val + "</b></p>";
    }
    
  })

  return acc;
}

// Does the provided object contain the required keys?
function containsRequiredKeys(obj){
  
  // Required keys
  var keys = ["playerID", "area", "posX", "posY", "timestamp"];

  var acc = true;

  _.each(keys, function(key){
    var containsKey = (obj && obj[key]) ? true : false;
    acc = acc && containsKey;
  })

  return acc;
}
