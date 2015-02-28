
/************************************
              
              app.js 

  Global Variables & Utility Functions
  
 ************************************/

// Available Keys, and their index in
// the .csv array.
var keyMapping = 
{
	area      : 0,
	playerID  : 1,
	timestamp : 2,
	posX      : 3,
	posY      : 4,
	cameraX   : 6,
	cameraY   : 7,
}

var environment = document.URL;

var API = {

  // Target API. Set depending on environment
  url : _.contains(environment, "herokuapp.com") ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/",
};

var loading = {};

// UI Feedback Indicator
loading.start = function(){
	$("#loading").text("Loading...");
};

// UI Feedback Indicator
loading.end = function(){
	$("#loading").text("");
};

DOM = {};

// Provide User Feedback in the Document
DOM.log = function(msg){
	$("#log").prepend("<p>" + msg + "</p>");
}