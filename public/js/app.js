
/************************************
              app.js   
************************************/

// Settings
var settings = {

  	// Save data
  	data : null,

  	// enable heatmap
  	heatmap : true,

    // Global scale factor.
    // Helps to max points (ranging from -10,000 to 10,000)
    // to their coordinate points on a geo projection.
    scale : 100,

    // Target API URL
    API_url : (window.location.href.indexOf("herokuapp.com") > -1) ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/",

    // Current Game
    game : null,

    // Current Map
    map : null,

    // {

    //   // Save map configuration
    //   url: "/fallout/intro.png",
    //   name: "Position_introhouse",
    //   title: "",
    //   width : 1600,
    //   height : 1178,

    //   // Map player locations to their points
    //   // on the map. Manually offset for accuracy.
    //   // Multiplied to base
    //   offset : {
    //     x : 650,
    //     y : 550,
    //   },

    //   // Map player locations to their points
    //   // on the map. Manually scale for accuracy.
    //   // added to base
    //   scale : {
    //     x : 0.45,
    //     y : 0.45,
    //   }
    // },
  };


/************************************
       UI Functions
************************************/

// Use Hubspot's Messenger plugin to
// provide text/popup feedback to the user.
// http://github.hubspot.com/messenger/docs/welcome/

Messenger.options = {
  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
  theme: 'air'
}

// Provide user feedback with the interface
var UI = {

	// Store reference to loading indicator
	loader : {},
};

// Alert the user with a message.
// (optional) provide ID for singleton box
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

// Show success message
UI.success = function(msg){
	return Messenger().post({
		message : msg,
		type: "success",
	});
}

// Show/hide a loading indicator.
UI.loading = function(boolean, msg){
	
	// Show loading box
	if (boolean){
		UI.loader = Messenger().post({
			type: "type-loading",
			message : (msg) ? msg : "Loading...",
			id : "loading",
			hideAfter: null,
		});

		return UI.loader;

	} else {

		// Hide loading box. 
		UI.loader.hide();
		
		// Add success message.
		return Messenger().post({
			type: "success",
			message : (msg) ? msg : "Loading Complete",
			id : "loading",
			hideAfter: 3,
		});
	}
};


UI.initialize = function(){

    // Populate Games Pulldown
    _.each(games, function(game) {
        $("#select-game").append($("<option />").val(game).text(game));
    });

    settings.game = "Fallout New Vegas";

    settings.map = maps[0];

    // Given map size, and scale factor,
    // determin the latitude/longitude bounds.
    var latitudeDistance = settings.map.height / settings.scale;
    var longitudeDistance = settings.map.width / settings.scale;

    // Define center of map
    var mapCenter = [latitudeDistance / 2, longitudeDistance / 2];

    map.setView(mapCenter, 1);

    // Note: Lat/Long is represented as [Latitude (y), Longitude (x)].
    // Take care when converting from cartesian points, to lat/long.        
    var imageBounds = [[0, 0], [latitudeDistance, longitudeDistance]];

    // Add image overlay to map
    L.imageOverlay('img/maps/' + settings.map.url, imageBounds).addTo(map);

    /***************************
       Setup UI / Side Options
    ****************************/

    var SideOptionsToggle = L.Control.extend({
      
      options: { position: 'topleft' },

      // Create a button for toggling left nav
      onAdd: function (map) {
        
        // create the control container with a particular class name
        var button = L.DomUtil.create('div', 'toggle-side-options leaflet-control leaflet-bar');
        var icon = L.DomUtil.create('i', 'fa fa-bars', button);

        // Add Listener
        L.DomEvent.addListener(button, 'click', function(){
          $("#wrapper").toggleClass("toggled");
        });

        return button;
      }
    });

    map.addControl(new SideOptionsToggle());

    // Toggle Side Options Meny
    $("#toggle-menu").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });

    // Show/Hide Heatmap
    $('#toggle_heatmap').change(function(e) {
      
      // Enable
      if ($('#toggle_heatmap').is(':checked')) {
        MAP.addHeatmap(settings.data);
      
      //  Disable
      } else {
        map.removeLayer(MAP.heatmapLayer)
      }
    });

    /***************************
       Initialize Leaflet.draw
       Enables shape creation/selection
       https://github.com/Leaflet/Leaflet.draw#using
    ****************************/

    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();

    // Initialize empty player
    map.addLayer(drawnItems);

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
        
        // Disable certain shapes
        draw : {circle: false, polyline: false, marker: false,},

        // Define layer
        edit: { featureGroup: drawnItems }
    });

    // Add Drawing Tools
    map.addControl(drawControl);

    // Listen for draw actions
    map.on('draw:created', function(e) {

        var type = e.layerType,
            layer = e.layer;

        drawnItems.addLayer(e.layer);

        if (type === 'polygon') {
          console.log(e)
        }

        if (type === 'rectangle') {
          console.log(e)
        }
    });

}