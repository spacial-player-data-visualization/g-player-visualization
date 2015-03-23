
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

// Return the key mapping given the 
// game name, and the event name
var getKeyMapping = function(game, eventName){

	// Get the type of event from the lookup table
	var type = lookup_table[eventName]

	if (!type) {
		console.log("Unable to find key mapping for: " + eventName);
		return;
	}

	// Find mapping
	var mapping = _.findWhere({game : game, type : type});

	return mapping;
}

