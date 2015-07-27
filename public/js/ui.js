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
Alex Gimmi @ibroadband

Created: 
March 29, 2015
*/

/************************************
         Game Functions
************************************/

// Provide user feedback with the interface
var UI = {};

/* 
name: setGame
author: Alex Johnson
created: March 29, 2015
purpose: handles user selection of a new game
argument: gamename is the game (ex: Fallout or Game Gaze)
*/
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
    if (game_maps && game_maps[0]){

        UI.setMap(game_maps[0].name);  
    } else {
      
        UI.error("Unable to load Map Data");
    }
    
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
/* 
name: setMap
author: Alex Johnson
created: March 29, 2015
purpose: hanldes user selection of a new map
arguments: mapname is the map area used , callback is a call
*/
UI.setMap = function(mapname, callback){

  // Clear previous map
  if (settings.overlay){
    map.removeLayer(settings.overlay);  
  }

  // Find chosen map data
  settings.map = _.findWhere(options.maps, { name : mapname });


  // Temp representing map
  var m = settings.map;

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

// Save the edited map to the database
UI.saveMap = function(){

    var map = settings.map;

    // Update current map in API
    $.ajax({
      url: Visualizer.API_url + "maps/" + map._id,
      type: 'PUT',
      success: success,
      data: map,
    });

    function success(resp){
        if (!resp) UI.error("Error saving map")
              
        $('#save-map').hide();

        alert("Map changes have been saved. Your changes will now " +
              "persists when you reload or return to this website.");        
    }
}

/* 
name: moveMap
author: Alex Johnson
created: March 29, 2015
purpose: handles moving map using left, right, top and bottom movements
arguments: xOffset is the left to right offset of coordinates
yoffset is the bottom to top offset of coordinates
*/
UI.moveMap = function(xOffset, yOffset){

  $('#save-map').show();
  
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

/* 
name: scaleMap
author: Alex Johnson
created: March 29, 2015
purpose: handles manipulating map using expand or contract selections
arguments: scale is the factor of scaling
*/
UI.scaleMap = function(scale){

  $('#save-map').show();

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

/* 
name: getActions
author: Alex Johnson
created: March 29, 2015
purpose: grabs all available actions in dataset for use for filtering
arguments: callback is some action call
*/
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

/* 
name: addPlayer
author: Alex Johnson
created: March 29, 2015
purpose: Manage the players being represented on the visualizer
arguments: playerID is the selected player 
*/
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

  var message = '<div class="color-select">' + color_radio_buttons + '</div>';

  bootbox.dialog({
    message: message,
    title: "Select Color for Player " + playerID,
    
    // Options available to the user
    buttons: {
      
      // Hide the modal
      success: {
        label: 'Cancel',
        className: "btn-default",
        callback: function() {}
      },

      // Preview Data
      danger: {
        label: '<i class="fa fa-table"></i> Preview Data',
        className: "btn-default",
        callback: function() {

            var msg = "You are about to load and preview" + 
                "the raw data for player" + playerID + ". This " + 
                "will show the data for all actions and " +
                "positions of the selected player. Would you " +
                "like to limit the data to ignore positions, " +
                "and only show action/event data points?";

            // Load player data. 
            // should we limit the data to actions?
            UI.showPlayerData(playerID, confirm(msg))
        }
      },

      // Add player to the map
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

// Add multiple players at once. 
UI.players.addPlayers = function(){

  // Confirm that user wants to load a large data set
  if (!confirm('Warning! Loading all players in the current list may load a considerable amount of data. This request could take time to process, and may cause your map to become slow or unresponsive. If you haven\'t already, we recommend selecting a lower "fidelity" from the left menu in order to reduce the amount of positions per second being returned. Are you sure you want to continue?')) return;

  UI.getListOfAvailablePlayerIDs(function(playerIDs){

    _.each(playerIDs, function(playerID){

        // Add to list
        settings.players.push({ playerID : playerID, color : "#000"});
    })

    UI.players.refreshMap();
  })
}

// Add a new player ID to the map.
UI.players.add = function(playerID, color){

    // Add to list
    settings.players.push({ playerID : playerID, color : color });
    
    // Update map
    UI.players.refreshMap();    
}

// purpose: remove selected playerID from the map
UI.players.remove = function(playerID){

  settings.players = _.filter(settings.players, function(player){
    return player.playerID != playerID;
  });

  // Remove all data
  Visualizer.clear();

  // Re-plot map
  UI.players.refreshMap();

}

// Return list of player IDs
UI.players.listIDs = function(){
  
  // Create list of IDs
  var ids = _.pluck(settings.players, 'playerID');
  
  // Handle empty case
  if (!ids) { ids = []; } 

  // Return IDs
  return ids;
};

/* 
name: refreshMap
author: Alex Johnson
created: March 29, 2015
purpose: helper function that refreshes map on a change
*/
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

/* 
name: getListOfAvailablePlayerIDs
author: Alex Johnson
created: March 29, 2015
purpose: for the currently selected actions, get a list of playerIDs
argument: callback is some call
*/
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
          var tr = '<tr><td onclick="UI.players.addPlayer(' + p + ')">' + 
                   "Player <b>" + p + '</b></td>' +
                  '<td onclick="UI.players.addPlayer(' + p + ')">' +
                   '<i class="fa fa-sign-in"></i></td></tr>';

          $('#available-players').append(tr);
        })

        if (callback) callback(data);
    })

}

/* 
name: showPlayerData
author: Alex Johnson
created: March 29, 2015
purpose: pops up complete view of selected playerID's data
argument: playerID is current player, actionsOnly is a boolean
     representing if we should filter out positions
*/
UI.showPlayerData = function(playerID, actionsOnly){

  UI.loading(true);

  var opts = Visualizer.getContext();

  // Get specific player
  opts.playerIDs = [playerID];

  // Data from API
  $.get(Visualizer.API_url + "entries", opts, function(data){

    // Show to developers
    console.log(data);

    // Only show actions
    if (actionsOnly) {
      data = _.filter(data, function(p){
        return p.action;
      })
    }

    data = _.sortBy(data, 'timestamp');
    
    var output = _.map(data, function(d){
      return convertJSONtoHTML(d);
    })
    
    output = _.reduce(output, function(memo, num){ 
      return memo + num + "<hr>"; 
    }, 0);

    UI.loading(false);

    var selectedData = (actionsOnly) ? "Actions" : "Data Points";
    UI.alert("Showing " + data.length + " " + selectedData);
    
    // Show as massive string
    bootbox.alert(output);

    
  });
}

// Load available key mappings and maps from API
// KEYS, KEY MAPPINGS, and GAME
UI.loadOptions = function(next){

    // Available options
    var opts = {
      games : [],
      mappings : [],
      maps : [],
    }

    // Load Key Mapping and Available Maps
    async.parallel({
        one: function(callback){

          // Get list of Key Mappings
          $.get(Visualizer.API_url + "keys", function(mappings){
            opts.mappings = mappings;
            callback(null, 'keys');
          })
                

        },
        two: function(callback){

          // Get list of Game Maps
          $.get(Visualizer.API_url + "maps", function(maps){
            
            opts.maps = maps;

            // Generate list of games from the key mappings
            opts.games = getListOfGames(maps);
            callback(null, 'maps');
          })
        }
    },
    function(err, results) {

      // Throw errors in the case that the API
      // didn't return entries for any key

      if (opts.games.length < 1) {
        UI.error("Warning: App was unable to get list of games from the Key Mappings");
      }

      if (opts.mappings.length < 1) {
        UI.error("Warning: No key mappings were returned from the database");
      }

      if (opts.maps.length < 1) {
        UI.error("Warning: No game Maps were returned from the database");
      }

      console.log(opts);

      if (next) next(opts);

    });
}

/************************************
      Setup UI / Side Options
************************************/

/* 
name: addToggleAbleSideNavigation
author: Alex Johnson
created: March 29, 2015
purpose: initialize toggle-able side nav
*/
UI.addToggleAbleSideNavigation = function(){

    var SideOptionsToggle = L.Control.extend({
      
      options: { position: 'topleft' },

      // Create a button for toggling left nav
      onAdd: function (map) {
        
        // create the control container with a particular class name
        var button = L.DomUtil.create('div', 'toggle-side-options leaflet-control leaflet-bar');
        var icon   = L.DomUtil.create('i', 'fa fa-bars', button);

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
         Heatmaps
************************************/
UI.heatmaps = {}

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: creates a new radio button in the heatmaps tab to determine which is visible
argument: heatmap_id is the id of the currently selected heatmap
*/
UI.heatmaps.generateRadio = function(heatmap_id, heatmap_name) {
  var a = '<div class="radio col-md-10" style="margin-top: 10px"><label id="heatmap' + heatmap_id + 'Label" for="heatmap' + heatmap_id + 'Radio">';
  var b = '<input type="radio" name="heatmap-opts" id="heatmap' + heatmap_id + 'Radio" value="' + heatmap_id + '" checked onclick="UI.heatmaps.select(' + heatmap_id + ')">';
  var c = heatmap_name + '</label></div>';

  return a + b + c;
}

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: creates a new button for adding a heatmap to the Boolean operation tab
argument: heatmap_id is the id of the currently selected heatmap
*/
UI.heatmaps.generateBoolBtn = function(heatmap_id) {
  var a = '<div class="btn btn-primary btn-xs col-md-2" style="margin-top: 10px" onclick="UI.heatmaps.addBoolMap(' + heatmap_id + ');">';
  var b = '<span class="glyphicon glyphicon-share">'
  var c = '</span></div>';
  
  return a + b + c;
}

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: hides the previous map and displays the newly selected map
argument: heatmap_id is the id of the newly selected heatmap
*/
UI.heatmaps.select = function(heatmap_id) {
  Heatmap.hide(settings.activeHeatmap);
  settings.activeHeatmap = heatmap_id;
  Visualizer.updateHeatmap();
}

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: adds the currently selected map to the Boolean operation tab
argument: heatmap_id is the id of the currently selected heatmap
*/
UI.heatmaps.addBoolMap = function(heatmap_id) {
  var div = UI.heatmaps.generateBoolHTML(heatmap_id);
  $('#boolean-heatmaps').append(div);
  console.log("Heatmap with id " + heatmap_id + " added for boolean operation.");
}

/*
author: Alex Gimmi
created: July 20, 2015
purpose: creates a new entry for a heatmap in the Boolean operation tab
argument: heatmap_id is the id of the currently selected heatmap
*/
UI.heatmaps.generateBoolHTML = function(heatmap_id) {
  var hmapLabel = $('#heatmap' + heatmap_id + 'Label').text();

  var upBtn = '<div class="btn btn-primary btn-xs short-div" onclick="UI.boolops.moveUp(' + heatmap_id + ');">'
    + '<i class="fa fa-caret-square-o-up"></i></div>';

  var downBtn = '<div class="btn btn-primary btn-xs short-div" onclick="UI.boolops.moveDown(' + heatmap_id + ');">'
    + '<i class="fa fa-caret-square-o-down"></i></div>';

  var moveBtns = '<div class="col-md-2">' + upBtn + downBtn + '</div>';

  var checkbox = '<div class="checkbox col-md-8"><label id="bool' + heatmap_id + 'Label">'
    + '<input type="checkbox" id="bool' + heatmap_id + 'Checkbox" value="' + heatmap_id + '" checked>'
    + hmapLabel + '</label></div>';

  var remove = '<div class="btn btn-danger btn-xs" onclick="UI.boolops.remove(' + heatmap_id + ');">'
    + '<span class="glyphicon glyphicon-remove"></span></div>';

  var boolHTML = '<div id="bool' + heatmap_id + 'Div" class="row">' + moveBtns + checkbox + remove + '</div>';

  return boolHTML;
}

/************************************
         Boolean Operation
************************************/
UI.boolops = {};


/*
author: Alex Gimmi
created: July 20, 2015
purpose: removes a heatmap from the Boolean operation tab
argument: heatmap_id is the id of the heatmap that is being removed
*/
UI.boolops.remove = function(heatmap_id) {
  $('#bool' + heatmap_id + 'Div').remove();
}

// 7/27 TODO
UI.boolops.moveUp = function(heatmap_id) {
  var div = $("#bool" + heatmap_id + "Div");
  div.insertBefore(div.prev());
}

// 7/27 TODO
UI.boolops.moveDown = function(heatmap_id) {
  var div = $("#bool" + heatmap_id + "Div");
  div.insertAfter(div.next());
}

/* 
author: Alex Gimmi
created: June 25, 2015
purpose: Add a new heatmap which is the union of other selected heatmaps
argument: checked is a list of the checked off heatmaps
*/
UI.boolops.add = function(checked) {
  var addData = [];

  _.each(checked, function(heatmap_id) {
    var index = Heatmap.getIndexFromId(heatmap_id);
    var data = settings.heatmapData[index];
    addData = _.union(addData, data);
  })

  Heatmap.add(addData, UI.boolops.selectedHeatmapNames(" ∪ "));
}

/*
author: Alex Gimmi
created: July 8, 2015
purpose: Display the dialog box for intersection user input
argument: checked is a list of the checked off heatmaps in the boolops tab
*/
UI.boolops.loadIntersect = function(checked) {
  var distThresholdHTML = '<input id="intersectDistThresholdText" class="form-control bfh-number" type="text" name="distThreshold" ' +
              'title="Enter Distance Threshold" ' +
              'placeholder="threshold in meters"/>';
  var timeThresholdHTML = '<input id="intersectTimeThresholdText" class="form-control bfh-number" type="text" name="timeThreshold" ' +
              'title="Enter Time Threshold" ' +
              'placeholder="threshold in seconds"/>';
  var message = distThresholdHTML + timeThresholdHTML;

  bootbox.dialog({
    message: message,
    title: "Select Thresholds For Intersection",
    
    // Options available to the user
    buttons: {
      
      // Hide the modal
      success: {
        label: 'Cancel',
        className: "btn-default",
        callback: function() {}
      },

      // Add player to the map
      main: {
        label: "OK",
        className: "btn-primary",
        callback: function() {
          var distThreshold = $('#intersectDistThresholdText').val();
          var timeThreshold = $('#intersectTimeThresholdText').val();
          console.log("Checked: " + checked.toString());
          console.log("Distance Threshold: " + distThreshold);
          console.log("Time Threshold: " + timeThreshold);
          UI.boolops.intersect(checked, distThreshold, timeThreshold);
        }
      }
    }
  });
}

/* 
author: Alex Gimmi
created: June 25, 2015
purpose: Add a new heatmap which is the intersection of other selected heatmaps
argument: checked is a list of the checked off heatmaps in the boolops tab
argument: distThreshold is the user entered value from loadIntersectOpts dialog box
argument: timeThreshold is the user entered value from loadIntersectOpts dialog box
*/
UI.boolops.intersect = function(checked, distThreshold, timeThreshold) {
  // The accumulated data of intersecting points among maps
  var intersectData = [];

  // Set the intersection to start with the data from the first heatmap
  var intersectStart = settings.heatmapData[Heatmap.getIndexFromId(checked[0])];

  // Loop through the values of the first heatmap
  _.each(intersectStart, function(latLng) {

    // Loop through remaining heatmaps (first is already included)
    _.each(_.rest(checked), function(heatmap_id) {
      var index = Heatmap.getIndexFromId(heatmap_id);
      var data = settings.heatmapData[index];

      // Compare this heatmap to previous intersections
      _.each(data, function(d) {
        // If a threshold is blank, we want to ignore it by assuming there is an overlap
        var hasCloseLat = (distThreshold == "") ? true : Math.abs(latLng['latitude'] - d['latitude']) <= distThreshold;
        var hasCloseLng = (distThreshold == "") ? true : Math.abs(latLng['longitude'] - d['longitude']) <= distThreshold;
        var hasCloseTimestamp = (timeThreshold == "") ? true : Math.abs(latLng['timestamp'] - d['timestamp']) <= timeThreshold;

        if (hasCloseLat && hasCloseLng && hasCloseTimestamp) {
          intersectData.push(latLng);
        }
      })
    })
  })

  Heatmap.add(intersectData, UI.boolops.selectedHeatmapNames(" ∩ ") + 
    "\nDist (m): " + distThreshold +
    "\nTime (s): " + timeThreshold);
}

/*
author: Alex Gimmi
created: July 8, 2015
purpose: Display the dialog box for subtraction user input
argument: checked is a list of the checked off heatmaps in the boolops tab
*/
UI.boolops.loadSubtract = function(checked) {
  var distThresholdHTML = '<input id="subtractDistThresholdText" class="form-control bfh-number" type="text" name="distThreshold" ' +
               'title="Enter Distance Threshold" ' +
               'placeholder="threshold in meters"/>';
  var timeThresholdHTML = '<input id="subtractTimeThresholdText" class="form-control bfh-number" type="text" name="timeThreshold" ' +
              'title="Enter Time Threshold" ' +
              'placeholder="threshold in seconds"/>';
  var message = distThresholdHTML + timeThresholdHTML;

  bootbox.dialog({
    message: message,
    title: "Select Threshold For Subtraction",
    
    // Options available to the user
    buttons: {
      
      // Hide the modal
      success: {
        label: 'Cancel',
        className: "btn-default",
        callback: function() {}
      },

      // Add player to the map
      main: {
        label: "OK",
        className: "btn-primary",
        callback: function() {
          var distThreshold = $('#subtractDistThresholdText').val();
          var timeThreshold = $('#subtractTimeThresholdText').val();
          console.log("Checked: " + checked.toString());
          console.log("Distance Threshold: " + distThreshold);
          console.log("Time Threshold: " + timeThreshold);
          UI.boolops.subtract(checked, distThreshold, timeThreshold);
        }
      }
    }
  });
}

/* 
author: Alex Gimmi
created: July 8, 2015
purpose: Add a new heatmap which is the subtraction of all heatmaps from the first
argument: checked is a list of the checked off heatmaps in the boolops tab
argument: distThreshold is the user entered value from loadSubtractOpts dialog box
argument: timeThreshold is the user entered value from loadSubtractOpts dialog box
*/
UI.boolops.subtract = function(checked, distThreshold, timeThreshold) {
  // The accumulated data of intersecting points among maps
  var subtractData = [];

  // Set the intersection to start with the data from the first heatmap
  var subtractStart = settings.heatmapData[Heatmap.getIndexFromId(checked[0])];

  // Loop through the values of the first heatmap
  _.each(subtractStart, function(latLng) {

    // Loop through remaining heatmaps (first is already included)
    _.each(_.rest(checked), function(heatmap_id) {
      var index = Heatmap.getIndexFromId(heatmap_id);
      var data = settings.heatmapData[index];

      // Compare this heatmap to previous intersections
      _.each(data, function(d) {
        // If a threshold is blank, we want to ignore it by assuming there is an overlap
        var hasCloseLat = (distThreshold == "") ? true : Math.abs(latLng['latitude'] - d['latitude']) <= distThreshold;
        var hasCloseLng = (distThreshold == "") ? true : Math.abs(latLng['longitude'] - d['longitude']) <= distThreshold;
        var hasCloseTimestamp = (timeThreshold == "") ? true : Math.abs(latLng['timestamp'] - d['timestamp']) <= timeThreshold;
        
        // Make sure the current point isn't in the first set
        if (!(hasCloseLat && hasCloseLng && hasCloseTimestamp)) {
          subtractData.push(latLng);
        }
      })
    })
  })

  Heatmap.add(subtractData, UI.boolops.selectedHeatmapNames(" - ") + 
    "\nDist (m): " + distThreshold +
    "\nTime (s): " + timeThreshold);
}

/* 
author: Alex Gimmi
created: June 25, 2015
purpose: Returns a list of selected heatmap ids in the Boolean Operation tab
*/
UI.boolops.selectedHeatmapIds = function() {
    
  // List of actions
  var selectedIds = [];

  // Enabled check boxes (heatmap ids)
  $('#boolean-heatmaps input:checkbox:checked').each(function(index, checkbox){
    selectedIds.push(checkbox["value"]);
  })
  return selectedIds;
}

/*
author: Alex Gimmi
created: June 29, 2015
purpose: Returns a list of selected heatmap names in the Boolean Operation tab
paramater: delimiter determines what symbol to put in between each name
*/
UI.boolops.selectedHeatmapNames = function(delimiter) {
  // A String representation of the selected heatmaps' names
  var selectedNames = "";

  // Enabled check boxes (heatmap ids)
  $('#boolean-heatmaps input:checkbox:checked').each(function(index, checkbox){
    var hmap_id = checkbox["value"];
    var label = $('#heatmap' + hmap_id + "Label");
    if (selectedNames === "") {
      selectedNames += label.text();
    } else {
      selectedNames += delimiter + label.text();
    }
  })
  return selectedNames; 
}

/************************************
         Filters
************************************/

UI.filters = {};

/* 
name: create
author: Alex Johnson
created: March 29, 2015
purpose: create list of checkboxes in order to filter a set of actions
*/
UI.filters.create = function(){

  // Get list of this game's mappings
  var mappings = _.filter(options.mappings, { game : settings.game });

  // Clear filters list
  $("#filters").html("");

  _.each(mappings, function(mapping){

      var html = UI.filters.generateCheckbox(mapping);
      $("#filters").append(html);

  })

  return true;
}

// Create a new checkbox
UI.filters.generateCheckbox = function(mapping){

  var a = '<div class="checkbox"><label>';
  var b = '<input type="checkbox" id="toggle_paths" value="' + mapping.type + '" checked>' + mapping.type;
  var c = '</label></div>';

  return a + b + c
}

// Return list of selected actions
// NOTE: The checkboxes toggle CATEGORIES of key 
// mappings. This function collects, and returns
// an array of ALL actions that are allowed.

UI.filters.actions = function(){

  var categories = UI.filters.categories();

  // Find key mappings for current set of categories
  var enabledKeyMappings = _.filter(options.mappings, function(mapping){
    return _.contains(categories, mapping.type);
  });

  // Build list of ALL actions
  var actions = _.reduce(enabledKeyMappings, function(memo, mapping){ 
    return memo.concat(mapping.actions); 
  }, []);

  return actions;
}

// Return list of selected categories
UI.filters.categories = function(){
    
    // List of actions
  var categories = [];

  // Enabled check boxes
  $('#filters input:checkbox:checked').each(function(index, checkbox){
    categories.push(checkbox["value"]);
  })
  return categories;
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

// Store reference to loading indicator
UI.loader = {};

// purpose: show/hide a loading indicator
UI.loading = function(boolean, msg){
  
  // Show loading box
  if (boolean){
    $("#loading").addClass('active');
    
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

    $("#loading").removeClass('active');
    
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

function getListOfGames(mappings){
  var games = _.uniq(mappings, function(mapping){ return mapping.game });
  games = _.map(games, function(g){ return g.game });
  return games;
}
