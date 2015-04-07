
/************************************
         Mapping Logic
 ************************************/


var Visualizer = {};

/************************************
         Global Variables
 ************************************/

// Global scale factor. Helps to max points (ranging 
// from -10,000 to 10,000) to their coordinate points 
// on a geo projection.
Visualizer.scaleFactor = 200;

// Feature Group representation of data
Visualizer.layers = [];

// Target API url
Visualizer.API_url = (window.location.href.indexOf("herokuapp.com") > -1) ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/";

// Take data from settings.data.
// Add to the map.
// Draw lines on the map
Visualizer.update = function(){

  // Group data by PlayerID
  var players = _.groupBy(settings.data, 'playerID');

  // Store current index
  var count = 0;

  // Iterate through players
  _.each(players, function(player){

      // Render each player onto the map
      Visualizer.draw(player, count++);
  });

  // Loading complete
  UI.loading(false, "Success. " + settings.data.length + " points loaded.");
}

// Draw a player onto the map. Positions are rendered
// as lines, while actions are clickable points.
Visualizer.draw = function(entries, index){

    // Get selected color.
    var color = Visualizer.getColor(index);

    // Ensure chronological order
    entries = sortBy(entries, "timestamp");

    /********************************
             POSITIONS
     ********************************/

    // get list of positions
    var positions = _.filter(entries, function(d){

      // Do we not have an action key?
      return !d.action;
    });

    // Create list of latLng ojects
    var positions = _.map(positions, function(point){

      // Return formatted latLng point
      return toLatLng(point);
    });

    var options = {
      stroke: true,
      color: color,
      weight: 2,
      opacity: 1,
    }

    // Create polyline
    var polyline = L.polyline(positions, options)
    
    var featureGroup = new L.FeatureGroup().addLayer(polyline);

    if (settings.paths) addFeatureGroup(featureGroup);

    /********************************
             ACTIONS
     ********************************/

    // Get list of actions
    var actions = _.filter(entries, function(d){

      // Do we have an action key?
      return (d.action) ? true : false;
    });

    var markers = new L.FeatureGroup();

    _.each(actions, function(p){

      var latLng = [p.latitude, p.longitude]

      var circle = L.circleMarker(latLng, {
        stroke: true,
        weight: 4,
        opacity: 1,
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

      // Hover label for displaying action
      circle.bindLabel(p.action, { className : "tooltip-hover", direction : 'right' })

      markers.addLayer(circle);

    });

    addFeatureGroup(markers);

}

// Clears the active data set. Resets map
Visualizer.clear = function(){
    
    // Clear active data sets
    _.each(Visualizer.layers, function(layer){
        
        // Remove each active layer
        map.removeLayer(layer);
    })
}


// Adds a marker at the provided location
Visualizer.addMarker = function(lat, long, title){
  
  // Optional Title
  var title = (title) ? title : "";

  // Place marker on the map
  L.marker([lat, long], {title : title}).addTo(map);

}

// Get Data from API
Visualizer.loadData = function(playerIDs){

  UI.loading(true, "Loading Data....");

  var opts = Visualizer.getContext();

  if (playerIDs) opts.playerIDs = playerIDs;

  // Hit API
  $.get(Visualizer.API_url + "entries", opts, function(data){

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

// Convert the (x,y) values from the player logs
// into Latitude and Longitude positions on a map.
Visualizer.formatData = function(data){
  
  // Global scale factor. Helps to max points (ranging 
  // from -10,000 to 10,000) to their coordinate points 
  // on a geo projection.
  
  var scale = Visualizer.scaleFactor;

  // Create a latitude & longitude field.
  // Maps the (x,y) position to a coordinate
  // on the earth. Makes plotting MUCH easier

  data['latitude']  = data.posY / scale;
  data['longitude'] = data.posX / scale;
  
  return data;
}

// Convert a lat/long to it's raw X/Y values
Visualizer.unformatData = function(latLong){

  var scale = Visualizer.scaleFactor;

  return {
    posX : latLong['longitude'] * scale,
    posY : latLong['latitude'] * scale,
  }
}

Visualizer.getColor = function(i){
  
  var colors = ["#d73027", "#f46d43", "#fdae61",
                "#fee090", "#ffffbf", "#e0f3f8", 
                "#abd9e9", "#74add1", "#4575b4"];

  return (i < colors.length - 1) ? colors[i] : "#000000";
}

// Returns a representation of the current state of the
// map. This object provided context for what data
// the API should return in order to be mapped.
Visualizer.getContext = function(callback){

  var obj = {
    game : settings.game,
    area : settings.map.name,
    fidelity : 1,
    playerIDs : options.players,
    actions : settings.actions,

  }

  if (obj.actions.length < 1) obj.actions = ["Quest"];

  console.log("\nCurrent Settings of the Map:");
  console.log(obj);

  return obj;
}

// Update the map's view port, as to
// center the current data set.
Visualizer.focus = function(){

    var sample = Visualizer.layers[0]
    
    if (sample) map.fitBounds(sample.getBounds());

    // TODO: Set max/min zoom levels dynamically
    // map.minZoom()
    // map.maxZoom()
}

/**************************************
         HELPER FUNCTIONS
     ... these should *never* be
   called from the User Interface.
 **************************************/

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

// Adds the provided featureGroup to the map.
// Feature groups are objects representing 
// "bulked", or otherwise grouped vector
// objects as a single layer on the map.
function addFeatureGroup (featureGroup){
    
    // Save layer to settings.
    // We must save a reference to each layer, 
    // as it's the most effective way to iterate
    // through and remove layers.

    Visualizer.layers.push(featureGroup);

    // Save layer for reference
    map.addLayer(featureGroup);
}

// Convert the JSON Object to a leaflet LatLong object
function toLatLng (point){

  // Extract keys. May be 'latitude' or 'lat'.
  var lat  = (point.latitude)  ? point.latitude  : point.lat;

  // Extract keys. May be 'longitude' or 'long'.
  var long = (point.longitude) ? point.longitude : point.long;

  // Return lat/long if they exist.
  if (lat && long) { return L.latLng(lat, long); }

};

// Return the key mapping given the 
// game name, and the event name
// ex: getKeyMapping("Fallout New Vegas", "Attacked")
var getKeyMapping = function(game, eventName){

  // Get the type of event from the lookup table
  var type = options.lookup_table[eventName];

  // Find mapping
  var mapping = _.findWhere(options.mappings, {game : settings.game, type : type});

  if (!mapping || !type) {
    console.error("Unable to find key mapping for: " + eventName);
    return;
  }

  return mapping;
}

// assignKeys() returns a JSON object, where
// the values of the 'values' array are assigned
// to the column names provided in the 'mapping' array.

// For example:
// values : ["apple", "orange", "pear"]
// columns : ["fruit", "color", "shape"]

// Results in:
// { fruit : "Apple", color : "orange", shape : "pear" }

var assignKeys = function(values, columns){
  var acc = {};

  // Check data. Make sure we have enough keys for our data.
  if (columns.length != values.length){
    console.error("Warning: Mismatch in key mapping. Amount of keys and values differ." + columns.length + " Columns, " + values.length + " Values");
    console.log(columns);
    console.log(values);
    console.log("\n");
  }

  _.each(columns, function(value, key){
    // Ensure data exists. If not, make it null for DB.
    if (!values[key]) {
      values[key] = null;
    }; 

    // Create key/value pair
    acc[value] = values[key];
  });

  acc["game"] = settings.game;
  return acc;
  // ex: assignKeys(["apple", "orange", "pear"], ["fruit", "color", "shape"])
}

// Given a list of arrays, convert the data into JSON objects.
//   game : String of game name
//   eventName : the event name for this table
//   data : multudimensional array container player data

var assignKeysForEntireTable = function(game, eventName, data) {
  var acc = [];

  // Key the key mapping
  var mapping = getKeyMapping(game, eventName).columns;

  // Apply key mapping to each object in the data array
  _.each(data, function(d){
    var json = assigKeys(d, mapping);
    if (json) acc.push(json);
  })

  return acc;
}
