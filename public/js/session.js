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
  
  /*_.each(settings,function(variable){
		console.log(JSON.stringify(variable));
	}
	);
  */
  
  if(filename.length > 0){

	var tempsettings = settings;
	delete tempsettings.overlay;
	
	console.log("printing overlay:" + tempsettings.overlay);
	
    var textToSave = JSON.stringify(tempsettings);
	//console.log(textToSave);

	var hiddenElement = document.createElement('a');

	hiddenElement.href = 'data:application/octet-stream,' + encodeURI(textToSave);
	hiddenElement.target = '_blank';
	hiddenElement.download = filename + '.json';
	hiddenElement.click();
	
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