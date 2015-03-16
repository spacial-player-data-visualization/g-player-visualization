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

// Use Hubspot's Messenger plugin to
// provide text/popup feedback to the user.
var UI = {

	// Store reference to loading indicator
	loader : {},
};

// Alert via Hubspot Messenger
//   (string) msg - 
//   (string) id  - if you want to update existing
UI.alert = function(msg, id){
	return Messenger().post({
		message : msg,
		id : (id) ? id : Math.random(1,100),
	});
}

// Show error message
UI.error = function(msg){
	return Messenger().post({
  		message: msg,
  		type: 'error',
  		showCloseButton: true
	});
};

UI.success = function(msg){
	return Messenger().post({
		message : msg,
		type: "success",
	});
}

UI.loading = function(boolean){

	if (boolean){
		UI.loader = Messenger().post({
			type: "type-loading",
			message : "Loading...",
			id : "loading",
			hideAfter: null,
		});

		return UI.loader;

	} else {

		UI.loader.hide();
		
		return Messenger().post({
			type: "success",
			message : "Loading Complete",
			id : "loading",
			hideAfter: 3,
		});
	}

	// if (boolean){
	// 	UI.alert("Loading.....", "loader");	
	// } else {
	// 	UI.alert("Loading Complete.", "loader");
	// }	
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