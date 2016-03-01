/*

visualizer.js
G-Player Data Visualization

- This is an endpoint for visualizing data on the Map

Created: March 29, 2015
Authors:
Alex Johnson @alexjohnson505
Alex Jacks @alexjacks92
Alex Gimmi @ibroadband 

*/

/*************************
     Default Settings
 *************************/

// Used to represent the current state of the map,
// and options that the user has selected. 

var settings = {

  // Save data
  data : {
    actions: [],
    positions: [],
  },

  // Save data as GeoJSON
  geoJsonLayer : {
    type: "FeatureCollection",
    features: [],
  },
 
 //GeoJason Feature format  Layer for Playback Timeline
   geoJsonLay :{
    type: "Feature",
    geometry: {
    type: "MultiPoint",
    coordinates: [/*array of [lng,lat] coordinates*/]
  },
  properties: {
    time: [/*array of UNIX timestamps*/]
  }
   },
   
  //player tracks
  tracks : [], 

  // enable player paths
  paths : true,

  // Default Game
  game : null,

  // Current Map
  map : null,

  // Current overlay
  overlay : null,

  // Pixels per meter for the current zoom
  pixelsPerMeter : -1,

  // Pixels per LatLng for the current zoom
  pixelsPerLatLng : -1,

  // Position of active heatmap
  activeHeatmap : 0,

  // Current players
  players : [],

  // Currently selected actions
  actions : [],

  // Current heatmaps
  heatmaps : [],

  // Current heatmap ids
  heatmapIds : [],

  // Save heatmaps' data
  heatmapData : [],

  // All available types of actions (filters)
  listOfActions : [],
  
  // Current groups
  groups : []


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

  // Unfiltered data
  var unfilteredData = settings.data.positions.concat(settings.data.actions);

  // Group data by PlayerID
  var players = _.groupBy(unfilteredData, 'playerID');

  // Store current index
  var count = 0;
  
  // check if group is visible (indivisual player visibility is deselected)
  var groupvisible = false;
  _.each(settings.groups, function(group){
	  if(group.visibility){
		console.log("group visible. looking at players in group...");
		groupvisible = true;
		// Iterate through players
		_.each(players, function(player, playerID){
			var thisPlayer = _.findWhere(settings.players, { 'playerID' : parseInt(playerID) });
			
			// Render each player onto the map
			if(group.players.indexOf(playerID) != -1)
			Visualizer.draw(player, thisPlayer.color, count++, group.checkedActions);
		});
	  }
  });
  
  if(groupvisible == false){
	  console.log("no group visible. looking at players...");
	  // Iterate through players
	  _.each(players, function(player, playerID){
		  var thisPlayer = _.findWhere(settings.players, { 'playerID' : parseInt(playerID) });

		  // Render visible player onto the map
		  if(thisPlayer.visibility)
		  Visualizer.draw(player, thisPlayer.color, count++, thisPlayer.checkedActions);
	  });
  }
  
  Visualizer.updateHeatmap();

  // Loading complete
  UI.loading(false, "Success. " + unfilteredData.length + " points loaded.");
}//Asarsa

 /********************************
           HEATMAPS
   ********************************/

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: redraws the currently selected heatmap on the map
*/
Visualizer.updateHeatmap = function(){
  // Display the active Heatmap
   if(settings.heatmaps.length > 0) {
     var hmaps = new L.FeatureGroup();
     var index = Heatmap.getIndexFromId(settings.activeHeatmap);
     hmaps.addLayer(settings.heatmaps[index].heatmapLayer);
     addFeatureGroup(hmaps);
     console.log("Heatmap at index " + index + " with id " + settings.activeHeatmap + " being displayed.");
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
checkedActions is list of action boxes checked for user
*/
Visualizer.draw = function(entries, color, index, checkedActions){

    // Ensure chronological order
    entries = sortBy(entries, "timestamp");

    // Get the active set of data
    var data = Visualizer.activeData(filterPositions(entries),checkedActions);

    /********************************
             POSITIONS
     ********************************/

    // Should we show position data?
    if (shouldWePlotPositionData(checkedActions)) {

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
      });

      // Create a new popup object
      var popup = L.popup()
        .setLatLng(latLng)
        .setContent(convertJSONtoHTML(p));

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
Visualizer.activeData = function(dataset,checkedActions){

    // Seperate data to positions and actions
    var data = {
      positions : [],
      actions : [],
    };

    // Get the currently selected list of actions
    var enabledActions = UI.filters.actions(checkedActions);

    // Does the user want to see position data?
    // This returns false if a.) a game has available
    // action data, and b.) the user has selected to
    // only show actions and events on the map

    if (shouldWePlotPositionData(checkedActions)) {

      // get list of positions
      data.positions = dataset.positions;
    }

    // Get list of actions
    data.actions = _.filter(dataset.actions, function(d){

      // Is the action enabled in the side nav?
      return (_.contains(enabledActions, d.action))
    });

    return data;
}

// Clears the active data set. Resets map
Visualizer.clear = function(){
    
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
    });

   // console.log("Data to be changed:"+data);
    // Convert data points into GeoJSON
    data = _.map(data, function(p){
      return Visualizer.formatData(p);
    });

    console.log("Formatted Data: ");
    console.log(data);

    // Save data for future reference
    if (data.length == 0) {
      settings.data = {
        positions : [],
        actions : [],
      };
    } else {
      settings.data = filterPositions(data);
    }

    // Create the GeoJson layer for the Leaflet.timeline
    Visualizer.createGeoJsonLayer();

    // TODO: TIMELINE WIP
    /*
    var timeline = L.timeline(data, {
          style: function(data){
            return {
              stroke: false,
              color: 'black',
              fillOpacity: 0.5
            }
          },
          formatDate: function(date){
            return moment(date).format("YYYY-MM-DD");
          }
        });
    timeline.setPosition('topleft');
    timeline.addTo(map);
    console.log("adding timeline to map");
    */
    // TODO: END WIP

    // =====================================================
    // =============== Playback ============================
    // =====================================================
    
    // Playback options
/*    if (data.length != 0) { 
     var playbackOptions = {
       

    };
          var playback = new L.Playback(map, settings.geoJsonLay,null, playbackOptions);  

              var control = new L.Playback.Control(playback);
             control.addTo(map);
        }  */
		
	//Adding D3 brush layer 
    //=====================================================
	//=====================================================
    // Playback options
 /*    settings.tracks = settings.tracks.filter(Boolean);
	
	    var myLayer = L.geoJson().addTo(map);

		myLayer.addData(settings.geoJsonLayer);
		setBrush(settings.geoJsonLayer);
		
		function pointColor(feature) {
			return feature.properties.start> 5 ? '#f55' : '#a00';
		}

		function pointRadius(feature) {
			return 6;
		}
	

author: Tariq Anwar
created: Feb 22, 2016
purpose: Adding D3 brush component.
argument: the formatted data 
		
	function setBrush(data) {
    var container = d3.select('#brush'),
       width =800,    
       height = 100;
       margin = {top: 0, right: 40, bottom: 50, left: 400};
     
    var timeExtent = d3.extent(data.features, function(d) {
        return new Date(d.properties.start);
    });

    var svg = container.append('svg')
        .attr("class", "grid-background")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' +
            margin.left + ',' +
            margin.top + ')');


    var x = d3.time.scale()
        .range([0, width])
        .domain(timeExtent);

    var brush = d3.svg.brush()
        .x(x)
        .on('brushend', brushend);     
     
	context.selectAll('circle.quake')
		   .data(data.features)
		   .enter()
		   .append('circle')
		   .attr('transform', function(d) {
				return 'translate(' + [x(new Date(d.properties.start)), height/2] + ')';
			    })
		   .attr('r', pointRadius)
		   .attr('opacity', 0.5)
		   .attr('stroke', '#fff')
		   .attr('stroke-width',0.5)
		   .attr('fill', pointColor);


	context.append('g')
			.attr('class', 'x brush')
			.call(brush)
			.selectAll('rect')
			.attr('y', -6)
			.attr('height', height);    


        function brushend() {
        var filter;
            // If the user has selected no brush area, share everything.
        if (brush.empty()) {
            filter = function() { return true; }
        } else {
            // Otherwise, restrict features to only things in the brush extent.
            filter = function(feature) {
             // console.log("strart"+feature.properties.start);
             // console.log("zero"+brush.extent()[0] +"one"+brush.extent()[1]);
                return feature.properties.start > +brush.extent()[0] &&
                    feature.properties.start < (+brush.extent()[1]);
            };
        }
        var filtered = data.features.filter(filter);
            myLayer.clearLayers()
            .addData(filtered);
        }


            function drawBrush() {
    // our year will this.innerText
    //console.log(this.innerText)

    // define our brush extent to be begin and end of the year
    brush.extent(timeExtent)
    // brush.extent([[250, 80], [600, 80]]);

    // now draw the brush to match our extent
    // use transition to slow it down so we can see what is happening
    // remove transition so just d3.select(".brush") to just draw
    brush(d3.select("#brush").transition());

    // now fire the brushstart, brushmove, and brushend events
    // remove transition so just d3.select(".brush") to just draw
    brush.event(d3.select("#brush").transition().delay(10))
  }

} */
	
	//========================================================
	//========================================================
		
    // Update our map with new data.
    Visualizer.update();
  })
};

