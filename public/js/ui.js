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
      Setup UI / Side Options
************************************/

// Initialize toggle-able side nav
UI.addToggleAbleSideNavigation = function(){

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

/************************************
         Game Functions
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
    UI.getListOfAvailablePlayerIDs();
    UI.filters.create();
}

/************************************
         Map Functions
************************************/

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
  
  // Get map data from settings
  var m = _.findWhere(options.maps, { name : settings.map.name });
  var index = options.maps.indexOf(m);

  // Adjust coordinates for map
  options.maps[index].left = m.left + xOffset;
  options.maps[index].right = m.right + xOffset;
  options.maps[index].top = m.top + yOffset;
  options.maps[index].bottom = m.bottom + yOffset;

  UI.setMap(m.name, function(){ console.log(settings.map); });

}

UI.scaleMap = function(scale){

  // Get map data from settings
  var m = _.findWhere(options.maps, { name : settings.map.name });
  var index = options.maps.indexOf(m);

  // Adjust coordinates for map
  var width  = m.right - m.left;
  var height = m.top - m.bottom;
  
  // Generate the scale multiplier
  var xScale = .01 * width  * scale;
  var yScale = .01 * height * scale;

  // Adjust scaling for map
  options.maps[index].left = m.left   - xScale;
  options.maps[index].right = m.right + xScale;
  
  options.maps[index].bottom = m.bottom - yScale;
  options.maps[index].top = m.top + yScale;

  // Update Map
  UI.setMap(m.name, function(){ console.log(settings.map); });
};

/************************************
         Actions
************************************/

UI.getActions = function(callback){
    
    // Get current game/map
    var options = Visualizer.getContext();

    // Get actions from API
    $.get(Visualizer.API_url + "actions", options, function(data){

        // Clear old list of actions
        $(".action-select").children().remove();

        // Add new list of actions
        _.each(data, function(action){
            var option  = $("<option />").val(action).text(action);
            $(".action-select").append(option);
        })
    })

}

/************************************
          Players
************************************/

// Manage the players being represented
// on the visualizer.
UI.players = {};

UI.players.addPlayer = function(playerID){

  // Prevent Duplicates
  var existing = _.findWhere(settings.players, { playerID : playerID })

  if (existing) {
    alert("Player " + playerID + " Already Selected");
    return;
  };

  var colors = ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"];

  var color_radio_buttons = _.reduce(colors, function(memo, color){ 
    return memo + '<label class="radio"><input type="radio" name="group1" value="' + color + '" checked><i class="fa fa-square" style="color: ' + color + '"></i></label>';
  }, "");

  bootbox.dialog({
    message: '<div class="color-select">' + color_radio_buttons + '</div>',
    title: "Adding Player " + playerID,
    
    buttons: {
      success: {
        label: "Cancel",
        className: "btn-default",
        callback: function() {}
      },
      main: {
        label: "Add Player",
        className: "btn-primary",
        callback: function() {
          var color =  $('.color-select input[type=radio]:checked').val();
          if (!color) { color : "#000" };
          
          UI.players.add(playerID, color);
        }
      }
    }
  });
}

// Add a new player ID to the map.
UI.players.add = function(playerID, color){
  
    // Add to list
    settings.players.push({ 
      playerID : playerID, 
      color : color 
    });

    console.log(settings.players)

    UI.players.buildUI();    

}

UI.players.remove = function(playerID){

  settings.players = _.filter(settings.players, function(player){
    return player.playerID != playerID;
  });

  UI.players.buildUI();

}

// Return list of player IDs
UI.players.listIDs = function(){  
  return _.pluck(settings.players, 'playerID')
};

UI.players.buildUI = function(){
  $("#active-players").html("");

  _.each(settings.players, function(player){

    var a = '<i class="fa fa-square" style="color: ' + '#f00' + '"></i>';
    var b = '<i class="fa fa-trash-o" onclick="UI.players.remove(' + player.playerID + ')"></i>';
    var c = player.playerID;

    $("#active-players").append("<p>" + a + b + c + "</p>");
  })

}

// For the currently selected actions, 
// get a list of playerIDs
UI.getListOfAvailablePlayerIDs = function(callback){

    var opts = Visualizer.getContext();

    // Get actions from API
    $.get(Visualizer.API_url + "players", opts, function(data){
        
        var players = data;
        
        // Clear previous player list
        $('#available-players').html("");

        // Render players from database to 
        // table on left menu
        _.each(players, function(p){

          // Create table row with player data
          var tr = ""
          tr += '<td>' + '<a onclick="UI.showPlayerData(' + p + ')"><i class="fa fa-code"></i></a>' + '</td>';
          tr += '<td>' + "Player <b>" + p + '</b></td>';
          // tr += '<td>' +  '<input type="checkbox" id="toggle_user user-"' + p +  '></td>';
          tr += '<td>' + '<a onclick="UI.players.addPlayer(' + p + ')"><i class="fa fa-plus" style="font-size:20px;"></i></a>' + '</td>';
          
          // Add options buttons
          // tr += '<td><button class="btn btn-primary"><i class="fa fa-plus"></i></button></td>';

          $('#available-players').append("<tr>" + tr + "</tr>");
        })

        if (callback) callback();
    })

}

UI.showPlayerData = function(playerID){

  var opts = Visualizer.getContext();

  // Get specific player
  opts.players = [playerID];

  // Data from API
  $.get(Visualizer.API_url + "entries", opts, function(data){

    // Show to developers
    console.log(data);
    
    var data = _.map(data, function(d){
      return convertJSONtoHTML(d);
    })
    
    var data = _.reduce(data, function(memo, num){ 
      return memo + num + "<hr>"; 
    }, 0);

    // Show as massive string
    bootbox.alert(data);
  });
}

/************************************
         Filters
************************************/

UI.filters = {};

// Create list of checboxes in order
// to filter a set of actions
UI.filters.create = function(){

  // Get list of this game's mappings
  var mappings = _.filter(options.mappings, { game : settings.game });

  // Clear filters list
  $("#filters").html("");

  _.each(mappings, function(mapping){

      var html = UI.filters.addFilter(mapping);
      $("#filters").append(html);

  })

  return true;
}

// Create a new checkbox
UI.filters.addFilter = function(mapping){

  var a = '<div class="checkbox"><label>';
  var b = '<input type="checkbox" id="toggle_paths" value="' + mapping.type + '" checked>' + mapping.type;
  var c = '</label></div>';

  return a + b + c
}

// Return list of selected data
UI.filters.get = function(){

  var acc = [];

  // Enabled check boxes
  $('#filters input:checkbox:checked').each(function(index, checkbox){
    acc.push(checkbox["value"]);
  })

  return acc;
}

// Support UI element for Check All / None.
UI.filters.toggleAll = function(checked){
  
  // Select All
  if (checked) {
    $('#filters input:checkbox').prop('checked', true);

  // Select None
  } else {
    $('#filters input:checkbox').removeAttr('checked');
  }
  
}

/************************************
         Helpers
************************************/

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