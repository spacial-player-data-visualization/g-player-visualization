/*
session.js
G-Player Data Visualization

- gives functionality to save the current state of Gplayer (from varibale:settings)
- gives functionality to load the previously saved state of Gplayer (into varibale:settings)

Authors:
Asarsa

Created: 
April 04, 2016
*/


// Save/Load session
var Session = {};

/* 
name: save
author: Asarsa
created: April 04, 2016
purpose: save the current state of Gplayer
argument: name for session
*/
Session.save = function(){

  var filename = $('#session_filename').val();
  
  if(filename.length > 0){

    var json = JSON.stringify(settings);
	window.open("data:application/octet-stream;charset=utf-16le;base64," + json);
  }
  else{
	alert("Enter a name for session!");  
  }

}



/* 
name: load
author: Asarsa
created: April 04, 2016
purpose: load previously saved state of Gplayer
argument: name for session
*/
Session.load = function(){
	
	

}