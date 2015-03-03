
/************************************
              app.js   
************************************/

// Global Variables & Utility Functions

// Available Keys, and their index in
// the .csv array.

var keyMapping = {
	area      : 0, // (string) * 
	playerID  : 1, // (int)    * 
	timestamp : 2, // (double) * 
	posX      : 3, // (double) *
	posY      : 4, // (double) *
	cameraX   : 6, // (double)
	cameraY   : 7, // (double)
} // * required

var environment = document.URL;

var API = {
	
  // Target API. Set depending on environment
  url : (window.location.href.indexOf("herokuapp.com") > -1) ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/",
};


/************************************
         Mapping Logic
 ************************************/

var MAP = {};

// Add the provided data to the map.
MAP.plotData = function(data){

	var radius = 10;

	_.each(data, function(p){
		var circle = L.circle([p.latitude, p.longitude], radius, {
			color: 'black',
			fillColor: '#fff',
			fillOpacity: 1,
		}).addTo(map);
	});
}

// Adds a marker at the provided location
MAP.addMarker = function(lat, long, title){
	var title = (title) ? title : "";
	L.marker([lat, long], {title : title}).addTo(map);
}

// Debug: Show image borders
// MAP.addMarker(latitudeDistance,longitudeDistance, "Top Right + " + latitudeDistance + " , " + longitudeDistance);
// MAP.addMarker(0,0, "Bottom Left Location [0,0]");

MAP.getData = function(){

	$("#loading").show();

	// Hit API
	$.get(API.url + "entries", function(data){

		var offset = settings.map.offset;
		var scale = settings.map.scale;

	    // Validate data. Ignore NPC interactions, etc
	    // @TODO: Temp data fix. Replaced by proper
	    // API and data validation.
	    data = _.filter(data, function(p){
	    	return p.posX && p.posY;
	    })

	    // SETUP DATA
	    // Convert data points into plottable data
	    data = _.map(data, function(p){
	    	return { 
  
	          // Create a latitude & longitude field.
	          // Maps the (x,y) position to a coordinate
	          // on the earth. Makes plotting MUCH easier
  
	          latitude  : ((p.posY + offset.y) * scale.y) / settings.scale,
	          longitude : ((p.posX + offset.x) * scale.x) / settings.scale, 
  
	          // Preserve Object
	          area : p.area,
	          playerID : p.playerID,
	          timestamp : p.timestamp,
	          cameraX : p.cameraX,
	          cameraY : p.cameraY
	      }
		})

		// Save data for future reference
		settings.data = data;

	        // Add points to map
	    MAP.plotData(data);

	    $("#loading").hide();
    })
};

/************************************
       Heatmap Logic
************************************/

// http://www.patrick-wied.at/static/heatmapjs/
MAP.heatmapLayer = new HeatmapOverlay({
	"radius": .5,
	"maxOpacity": .8,
	"scaleRadius": true, 
	"useLocalExtrema": false,
	latField: 'latitude',
	lngField: 'longitude',
});


MAP.addHeatmap = function(data){

	var heatmapData = { 
	    max: 1,  // No idea what this does
	    data: data,
	};

	map.addLayer(MAP.heatmapLayer)
	MAP.heatmapLayer.setData(heatmapData);
}

/************************************
       Utility Functions
************************************/

var loading = {};

// UI Feedback Indicator
loading.start = function(){
	$("#loading").text("Loading...");
};

// UI Feedback Indicator
loading.end = function(){
	$("#loading").text("");
};

DOM = {};

// Provide User Feedback in the Document
DOM.log = function(msg){
	$("#log").prepend("<p>" + msg + "</p>");
}

/*
$(function() {
	QueryBuilder.open();
}); */
