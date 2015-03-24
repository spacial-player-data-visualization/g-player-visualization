
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

    // Current Game
    game : "Fallout New Vegas",

    // Current Map
    map : {

      // Save map configuration
      url: "/fallout/intro.png",
      name: "Position_introhouse",
      title: "",
      width : 1600,
      height : 1178,

      // Map player locations to their points
      // on the map. Manually offset for accuracy.
      // Multiplied to base
      offset : {
        x : 650,
        y : 550,
      },

      // Map player locations to their points
      // on the map. Manually scale for accuracy.
      // added to base
      scale : {
        x : 0.45,
        y : 0.45,
      }
    },
  };

/************************************
 Global Variables & Utility Functions
************************************/

var environment = document.URL;

var API = {
	
  // Target API. Set depending on environment
  url : (window.location.href.indexOf("herokuapp.com") > -1) ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/",
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
