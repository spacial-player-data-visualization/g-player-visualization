
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
       Utility Functions
************************************/

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

/*
$(function() {
	QueryBuilder.open();
}); */
