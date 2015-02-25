
/******************************
         app.js 
 ******************************/

var environment = document.URL;

var API = {

  // Target API. Set depending on environment
  url : _.contains(environment, "herokuapp.com") ? "http://g-player.herokuapp.com/api/" : "http://localhost:5000/api/",
};