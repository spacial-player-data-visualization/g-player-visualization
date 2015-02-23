function upload(event) {
	$("#loading").text("Sending to database...");
	var upData = localStorage.getItem("upload");
	upData = JSON.parse(upData);
	var toPost = {};
	console.log(upData.length);
	for (var i in upData) {
		var current = upData[i];
		if (current[0].indexOf("Position_Introhouse") > -1) {
			//console.log(upData[i][0]);
			//console.log("match");
			toPost.userID = current[1];
			toPost.timestamp = current[2];
			toPost.xPos = current[3];
			toPost.yPos = current[4];
			toPost.camX = current[6];
			toPost.camY = current[7];
		//	console.log(toPost + " line 19");
			$.post("http://g-player.herokupp.com", toPost, function(data, textStatus, jqXHR){ 
				// put the check mark next to the row in the table
				console.log(textStatus);

			});
			// this will go into the callback as soon as posting error is fixed
			if (i == (upData.length - 1)) {
					$("#loading").text("");	
				}
		}
	}
}
