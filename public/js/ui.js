/*
ui.js
G-Player Data Visualization

- gives functionality to the main UI (homepage)
- loads all sidebars and menus
- handles game and map selections
- manipulates map (move and scale)
- allows selection of players and colors for players
- filtering of dataset by actions 
- status messages in lower right corner

Authors:
Alex Johnson @alexjohnson505

Created: 
March 29, 2015
*/

/************************************
         UI Functions
************************************/

// Provide user feedback with the interface
var UI = {

	// Store reference to loading indicator
	loader : {},

};

// purpose: retrieves the html for the menu
UI.menu = function(){
  $.get('templates/menu.tpl.html', function(result){
    bootbox.alert(result);
  });
}

/************************************
      Setup UI / Side Options
************************************/

// purpose: initialize toggle-able side nav
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

// purpose: handles user selection of a new game
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

// purpose: hanldes user selection of a new map
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

  // position of bottom left corner
  var bottomLeft = Visualizer.formatData({
    posY : m.bottom,
    posX : m.left
  })

  // position of top right corner
  var topRight = Visualizer.formatData({
    posY : m.top,
    posX : m.right
  })

  // Note: Lat/Long is represented as [Latitude (y), Longitude (x)].
  // Take care when converting from cartesian points, to lat/long.        
  var imageBounds = [[bottomLeft['latitude'], bottomLeft['longitude']], 
                     [topRight['latitude'],   topRight['longitude']]];

  // Add image overlay to map
  settings.overlay = L.imageOverlay(m.imageURL, imageBounds)

  settings.overlay.addTo(map);

  map.fitBounds(imageBounds);

  // Default callback is to load the data set.
  // Execute provided callback otherwise
  (callback) ? callback() : Visualizer.loadData();
}

// purpose: handles moving map using left, right, top and bottom movements
UI.moveMap = function(xOffset, yOffset){
  
  // Get map data from settings
  var m = _.findWhere(options.maps, { name : settings.map.name });
  var index = options.maps.indexOf(m);

  // Adjust coordinates for map
  options.maps[index].left = m.left + xOffset;
  options.maps[index].right = m.right + xOffset;
  options.maps[index].top = m.top + yOffset;
  options.maps[index].bottom = m.bottom + yOffset;

  // produces the coordinates of current map
  UI.setMap(m.name, function(){ console.log(settings.map); });

}

// purpose: handles manipulating map using expand or contract selections
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

// purpose: grabs all available actions in dataset for use for filtering
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

// purpose: plots selected playerID onto map from left menu
UI.players.addPlayer = function(playerID){

  // Prevent Duplicates
  var existing = _.findWhere(settings.players, { playerID : playerID })

  if (existing) {
    alert("Player " + playerID + " Already Selected");
    return;
  };

  // array of colors for color selection for each player 
  var colors = ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"];

  // dialog for selection of color for selected player
  var color_radio_buttons = _.reduce(colors, function(memo, color){ 
    return memo + '<label class="radio"><input type="radio" name="group1" value="' + color + '" checked><i class="fa fa-square" style="color: ' + color + '"></i></label>';
  }, "");

  bootbox.dialog({
    message: '<div class="color-select">' + color_radio_buttons + '</div>',
    title: "Select Color for Player " + playerID,
    
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

// purpose: add a new player ID to the map with associated color
UI.players.add = function(playerID, color){
  
    // Add to list
    settings.players.push({ 
      playerID : playerID, 
      color : color 
    });

    UI.players.refreshMap();    
}

// purpose: remove selected playerID from the map
UI.players.remove = function(playerID){

  settings.players = _.filter(settings.players, function(player){
    return player.playerID != playerID;
  });

  Visualizer.clear();
  UI.players.refreshMap();

}

// purpose: return list of player IDs onto right menu
UI.players.listIDs = function(){  
  return _.pluck(settings.players, 'playerID')
};

// purpose: helper function that refreshes map on a change
UI.players.refreshMap = function(){
  $("#active-players").html("");

  _.each(settings.players, function(player){

    var a = '<i class="fa fa-square" style="color: ' + player.color + '"></i>';
    var b = '<i class="fa fa-trash-o" onclick="UI.players.remove(' + player.playerID + ')"></i>';
    var c = player.playerID;

    $("#active-players").append("<p>" + a + b + c + "</p>");
  })

  Visualizer.loadData();
}

// purpose: for the currently selected actions, get a list of playerIDs
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
          tr += '<td>' + '<a onclick="UI.players.addPlayer(' + p + ')"><i class="fa fa-plus" style="font-size:20px;"></i></a>' + '</td>';

          $('#available-players').append("<tr>" + tr + "</tr>");
        })

        if (callback) callback();
    })

}

// purpose: pops up complete view of selected playerID's data
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

// purpose: create list of checkboxes in order to filter a set of actions
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

// purpose: support UI element for Check All / None
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

// purpose: alert the user with a status message in lower right corner
// (optional) provide ID for singleton box
UI.alert = function(msg, id){
  return Messenger().post({
    message : msg,
    id : (id) ? id : Math.random(1,100),
  });
}

// purpose: show error message
UI.error = function(msg){
  return Messenger().post({
      message: msg,
      type: 'error',
      showCloseButton: true
  });
};

// purpose: show success message
UI.success = function(msg){
  return Messenger().post({
    message : msg,
    type: "success",
  });
}

// purpose: show/hide a loading indicator
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