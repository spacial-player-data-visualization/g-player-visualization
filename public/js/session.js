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

    var i = 0;
    
	//overlay & heatmaps are cyclic
	settings.overlay = [];
	settings.heatmaps = [];
	settings.heatmapIds = [];
    settings.heatmapData = [];
    settings.activeHeatmap = 0;
	
	// check for cyclic objects
	_.each(settings,function(variable){
		console.log("variable " + i++);
		JSON.stringify(variable);
	}
	);
	
	//convert settings object to json string
	console.log("Stringify in process....");
    var textToSave = JSON.stringify(settings);
	console.log("stringify complete.");

	// create a hidden download button and click it to download json
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:application/octet-stream,' + encodeURI(textToSave);
	hiddenElement.target = '_blank';
	hiddenElement.download = filename + '.json';
	hiddenElement.click();
	
	console.log("saving complete.");
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
	
	//Retrieve the first (and only!) File from the FileList object
    var f = $('#fileinput').get(0).files[0]; 

	//console.log(f);
	
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	      var contents = e.target.result;
		  
		  // set settings to object from file
		  settings = JSON.parse(contents);
		  
		  // enable all UI elements to update from new data in settings
		  UI.getListOfAvailablePlayerIDs(); //players on left
		  UI.getListOfAvailableGroupIDs(); //groups on left
		  UI.players.refreshMap(); // players & groups in filter data
		  UI.filters.changePlayer(); //update selected player and actions
		  Visualizer.refresh(); //umap
		  updateBrush(); //brush
		  // todo : heatmap
		  // todo : boolean operations
		  
		$('#fileinput').val("");  
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
}