
/******************************
       query-builder.js
 ******************************/

// Show the map selector by default
$("#groupPlayerID, #groupTimestamp").hide();

// Only show relevant followup inputs for the selected option
$(document).ready(function (){
	$("#selectQueryType").change(function() {

		var selection = $(this).val();
		$("#groupMap, #groupPlayerID, #groupTimestamp").hide();

		if (selection == "area") {
			$("#groupMap").show();
		} else if (selection == "playerID") {
			$("#groupPlayerID").show();
		} else if (selection == "timestamp") {
			$("#groupTimestamp").show();
		}
	});
});