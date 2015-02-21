function upload(event) {
	$("#loading").text("Sending to database...");
	var upData = JSON.parse(localStorage.getItem("upload"));
	var toPost = new Object();
	console.log(upData);

	for (var i in upData) {
		console.log(upData[i]);
		console.log(upData[i][0]);
		if (upData[i][0].indexOf("Position_Introhouse") > -1) {
			console.log("match");
			toPost.userID = upData[i][1];
			toPost.timestamp = upData[i][2];
			toPost.xPos = upData[i][3];
			toPost.yPos = upData[i][4];
			toPost.camX = upData[i][6];
			toPost.camY = upData[i][7];
			console.log(toPost);
			$.post("http://g-player.herokupp.com", toPost, function(data, textStatus, jqXHR){ 
				// put the check mark next to the row in the table
				console.log(textStatus);
			});
		}
	}
	$("#loading").text("");
}
