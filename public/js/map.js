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

// Create lines between player locations
MAP.polylineData = function(data){

	// Group data by PlayerID
	var players = _.groupBy(data, 'playerID');
	
	// Keep track of current index
	var count = 0;

	// Create a polyline for each unique playerID
	_.each(players, function(player){

		// Create list of latLng ojects
		var latLngs = _.map(player, function(point){
			return MAP.toLatLng(point);
		});

		var options = {
			color: MAP.getColor(count++),
			opacity: 1,
			weight: 2,
		}

		// Create polyline
		var polyline = L.polyline(latLngs, options)

		// Add polyline to map
		polyline.addTo(map);

		// Limit
		map.fitBounds(polyline.getBounds());
	});
}

// Convert the JSON Object to a leaflet LatLong object
MAP.toLatLng = function(point){

	// Extract keys. May be 'latitude' or 'lat'.
	var lat  = (point.latitude)  ? point.latitude  : point.lat;

	// Extract keys. May be 'longitude' or 'long'.
	var long = (point.longitude) ? point.longitude : point.long;

	if (lat && long) {
		return L.latLng(lat, long);
	}
};

// Adds a marker at the provided location
MAP.addMarker = function(lat, long, title){
	var title = (title) ? title : "";
	L.marker([lat, long], {title : title}).addTo(map);
}

// Debug: Show image borders
// MAP.addMarker(latitudeDistance,longitudeDistance, "Top Right + " + latitudeDistance + " , " + longitudeDistance);
// MAP.addMarker(0,0, "Bottom Left Location [0,0]");

MAP.getData = function(){

	UI.loading(true, "Loading Data....");

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
	    // MAP.plotData(data);

	    // Add Lines to map
	    MAP.polylineData(data);

	    UI.loading(false, "Success. " + data.length + " points loaded.");
    })
};


// Export currently active data set
// as a .csv file.

// http://jsfiddle.net/sturtevant/vUnF9/
// http://stackoverflow.com/a/4130939/317

MAP.exportCSV = function(){
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

MAP.getColor = function(i){
	
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