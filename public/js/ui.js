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

/************************************
          Setup Page
************************************/

// Initialize the User Interface
UI.initialize = function(){
    
    /***************************
         Default Settings
    ****************************/

    UI.setGame("Fallout New Vegas");
    UI.setMap(settings.map = maps[0].name);

    /***************************
         Watch form Values
    ****************************/

    $('#select-game').on('change', function(){
      var selected = $(this).find("option:selected").val();
      UI.setGame(selected);
    });

    $('#select-map').on('change', function(){
      var selected = $(this).find("option:selected").val();
      UI.setMap(selected);
    });

    /***************************
          Setup Map
    ****************************/

    // Given map size, and scale factor,
    // determin the latitude/longitude bounds.
    var latitudeDistance = settings.map.height / settings.scale;
    var longitudeDistance = settings.map.width / settings.scale;

    // Set Map Center
    map.setView([latitudeDistance / 2, longitudeDistance / 2], 1);
    
    /***************************
       Initialize UI Options
    ****************************/

    UI.addImageOverlay();
    UI.addImageOverlay();
    UI.addHeatmapToggle();
    UI.addToggleAbleSideNavigation();
    UI.addLeafletDraw();
}

/************************************
      Setup: Help Functions
************************************/

UI.addImageOverlay = function(){

    // Given map size, and scale factor,
    // determin the latitude/longitude bounds.
    var latitudeDistance = settings.map.height / settings.scale;
    var longitudeDistance = settings.map.width / settings.scale;

    // Note: Lat/Long is represented as [Latitude (y), Longitude (x)].
    // Take care when converting from cartesian points, to lat/long.        
    var imageBounds = [[0, 0], [latitudeDistance, longitudeDistance]];

    // Add image overlay to map
    L.imageOverlay('img/maps/' + settings.map.url, imageBounds).addTo(map);

}

UI.addHeatmapToggle = function(){

    // Show/Hide Heatmap
    $('#toggle_heatmap').change(function(e) {
      
      // Enable
      if ($('#toggle_heatmap').is(':checked')) {
        Heatmap.addHeatmap(settings.data);
      
      //  Disable
      } else {
        map.removeLayer(Heatmap.heatmapLayer)
      }
    });
}

// Initialize toggle-able side nav
UI.addToggleAbleSideNavigation = function(){

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
}

// Implement Leaflet Draw for creating
// shapes on the map
UI.addLeafletDraw = function(){

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

/************************************
         Update Functions
************************************/

// When user selects a new game
UI.setGame = function(gamename){

    // Save game name
    settings.game = gamename;

    // Reset map
    settings.map = null;

    // Clear List
    $("#select-game").children().remove();

    // Populate Games Pulldown
    _.each(games, function(game) {
        var option  = $("<option />").val(game).text(game);
        
        if (settings.game == game){
          option.attr('selected', 'selected')
        };

        $("#select-game").append(option);

    });

    // Populate Map Pulldown
    var game_maps = _.where(maps, { game : settings.game });

    // Clear List
    $("#select-map").children().remove();

    // Update game options in pulldown
    _.each(game_maps, function(map) { 
        $("#select-map").append($("<option />").val(map.name).text(map.name));
    });

}

// When user selects a new map
UI.setMap = function(mapname){
  
  // Find map data
  settings.map = _.findWhere(maps, { name : mapname });


}

UI.debug = function(){
  console.log("Game : " + settings.game + " | Map : " + settings.map.name);

}