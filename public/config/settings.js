
/******************************
        config.js
 ******************************/

// Available options
var options = {};

options.maps = [{

    // Save map configuration
    name: "Position_Introhouse",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/zWbog8y.jpg",

    // Map player locations to their points
    // on the map. Define the corners.
    bottom : -836,
    left : -823,
    
    top : 2463,
    right : 2977,

}, {

    // Save map configuration
    name: "Position_Outside",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/sSYRyve.jpg",
	

    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base
    
    bottom : -13981,
    left : -7682,

    top : 14735,
    right : 20151,

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

    bottom : -2104,
    left : -274,

    top : 84,
    right : 1914,

}, {

    // Save map configuration
    name: "Position_Cave",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/ynqOvIh.png",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 0,
    left : 0,

    top : 943,
    right : 848,

}, {

    // Save map configuration
    name: "Position_SheriffOffice",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/kMPpXSW.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 590,
    left : 1490,

    top : 1950,
    right : 2828,

}, {

    // Save map configuration
    name: "Position_Mine",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/2j0T2C0.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 0,
    left : 0,

    top : 3471,
    right : 3277,

}, {

    // Save map configuration
    name: "Position_Hotel",
    game: "Fallout New Vegas",
    imageURL: "http://i.imgur.com/sKG9eRI.jpg",
	
    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base

    bottom : 170,
    left : 60,

    top : 4200,
    right : 4310,

}, {

    // Save map configuration
    name: "Map",
    game: "League of Legends",
    imageURL: "http://i.imgur.com/vattHJi.jpg",


    // Map player locations to their points
    // on the map. Manually offset for accuracy.
    // Multiplied to base
    top : 0,
    bottom : 0,
    left : 0,
    right : 0,
}, {
	
	name: "default",
	game: "Game Gaze",
	imageURL: "http://i.imgur.com/6ADPz34.jpg",

	top: 1000,
	bottom: 0,

	left: 0,
	right: 1000,
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
	colums : ["timestamp", "gazeX", "gazeY", "posX", "posY", "posZ", "cameraX", "cameraY"],
}];

function getListOfGames(){
  var games = _.uniq(options.mappings, function(mapping){ return mapping.game });
  games = _.map(games, function(g){ return g.game });
  return games;
}

// Available Games
options.games = getListOfGames();

