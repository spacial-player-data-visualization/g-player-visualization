function upload(event) {
	$("#loading").text("Sending to database...");
	
	var upData = localStorage.getItem("upload");
	
	upData = JSON.parse(upData);

	console.log(upData);

	var upData = _.filter(upData, function(current){
		return current[0].indexOf("Position_Introhouse") > -1;
	})

	var entries = {
		entries : _.map(upData, function(current){
			return {
				playerID : current[1],
				timestamp : current[2],
				posX : current[3],
				posY : current[4],
				cameraX : current[6],
				cameraY : current[7],
				area: current[0],
			}
		})
	}

	console.log(entries);
	
	$.post(API.url + "entries", entries, function(data, textStatus, jqXHR){ 
		// put the check mark next to the row in the table

		console.log(textStatus);

		// this will go into the callback as soon as posting error is fixed
		
		$("#loading").text("");	

	});
	
}