/*
author: Alex Gimmi
created: August 10, 2015
purpose: Format the data in a way that Leaflet and Leaflet.timeline can use
argument: the unformatted data to format
*/
Visualizer.formatData = function(data){
  
  // Global scale factor. Helps to max points (ranging 
  // from -10,000 to 10,000) to their coordinate points 
  // on a geo projection.
  
  var scale = Visualizer.scaleFactor;

  // Create a latitude & longitude field.
  // Maps the (x,y) position to a coordinate
  // on the earth. Makes plotting MUCH easier

  data['longitude'] = data.posX / scale;
  data['latitude']  = data.posY / scale;

//data['longitude'] = data.posX ;
 // data['latitude']  = data.posY;//
  // Assigns this data point a start/end based on the data's timestamp in seconds
  // Note: for a game that has events with a start/end time a condition can be added here
  // year, month, day, hours, minutes, seconds, milliseconds

  //data format for New Timeline Feature 
   data['coord'] = [(data.longitude), (data.latitude)];
  // TODO: using data.timestamp allows us to just use the raw time for now...
  // Not sure what to do to have the time display exactly as we want it to.
  data['start'] = data.timestamp*1000;//data.timestamp;//moment({seconds: data.timestamp}).unix();
  data['end'] = data.timestamp;//moment({seconds: data.timestamp}).unix();

  // TODO: geometry for positions should be a LineString, not a Point
  //if(data.action) {
    data['geometry'] = {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    };
  /*} else { 
    data['geometry'] = {
      type: 'LineString',
      // TODO: WIP Obviously need to find a way to have lines drawn properly.
      coordinates: [[data.longitude, data.latitude], [data.longitude, data.latitude]],
    }
  }*/

  //TODO: FORMAT ALL OF THE DATA TYPES NEEDED FOR LEAFLET.TIMELINE
  
  return data;
}

