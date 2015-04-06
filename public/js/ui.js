/************************************
         UI Functions
************************************/

// Provide user feedback with the interface
var UI = {

	// Store reference to loading indicator
	loader : {},
};

UI.menu = function(){
  $.get('templates/menu.tpl.html', function(result){
    bootbox.alert(result);
  });
}


/************************************
          Setup Page
************************************/

// Initialize the User Interface
UI.initialize = function(){
    
    // Default Settings
    UI.setGame(settings.game);
    
    /***************************
       Initialize UI Options
    ****************************/

    UI.addToggleAbleSideNavigation();
    // UI.addLeafletDraw();
}

/************************************
      Setup: Help Functions
************************************/

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

    // Clear List
    $("#select-game").children().remove();

    // Populate Games Pulldown
    _.each(options.games, function(game) {
        var option  = $("<option />").val(game).text(game);
        
        if (settings.game == game){
          option.attr('selected', 'selected')
        };

        $("#select-game").append(option);

    });

    // Available maps
    var game_maps = _.where(options.maps, { game : settings.game });
    
    // Clear data
    settings.data = null;
    
    // Remove previous data
    Visualizer.clear();

    // Reset map
    UI.setMap(game_maps[0].name);

    // Clear List
    $("#select-map").children().remove();

    // Update game options in pulldown
    _.each(game_maps, function(map) { 

        var option = $("<option />").val(map.name).text(map.name);

        if (settings.map && settings.map.name == map.name){
          option.attr('selected', 'selected')
        };

        $("#select-map").append(option);
    });

    // Change available actions
    UI.getActions();
    UI.getPlayers();
}

// When user selects a new map
UI.setMap = function(mapname, callback){

  // Clear previous map
  if (settings.overlay){
    map.removeLayer(settings.overlay);  
  }

  // Find chosen map data
  settings.map = _.findWhere(options.maps, { name : mapname });

  // Temp representing map
  var m = settings.map

  // Alert user if no suitable map found
  if (!settings.map){ alert("Unable to Find Suitable Map Data"); }

  var bottomLeft = Visualizer.formatData({
    posY : m.bottom,
    posX : m.left
  })

  var topRight = Visualizer.formatData({
    posY : m.top,
    posX : m.right
  })

  // Note: Lat/Long is represented as [Latitude (y), Longitude (x)].
  // Take care when converting from cartesian points, to lat/long.        
  
  var imageBounds = [[bottomLeft['latitude'], bottomLeft['longitude']], 
                     [topRight['latitude'],   topRight['longitude']]];

  // Visualizer.addMarker(bottomLeft['latitude'], bottomLeft['longitude']);
  // Visualizer.addMarker(topRight['latitude'],   topRight['longitude']);

  // Add image overlay to map
  settings.overlay = L.imageOverlay(m.imageURL, imageBounds)

  settings.overlay.addTo(map);

  map.fitBounds(imageBounds);

  // Default callback is to load the data set.
  // Execute provided callback otherwise
  (callback) ? callback() : Visualizer.loadData();
}

UI.moveMap = function(xOffset, yOffset){
  // 
  var m = _.findWhere(options.maps, { name : settings.map.name });
  var index = options.maps.indexOf(m);

  // 
  options.maps[index].left = m.left + xOffset;
  options.maps[index].right = m.right + xOffset;
  options.maps[index].top = m.top + yOffset;
  options.maps[index].bottom = m.bottom + yOffset;

  UI.setMap(m.name, function(){ console.log(settings.map); });

}

UI.scaleMap = function(scale){

  var m = _.findWhere(options.maps, { name : settings.map.name });
  var index = options.maps.indexOf(m);

  // 
  var width  = m.right - m.left;
  var height = m.top - m.bottom;
  
  // 
  var xScale = .01 * width  * scale;
  var yScale = .01 * height * scale;

  // 
  options.maps[index].left = m.left   - xScale;
  options.maps[index].right = m.right + xScale;
  
  options.maps[index].bottom = m.bottom - yScale;
  options.maps[index].top = m.top + yScale;

  // console.log(options.maps[index]);
  UI.setMap(m.name, function(){ console.log(settings.map); });
};

UI.getActions = function(callback){
    
    // Get current game/map
    var options = Visualizer.getContext();

    // Get actions from API
    $.get(Visualizer.API_url + "actions", options, function(data){
        options.actions = data;

        // Clear old list of actions
        $(".action-select").children().remove();

        // Add new list of actions
        _.each(options.actions, function(action){
            var option  = $("<option />").val(action).text(action);
            $(".action-select").append(option);
        })
    })

}

// For the currently selected actions, 
// get a list of playerIDs
UI.getPlayers = function(callback){

    var opts = Visualizer.getContext();

    // Get actions from API
    $.get(Visualizer.API_url + "players", opts, function(data){
        
        settings.players = data;

        console.log(settings.players)

        UI.listPlayers();

        if (callback) callback();
    })

}

// Render an HTML list of available players
UI.listPlayers = function(){
  
  // Grab current list of playerIDs
  var players = settings.players;

  // Clear previous player list
  $('#player-list').html("");

  _.each(players, function(p){

    // Create table row with player data
    var tr = '<td>' + "Player <b>" + p + '</b></td>';
    tr += '<td>' +  'checbox' + '</td>';
    tr += '<td>' +  '<a onclick="UI.showPlayerData(' + p + ')"><i class="fa fa-plus"></i></a>' + '</td>';


    // Add options buttons
    // tr += '<td><button class="btn btn-primary"><i class="fa fa-plus"></i></button></td>';

    $('#player-list').append("<tr>" + tr + "</tr>");
  })
}

UI.showPlayerData = function(playerID){
  var data = _.filter(settings.data, { playerID : playerID });
  var data = _.map(data, function(d){
    return convertJSONtoHTML(d);
  })

  var data = _.reduce(data, function(memo, num){ 
    return memo + num + "<hr>"; 
  }, 0);

  bootbox.alert(data);
}

UI.debug = function(){
  console.log("Game : " + settings.game + " | Map : " + settings.map.name);
}


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


// Use Hubspot's Messenger plugin to
// provide text/popup feedback to the user.
// http://github.hubspot.com/messenger/docs/welcome/

Messenger.options = {
  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
  theme: 'air'
}