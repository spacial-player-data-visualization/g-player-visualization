/*

visualizer.js
G-Player Data Visualization

- This is an endpoint for visualizing data on the Map

Created: March 29, 2015
Authors:
Alex Johnson @alexjohnson505
Alex Jacks @alexjacks92

*/

/*************************
     Default Settings
 *************************/

// Used to represent the current state of the map,
// and options that the user has selected. 

var settings = {

  // Save data
  data : null,

  // enable heatmap
  heatmap : true,

  // enable player paths
  paths : true,

  // Default Game
  game : null,

  // Current Map
  map : null,

  // Current overlay
  overlay : null,

  // Position of active heatmap
  activeHeatmap : 0,

  // Current players
  players : [],

  // Currently selected actions
  actions : [],

  // Current heatmaps
  heatmaps : [],

};

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

// Re-plot the map with updated settings
Visualizer.refresh = function(){
  Visualizer.clear();
  Visualizer.update();
};

// Take data from settings.data.
// Add to the map.
// Draw lines on the map
Visualizer.update = function(){

  // Group data by PlayerID
  var players = _.groupBy(settings.data, 'playerID');

  // Store current index
  var count = 0;

  // Iterate through players
  _.each(players, function(player, playerID){

      var thisPlayer = _.findWhere(settings.players, { 'playerID' : parseInt(playerID) });

      // Render each player onto the map
      Visualizer.draw(player, thisPlayer.color, count++);
  });

  /********************************
           HEATMAPS
   ********************************/

   Visualizer.updateHeatmap();

  // Loading complete
  UI.loading(false, "Success. " + settings.data.length + " points loaded.");
}

// Updates the active heatmap on the map
Visualizer.updateHeatmap = function(){
  // Display the active Heatmap
   if(settings.heatmaps.length > 0) {
     var hmaps = new L.FeatureGroup();
     hmaps.addLayer(settings.heatmaps[settings.activeHeatmap].heatmapLayer);
     addFeatureGroup(hmaps);
     console.log("ActiveHeatmap: " + settings.activeHeatmap + " being displayed.");
   }
}

/* 
name: draw
author: Alex Johnson
created: March 29, 2015
purpose: Draw a player onto the map. Positions are rendered
as lines, while actions are clickable points.
argument: entries are individual entries in data
color is the associated color for that playerID
index is some index of the dataset
*/

Visualizer.draw = function(entries, color, index){

    // Ensure chronological order
    entries = sortBy(entries, "timestamp");

    // Get the active set of data
    var data = Visualizer.activeData(entries);

    /********************************
             POSITIONS
     ********************************/

    // Should we show position data?
    if (shouldWePlotPositionData()) {

      // Create list of latLng ojects
      var positions = _.map(data.positions, function(point){

        // Return formatted latLng point
        return toLatLng(point);
      }); 

      // Create polyline
      var polyline = L.polyline(positions, {
          stroke: true,
          color: color,
          weight: 2,
          opacity: 1,
      })
      
      // Add a new Leaflet.js feature group, containing 
      // the layer of our player's polyline.
      var featureGroup = new L.FeatureGroup().addLayer(polyline);
      
      addFeatureGroup(featureGroup);
      
    }

    /********************************
             ACTIONS
     ********************************/

    var markers = new L.FeatureGroup();

    _.each(data.actions, function(p){

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

// Given a dataset, seperate the data into positions
// and actions. In addition, remove any data type
// that the user has disables from the UI
Visualizer.activeData = function(dataset){

    // Seperate data to positions and actions
    var data = {
      positions : [],
      actions : [],
    }

    // Get the currently selected list of actions
    var enabledActions = UI.filters.actions();

    // Does the user want to see position data?
    // This returns false if a.) a game has available
    // action data, and b.) the user has selected to
    // only show actions and events on the map

    if (shouldWePlotPositionData()) {

      // get list of positions
      data.positions = _.filter(dataset, function(d){

        // Do we not have an action key?
        return !d.action;
      });
    }

    // Get list of actions
    data.actions = _.filter(dataset, function(d){

      // Do we have an action key?
      var exists = (d.action) ? true : false;

      // Is the action enabled in the side nav?
      return exists && (_.contains(enabledActions, d.action))
    });

    return data;
}

// Clears the active data set. Resets map
Visualizer.clear = function(){
    
    // Clear action select
    $(".action-select").val(null).trigger('change')
    
    // Clear active data sets
    _.each(Visualizer.layers, function(layer){
        
        // Remove each active layer (heatmap layers can't be removed this way so try)
        try {
          map.removeLayer(layer);
        } catch (e) {
          console.log("Problem with removing layer " + layer + "\nMore info: " + e.message); 
        }
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
Visualizer.loadData = function(){

  UI.loading(true, "Loading Data....");

  var opts = Visualizer.getContext();

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

// Returns a representation of the current state of the
// map. This object provided context for what data
// the API should return in order to be mapped.
Visualizer.getContext = function(callback){

  var obj = {
    
    // Currently active game
    game : settings.game,

    // Currently active map
    area : settings.map.name,

    // Currently set data fidelity
    fidelity : $('#select-fidelity').val(),

    // Select players IDs
    playerIDs : UI.players.listIDs(),
    
    // List of filtered actions
    actions : settings.actions,

  }

  console.log("\nCurrent State of the Map:");
  console.log(obj);

  return obj;
}

// Update the map's view port, as to
// center the current data set.
Visualizer.focus = function(){

    var sample = Visualizer.layers[0]
    
    if (sample) map.fitBounds(sample.getBounds());
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

// Should we plot position data?
function shouldWePlotPositionData (){

    var gameMappings = _.where(options.mappings, {game : settings.game});

    // Does the game have more then 1 data type?
    if (gameMappings.length < 2) {
      return true;
    
    // Is the [position] check box selected?
    } else if (_.contains(UI.filters.categories(), 'position')){
      return true
    
    // Otherwise, don't show positions
    } else {
      return false
    };
}
