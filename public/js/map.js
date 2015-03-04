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