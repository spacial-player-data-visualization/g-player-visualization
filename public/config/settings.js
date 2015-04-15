/*

settings.js
G-Player Data Visualization

- A file used to store global settings for the app
- Stores the current state of the application

Created: March 25th, 2015
Authors:
Alex Johnson @alexjohnson505

*/

// Available options
var options = {};

options.maps = [{

    // Save map configuration
    name: "Position_Introhouse",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/8zDo1iB.jpg",

    // Map player locations to their points
    // on the map. Define the corners.
    bottom : -512.4305761910372,
    left : -430.1821924060032,
    
    top : 2015.381268553384,
    right : 2846.5933252185027,

}, {

    // Save map configuration
    name: "Position_Outside",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/MCfV82L.jpg",


    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : -13797.39500601122,
    left : -8442.484986063437,

    top : 14847.0708843808,
    right : 25743.8091076939,

}, {

    // Save map configuration
    name: "Position_Bar",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/9lo12qd.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 70,
    left : 1020,

    top : 1248,
    right : 2620,

}, {

    // Save map configuration
    name: "Position_AbandonedHouse",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/kMyybLB.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base
    bottom : -2143.1626916348123,
    left : -73.16269163481242,

    top : -356.83730836518754,
    right : 1713.1626916348123,

}, {

    // Save map configuration
    name: "Position_Cave",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/ynqOvIh.png",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 4846.907302239601,
    left : -1858.9105065756294,

    top : 10836.0926977604,
    right : 3526.9105065756266,

}, {

    // Save map configuration
    name: "Position_SheriffOffice",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/kMPpXSW.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 909.9856107934693,
    left : 1477.3976082659278,

    top : 1950.0143892065314,
    right : 2500.6023917340713,

}, {

    // Save map configuration
    name: "Position_Mine",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/2j0T2C0.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : -4278.8948593636815,
    left : -2202.1430291370752,

    top : 3369.8948593636815,
    right : 5019.143029137077,

}, {

    // Save map configuration
    name: "Position_Hotel",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/kv3BMnd.jpg?1",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : -643.0427310756933,
    left : 294.7154648501225,

    top : 3778.4365119493827,
    right : 3343.702294135778,

}, {

    // Save map configuration
    name: "default",
    game: "League of Legends",
    imageURL: "http://i.imgur.com/vattHJi.jpg",


    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base
    top : 14539.0974490324,
    bottom : -704.0974490324751,
    left : -560.7673895530859,
    right : 16200.767389553062,
}, {
	
	name: "Default",
	game: "Game Gaze",
	imageURL: "http://i.imgur.com/0aXWffH.jpg",

	top: 604.5111946300519,
	bottom: -164.511194630052,

	left: 615.4888053699481,
	right: 1384.511194630052,
}
];


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


// Lookup Table for Mapping action 
// name to action type.

// Store a list of available key mappings
options.mappings = [{
	
	// Represent a player position in a map
	game  : "Fallout New Vegas",
	type  : "position",
	actions : ["Position_AbandonedHouse", "Position_Bar", "Position_Hotel",
				"Position_Introhouse", "Position_Outside",
				"Position_SheriffOffice", "Position_Mine", "Position_Cave",],
	columns : ["area", "playerID", "timestamp", "posX", "posY", "cameraX", "cameraY", "???", "??", "?"]
}, {
	
	// Represent a user action
	game  : "Fallout New Vegas",
	type  : "action",
	actions : [	"Attacked"],
	columns : ["action", "playerID", "value", "target", "status"],
}, {
	
	// Represent a user dialogue
	game  : "Fallout New Vegas",
	type  : "dialogue",
	actions : ["Dialogue"],
	columns : ["action", "playerId", "timestamp", "??", "NPC", "text", "response"],
}, {
	
	// Represent a user interaction
	game  : "Fallout New Vegas",
	type  : "interaction",
	actions : ["InteractionContainer", "InteractionInterior", 
				"InteractionNPC", "InteractionObject"],
	columns : ["action", "location", "playerID", "object", "posX", "posY", "cameraX", "cameraY"]
}, {

	// Represent item interactions
	game  : "Fallout New Vegas",
	type  : "item",
	actions : ["PlayerDropItem", "PlayerDroppedItem", "PlayerEquipped",
				"PlayerLootedItem", "PlayerShot", "PlayerUnequipped"],
	columns : ["action", "item", "value"],
}, {
	
	// Represent attacks against the player
	game  : "Fallout New Vegas",
	type  : "attacked",
	actions : ["NPC Bean attacked first", "NPC Bobby D attacked first",
				"NPC Collin attacked first", "NPC Dough attacked first",
				"NPC JD attacked first", "NPC Mel attacked first",
				"NPC Munz attacked first", "NPC Ray attacked first",
				"NPC Sara attacked first", "NPC Sheriff attacked first",
				"NPC Slater attacked first"],
	columns : ["action", "playerID", "value"],
}, {

	// Represents player sneaking
	game  : "Fallout New Vegas",
	type  : "sneaking",
	actions : ["PlayerSneaking"],
	columns : ["action", "area", "playerID", "value", "???"],
}, {
	
	// Represents player jumping
	game  : "Fallout New Vegas",
	type  : "jump",
	actions : ["PlayerJumped"],
	columns : ["action", "value"],
}, {

	// Represents player interactions
	game : "Fallout New Vegas",
	type : "interactionNoTarget",
	actions : ["InteractionDoor"],
	columns : ["action", "area", "playerID", "target", "timestamp", "posX", "posY", "?"],
}, {

	// Represents player interactions without explicit targets
	game : "Fallout New Vegas",
	type : "interactionNoTarget",
	columns : ["action", "area", "playerID", "timestamp", "posX", "posY", "?"],

	// Represents player crafting
	game  : "Fallout New Vegas",
	type  : "craft",
	actions : ["CraftingTable"],
	columns : ["action", "name", "playerID", "value"],
}, {

	// Represents player getting attacked by giant rat
	game  : "Fallout New Vegas",
	type  : "ratattack",
	actions : ["Creature Giant Rat attacked first"],
	columns : ["action", "playerID", "value"],
}, {

	// Represents player getting some object
	game  : "Fallout New Vegas",
	type  : "object",
	actions : ["ObjectOnActivate"],
	columns : ["action", "????", "value"],
}, {

	// Represents player doing some action
	game  : "Fallout New Vegas",
	type  : "playeraction",
	actions : [ "player attacked first", "Player killed",
				"Player looted dead", "Player looted Dead", "Player shooting a dead"],
	columns : ["action", "playerID", "value", "object"]
}, {

	// Represents player on quest
	game  : "Fallout New Vegas",
	type  : "quest",
	actions : ["Quest"],
	columns : ["action", "playerID", "value", "name", "status"],
}, {

	// Represents player stat
	game  : "Fallout New Vegas",
	type  : "stat",
	actions : ["Stat"],
	columns : ["action", "playerID", "action", "key", "value", "status"],
}, {
	game : "Game Gaze",
	type : "default",
	actions : ["Game Gaze"],
	columns : ["timestamp", "gazeX", "gazeY", "posX", "posY", "posZ", "cameraX", "cameraY"],
}, {
	game: "League of Legends",
	type: "default",
	actions: ["League of Legends"],
	columns: ["playerID", "timestamp", "posX", "posY"],
}];

function getListOfGames(){
  var games = _.uniq(options.mappings, function(mapping){ return mapping.game });
  games = _.map(games, function(g){ return g.game });
  return games;
}

// Available Games
options.games = getListOfGames();

