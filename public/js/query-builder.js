/*

Query Builder


QueryBuilder is a tool for building MongoDB query
strings. By providing the user with a GUI, 
QueryBuilder hopes to empower end-users to 
generate complex database searches


*/

  
var QueryBuilder = {

  // Define current state
  mode : "custom", // (one of "preset" or "custom")

  // Save the paramter list.
  data : [],

};


// Open Query Builder Modal
QueryBuilder.open = function(){

	// Load Template
	$("#query-builder-modal .modal-body").load('templates/query-builder.tpl.html', function(result){
	  console.log("Query Builder Template Loaded");
	});

	// Open Query Builder Modal
	$("#query-builder-modal").modal('show');

	// Focus Modal
	$('#query-builder-modal').on('shown.bs.modal', function () {
	  $('#query-builder').focus()
	})

}

// Change between custom queries, and preset queries
QueryBuilder.toggle = function(target){
	
	// If the target is the same thing as the
	// active mode, we can skip this function
	if (target == QueryBuilder.mode) return;

	// Toggle the active section of the template
	$("#query-builder, #query-preset").toggle();

	// Toggle active navigation item
	$("#query-builder-modal .nav-tabs li").toggleClass("active");

	// Save state to object.
	QueryBuilder.mode = target;

	return target;
}


$("#loading").hide();

/******************************
       query-builder.js
******************************/

// Watch query type changes
$(document).ready(function(){
	$("#selectQueryType").change(changeSelectVisible);
});

// Area is the default visible argument
$("#groupPlayerID, #groupTimestamp").hide();

// Disable the boolean operation argument before query has arguments
// TODO: Enbale this when there is at least 1 entry in the table
$("#selectComparisonType").prop("disabled", true);

// Store JSON data
var Query = [];

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

	var editBtn   = '<div class="btn btn-warning" onclick="edit(' + 1 + ')"><i class="fa fa-pencil"></i></div>';
	var deleteBtn = '<div class="btn btn-danger" onclick="remove(' + 1 + ')"><i class="fa fa-close"></i></div>';

	// Compile row data
	var data = [comparisonType, queryType, value, editBtn, deleteBtn];

	console.log(data);

	var table = $("<table/>").attr("id","arguments");

	var tr = "";

	// Create <td> data cells
	for (var key in data) {
		if (typeof data[key] != 'undefined') {
			tr += "<td>" + data[key] + "</td>";
		} else {
			tr += "<td>" + "-" + "</td>";
		}
	}

	tr = $("<tr>").append(tr);
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