
/******************************
         app.js 
 ******************************/

// Available Keys, and their index in
// the .csv array.
var keyMapping = {
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

loading.start = function(){
	$("#loading").text("Loading...");
};

loading.end = function(){
	$("#loading").text("");
};
