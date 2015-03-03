/*

Query Builder


QueryBuilder is a tool for building MongoDB query
strings. By providing the user with a GUI, 
QueryBuilder hopes to empower end-users to 
generate complex database searches

Inspiration from:
https://github.com/tablelist/angular-admin-directives/

*/

// ABOUT QUERY BUILDING:
// An argument is a single line in a complex query.

// VOCABULARY:

// comparison : AND/OR
// - property : the key (userId, timecode)
// - comparator : the comparison agains the value (equals, greater than)
// - value : the value to compare (true, 10.2...)

var sample_argument = {
    comparison : "AND", // How the argument is compared against the database
	property : "timestamp", // The key name. ex: "userId".
    comparator : "gte", // How the value is compared. ex: "Greater than".
    value : 10.2, // The value compared against the data. Example: "10.4".
};


// MAIN QUERY BUILDER OBJECT
var QueryBuilder = {

  // Define current state
  state : "custom", // "preset" or "custom")

  // Save the parameter list.
  query : [],

};

// Open Query Builder Modal
QueryBuilder.open = function(){

	// Load Template
	$("#query-builder-modal .modal-body").load('templates/query-builder.tpl.html', function(result){
    	  
        // Callback
        // Open Query Builder Modal
        $("#query-builder-modal").modal('show');  

        // Focus Modal
        $('#query-builder-modal').on('shown.bs.modal', function () {
          $('#query-builder').focus()
        })  

        // Setup DOM watchers
        QueryBuilder.initialize();

	});
}

// Change between custom queries, and preset queries
QueryBuilder.mode = function(target){
	
	// If the target is the same thing as the
	// active mode, we can skip this function
	if (target == QueryBuilder.state) return;

	// Toggle the active section of the template
	$("#query-builder, #query-preset").toggle();

	// Toggle active navigation item
	$("#query-builder-modal .nav-tabs li").toggleClass("active");

	// Save state to object.
	QueryBuilder.state = target;

	return target;
}

// Runs when Query Builder is opened.
// Setup DOM watchers
QueryBuilder.initialize = function(){

	// Watch for change in property
	$("#selectQueryType").change(QueryBuilder.propertyUpdated);

	// Area is the default visible argument
	// $("#inputValue input").hide();

	// Disable the boolean operation argument before query has arguments
	// TODO: Enbale this when there is at least 1 entry in the table
	$("#selectComparisonType").prop("disabled", true);
}

// Only show relevant followup inputs for the selected input
QueryBuilder.propertyUpdated = function() {

	// This property has changed
	var property = $("#inputProperty").val()

	// Hide existing inputs
	// $("#inputValue input").hide();

	// Change value input type based on
	// selected property
	// if (property == "playerID") {
	//		$("#groupPlayerID").show();

	// } else if (property == "timestamp") {
	//	$("#groupTimestamp").show();
	// }
}

// Get parameter from form
QueryBuilder.getFormData = function(){

	// Extract form data with jQuery
	var comparison = $("#inputComparison").val();
	var property   = $("#inputProperty").val();
	var comparator = $("#inputComparator").val();
	var value      = $("#inputValue").val();

	return {
		comparison : comparison,
		property   : property,
		comparator : comparator,
		value  : value ,
	}
}

// Adds a new argument to the query
QueryBuilder.addArgument = function(event) {

	// Get values from form
	var parameter = QueryBuilder.getFormData();

	// Get the value for the argument based on the query type
	/*
	if (parameter.property == "area") {

		value = $("#selectMap option:selected").text();
	} else if (parameter.property == "playerID") {

		//TODO: if there is more than one player ID, add them as a disjunction...
		value = $("#inputPlayerID").val();
	} else if (parameter.property == "timestamp") {

		//TODO: make sure this is a number, else it will be the empty string
		value = $("#inputTimestamp").val();
	}*/

	console.log("\nAdding Parameter");
	console.log(parameter);

    // Add parameter to list
    QueryBuilder.query.push(parameter)

	// Update Preview Table
    QueryBuilder.preview();
}

// Returns the requested argument
QueryBuilder.getArgument = function(id) {
    var argument = QueryBuilder.query[id];
    return argument;
}

