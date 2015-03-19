
/************************************
              app.js   
************************************/

// Global Variables & Utility Functions

// Available Keys, and their index in
// the .csv array.

var keyMapping = {
	area      : 0, // (string) * 
	playerID  : 1, // (int)    * 
	timestamp : 2, // (double) * 
	posX      : 3, // (double) *
	posY      : 4, // (double) *
	cameraX   : 6, // (double)
	cameraY   : 7, // (double)
} // * required

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
