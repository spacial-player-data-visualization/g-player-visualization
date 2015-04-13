/*

map.js
G-Player Data Visualization

- Schema for the Map for the Mongo database

Created: March 22, 2015
Authors:
Tommy Hu @tomxhu

*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MapSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    top: {
    	type: Number,
    	required: true
    },
    bottom: {
    	type: Number,
    	required: true
    },
    left: {
        type: Number,
        required: true
    },
    right: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('Map', MapSchema);