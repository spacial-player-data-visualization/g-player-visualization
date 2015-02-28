
/******************************
       query-builder.js
       ******************************/

// Area is the default visible argument
$("#groupPlayerID, #groupTimestamp").hide();

// Disable the boolean operation argument before query has arguments
// TODO: Enbale this when there is at least 1 entry in the table
$("#selectComparisonType").prop("disabled", true);

// Only show relevant followup inputs for the selected input
function changeSelectVisible() {

	var selection = $(this).val();
	$("#groupMap, #groupPlayerID, #groupTimestamp").hide();

	if (selection == "area") {
		$("#groupMap").show();
	} else if (selection == "playerID") {
		$("#groupPlayerID").show();
	} else if (selection == "timestamp") {
		$("#groupTimestamp").show();
	}
}

// Watch query type changes
$(document).ready(function(){
	$("#selectQueryType").change(changeSelectVisible);
});

// Adds a new argument to the query
function addArg(event) {
	var comparisonType = $("#selectComparisonType").val();
	var queryType = $("#selectQueryType").val();
	var value;

	// Get the value for the argument based on the query type
	if (queryType == "area") {
		value = $("#selectMap option:selected").text();
	} else if (queryType == "playerID") {
		//TODO: if there is more than one player ID, add them as a disjunction...
		value = $("#inputPlayerID").val();
	} else if (queryType == "timestamp") {
		//TODO: make sure this is a number, else it will be the empty string
		value = $("#inputTimestamp").val();
	}

	var data = [comparisonType, queryType, value, "BUTTON PLACEHOLDER"];
	var table = $("<table/>").attr("id","arguments");
	var tr="<tr>";
	for (var key in data) {
		if (typeof data[key] != 'undefined') {
			tr += "<td>" + data[key] + "</td>";
		} else {
			tr += "<td>" + "-" + "</td>";
		}
	}
	tr += "</tr>";
	$("table").append(tr);
  }

// Removes an argument from the query
function removeArgument(event) {
	// TODO remove the argument based on which button was pressed
}

// Execute the query on the database
function executeQuery(event) {
	$("#loading").text("Querying database...");
	//TODO build mongo query here out of the information on the page
}