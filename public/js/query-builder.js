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
var sample_argument = {
    
    // How the argument is compared against the database
    comparison : "AND",

    // The key name. ex: "userId".
    property : "timestamp",
    
    // How the value is compared. ex: "Greater then".
    comparator : "gte",
    
    // The value compared against the data. Example: "10.4".
    parameter : 10.2,
};


var QueryBuilder = {

  // Define current state
  state : "custom", // "preset" or "custom")

  // Save the parameter list.
  query : [],

  // Returns the Mongo query string
  queryString : function(){ return "Feature Incomplete"; },

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

    // Add sample data
    QueryBuilder.query.push(sample_argument);

	$("#selectQueryType").change(QueryBuilder.changeSelectVisible);

	// Area is the default visible argument
	$("#groupPlayerID, #groupTimestamp").hide();

	// Disable the boolean operation argument before query has arguments
	// TODO: Enbale this when there is at least 1 entry in the table
	$("#selectComparisonType").prop("disabled", true);



}

// Only show relevant followup inputs for the selected input
QueryBuilder.changeSelectVisible = function() {

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
QueryBuilder.addArgument = function(event) {
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

    QueryBuilder.query.push({
        comparison : comparisonType,

        // The key name. ex: "userId".
        property : queryType,
    
        // How the value is compared. ex: "Greater then".
        comparator : "equal to",
    
        // The value compared against the data. Example: "10.4".
        parameter : value,
    })

    QueryBuilder.preview();
}

// Removes an argument from the query
QueryBuilder.removeArgument = function(id) {
    console.log(QueryBuilder.query.length);
    QueryBuilder.query.splice(id, 1);
    console.log(QueryBuilder.query.length);
    QueryBuilder.preview();
	// TODO remove the argument based on which button was pressed
}

// Generates an HTML table of the current query
QueryBuilder.preview = function(){
    
    $("arguments").html("");

    var table = $("<table/>").attr("id","arguments");

    // Iterate through queries
    for (var id in QueryBuilder.query){
        
        var tr = "";

        // This argument
        var argument = QueryBuilder.query[id];

        var editBtn   = '<div class="btn btn-warning" onclick="QueryBuilder.removeArgument(' + id + ')"><i class="fa fa-pencil"></i></div>';
        var deleteBtn = '<div class="btn btn-danger"  onclick="QueryBuilder.removeArgument(' + id + ')"><i class="fa fa-close"></i></div>';

        argument.edit = editBtn;
        argument.delete = deleteBtn;

        // Create <td> data cells
        for (var key in argument) {
            if (typeof argument[key] != 'undefined') {
                tr += "<td>" + argument[key] + "</td>";
            } else {
                tr += "<td>" + "-" + "</td>";
            }
        }

        tr = $("<tr>").append(tr);

    }
    
    $("#arguments").append(tr);

    return tr;
}

// Static Configuration
// QueryBuilder.supportedKeys = [{
//         key : "",
//         name : "",
//         dataType : "",
//     }];

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