/*
author: Alex Gimmi
created: September 8, 2015
purpose: Create a GeoJson version of some formatted data
argument: the formatted data to GeoJson-ify
*/
Visualizer.convertJsonToGeoJson = function(json) {
  var geoJson = {type : 'Feature', 
    properties: {longitude: json['longitude'],
                 latitude: json['latitude'],
                 start: json['start'],
                 end: json['end']},
    geometry: json['geometry'],
  };

  return geoJson;
}

/*
author: Alex Gimmi
created September 8, 2015
purpose: Create a Feature Collection of all GeoJson data
*/
Visualizer.createGeoJsonLayer = function() {
  _.each(settings.data.actions.concat(settings.data.positions), function(json){
    //console.log("DDDDDD"+JSON.stringify(json, null, 4));
    settings.geoJsonLay.geometry.coordinates.push(json['coord']);
    settings.geoJsonLay.properties.time.push(json['start']);
    var geoJson = Visualizer.convertJsonToGeoJson(json);
    
    settings.geoJsonLayer.features.push(geoJson);
   // console.log("DDDDDD"+settings.geoJsonLay.geometry.coordinates);
  });
  
  //Pushing GeoJasonLay to array tracks
    if(settings.geoJsonLay.properties.time.length != 0){
    settings.tracks.push(settings.geoJsonLay);
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

    // List of current heatmaps
    heatmaps : settings.heatmaps,

    // Currently active heatmap
    activeHeatmap : settings.activeHeatmap,
    
    // List of filtered actions
    actions : settings.actions,
	
	//data
    data : settings.tracks

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
function shouldWePlotPositionData (checkedActions){

    var gameMappings = _.where(options.mappings, {game : settings.game});

    // Does the game have more then 1 data type?
    if (gameMappings.length < 2) {
      return true;
    
    // Is the [position] check box selected?
    } else if (_.contains(checkedActions, 'position')){
      return true
    
    // Otherwise, don't show positions
    } else {
      return false
    };
}

// Filters out the positions of a raw data array
function filterPositions (dataset){
  // Seperate data to positions and actions
    var data = {
      positions : [],
      actions : [],
    };

    data.positions = _.filter(dataset, function(d){

      // Do we not have an action key?
      return !d.action;
    });

    // Get list of actions
    data.actions = _.filter(dataset, function(d){

      // Do we have an action key?
      return d.action;
    });

    return data;
}
