
/******************************
        key-mappings.js 
 ******************************/

/*

 Initialized by Alex Johnson
 With work from Alex Jacks

 This file stores a number of key-mapping
 settings for converting .csv files
 into their relvant JSON data files.

 Essentially, when a user imports a .csv
 file, we do not know WHICH column represents
 which data field.

 To solve this problem, we store an internal
 set of "kay-mappings". Using the first value
 of a .csv row, we can decide the "type" of 
 action that row represents.

 For example, if the first row is "Position_Bar",
 We know that the data represents a player position
 and a specific point, thus we can use the 
 key mapping for "position"s. This allows us
 to correlate columns 1->9 with their key.
 
 */


/* 

This is a lookup table.
The first column of a row will always
tell us the name of the action. Using
this name, we fetch the corresponding
key mapping.

*/

// Lookup Table for Mapping action 
// name to action type.

var lookup_table = {

	"Attacked" : "action",
	"CraftingTable" : null,
	"Creature Giant Rat attacked first" : null,
	"Dialogue" : null,
	"InteractionContainer" : "interaction",
	"InteractionDoor" : "interaction",
	"InteractionInterior" : "interaction",
	"InteractionNPC" : "interaction",
	"InteractionObject" : "interaction",
	"NPC Bean attacked first" : null,
	"NPC Bobby D attacked first" : null,
	"NPC Collin attacked first" : null,
	"NPC Dough attacked first" : null,
	"NPC JD attacked first" : null,
	"NPC Mel attacked first" : null,
	"NPC Munz attacked first" : null,
	"NPC Ray attacked first" : null,
	"NPC Sara attacked first" : null,
	"NPC Sheriff attacked first" : null,
	"NPC Slater attacked first" : null,
	"ObjectOnActivate" : null,
	"player attacked first" : null,
	"Player killed" : null,
	"Player looted dead" : null,
	"Player looted Dead" : null,
	"Player shooting a dead" : null,
	"PlayerDropItem" : null,
	"PlayerDroppedItem" : null,
	"PlayerEquipped" : null,
	"PlayerJumped" : null,
	"PlayerLootedItem" : null,
	"PlayerShot" : null,
	"PlayerUnequipped" : null,
	"Position_AbandonedHouse" : "position",
	"Position_Bar" : "position",
	"Position_Hotel" : "position",
	"Position_Introhouse" : "position",
	"Position_Outside" : "position",
	"Position_SheriffOffice" : "position",
	"Quest" : null,
	"Sta" : null,
}

// Store a list of available key mappings
var mappings = [];

// Represent a player position in a map
mappings.push({
	game  : "Fallout New Vegas",
	type  : "position",
	keys : {
		area      : 0, // (string) * 
		playerID  : 1, // (int)    * 
		timestamp : 2, // (double) * 
		posX      : 3, // (double) *
		posY      : 4, // (double) *
		cameraX   : 6, // (double)
		cameraY   : 7, // (double)
	},
});

// Represent a user action
mappings.push({
	game  : "Fallout New Vegas",
	type  : "action",

	keys : {
		area      : 0, // (string) * 
		playerID  : 1, // (int)    * 
		timestamp : 2, // (double) * 
		posX      : 3, // (double) *
		posY      : 4, // (double) *
	},
});

// Represent a user interaction
mappings.push({
	game  : "Fallout New Vegas",
	type  : "interaction",

	keys : {
		area      : 0, // (string) * 
		playerID  : 1, // (int)    * 
		timestamp : 2, // (double) * 
		posX      : 3, // (double) *
		posY      : 4, // (double) *
	},
});

// Return the key mapping given the 
// game name, and the event name

// ex: getKeyMapping("Fallout New Vegas", "Attacked")

var getKeyMapping = function(game, eventName){

	// Get the type of event from the lookup table
	var type = lookup_table[eventName]

	// Find mapping
	var mapping = _.findWhere(mappings, {game : game, type : type});

	if (!mapping || !type) {
		console.log("Unable to find key mapping for: " + eventName);
		return;
	}

	return mapping;
}

// assignKeys() returns a JSON object, where
// the values of the 'values' array are assigned
// to the keys provided in the 'mapping' array.

// For example:
// values : ["apple", "orange", "pear"]
// mapping : { fruit : 0, color : 1, shape : 0 }

// Results in:
// { fruit : "Apple", color : "orange", shape : "pear" }

var assignKeys = function(values, mapping){
	var acc = {};

	_.each(mapping, function(value, key){
		acc[key] = values[value];
	})

	return acc;
}

// Given a list of arrays, convert the data into JSON objects.
//   game : String of game name
//   eventName : the event name for this table
//   data : multudimensional array container player data
var assignKeysForEntireTable = function(game, eventName, data) {
	var acc = [];

	// Key the key mapping
	var mapping = getKeyMapping(game, eventName).keys;

	// Apply key mapping to each object in the data array
	_.each(data, function(d){
		var json = assigKeys(d, mapping);
		if (json) acc.push(json);
	})

	return acc;
}