// Removes an argument from the query
QueryBuilder.removeArgument = function(id) {
    var argument = QueryBuilder.query[id];

    if (!confirm("Are you sure you want to delete this parameter from the Query you are building?")) return;

    // remove the argument based on which button was pressed
    QueryBuilder.query.splice(id, 1);
    QueryBuilder.preview();

    return argument;
}

// Clear current query. Start fresh
QueryBuilder.reset = function(){
	if (!confirm("Are you sure you want to reset the Query Builder? This will clear the current form, as well as parameters on the right. It will not effect your saved or most common queries.")) return;
	QueryBuilder.query = [];
	QueryBuilder.preview();
}

// Generates an HTML table of the current query
QueryBuilder.preview = function(){
    
    // Empty preview table
    $("#arguments tbody").html("");
    
    // The HTML containing each table row
    var rows;

    // Iterate through queries
    for (var id in QueryBuilder.query){
        
        // The current argument
        var argument = QueryBuilder.query[id];
        console.log(argument);

        // Create <td> data cells
        var row_data = [
        	argument.comparison,
			argument.property,
			argument.comparator,
			argument.value,
        ]

        // Customized delete button
        row_data.push(QueryBuilder.generateButtons(id));

		// _.reduce (or, foldr) boils an array of values
		// into a single value. In this case: the HTML
		// for a table row.

        var tr = _.reduce(row_data, function(acc, current){
        	
        	// Check for undefined
        	var value = (typeof current != 'undefined') ? current : "-";

        	// Return data cell
        	return acc + "<td>" + current + "</td>";

        }, "");

        // Append new row to existing rows.
        rows = rows + "<tr>" + tr + "</tr>";
    }
    
    // Add rows to table
    $("#arguments tbody").append(rows);

    // Add JSON code to preview
    $("#json_preview code").html(" ").append(JSON.stringify(QueryBuilder.query));

    // Add Mongo Query String to preview
    $("#mongo_preview textarea").val(" ").val(QueryBuilder.queryString());

    return rows;
}

// Generate the HTML for the [add] and [edit] buttons.
QueryBuilder.generateButtons = function(id){
	return '<div onclick="QueryBuilder.removeArgument(' + id + ')"><i class="fa fa-minus-square" style="color: rgb(186, 10, 10);"></i></div>'
}

// @TODO: Convert QueryBuilder.query -> a mongo db string
// Returns the Mongo query string
QueryBuilder.queryString = function(){ 
	return "Feature In Development"; 
}

// GET data from database according to defined mongo query
QueryBuilder.queryDatabase = function(){
	
	// Check for empty query
	if (QueryBuilder.query.length < 1){
		alert("No Query Defined. Unable to Query Database");
		return;
	} else {
		


	}

}

// Static Configuration
QueryBuilder.supportedKeys = [{
        key : "userId",
        name : "User ID",
        dataType : "int",
    }, {
        key : "timestamp",
        name : "Time Stamp",
        dataType : "",
    }];

// QueryBuilder.comparators = [{
// 		// Int
// 	    name : "equals",
// 	    expression : null,
// 	    dataType : "int"
// 	},{
// 	    name : "greater than or equal to",
// 	    expression : "$gte",
// 	    dataType : "int"
// 	}, {
// 	    name : "less than or equal to",
// 	    expression : "$lte",
// 	    dataType : "int"
// 	}, {
// 	    name : "greater than",
// 	    expression : "$gt",
// 	    dataType : "int"
// 	}, {
// 	    name : "less than",
// 	    expression : "$lt",
// 	    dataType : "int"
// 	}, {
// 		// String
// 	    name : "contains",
// 	    expression : "$lt",
// 	    dataType : "string"
// 	}, {
// 		// Boolean
// 	    name : "is",
// 	    expression : true,
// 	    dataType : "boolean"
// 	}, {
// 	    name : "is not",
// 	    expression : { "$ne" : true },
// 	    dataType : "boolean"
// 	}, {
// 		// Date
// 	    name : "after",
// 	    expression : "$gt",
// 	    dataType : "date"
// 	}, {
// 	    name : "before",
// 	    expression : "$lt",
// 	    dataType : "date"
// 	}];