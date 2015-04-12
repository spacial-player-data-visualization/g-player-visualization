/*

key_mapping.js
G-Player Data Visualization

- Schema for Key Mappings for the Mongo database

Created: March 22, 2015
Authors:
Tommy Hu @tomxhu

*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KeyMappingSchema = new Schema({
    game: {
        type: String,
        required: true
    },
    type: {
    	type: String
    },
    label: {
    	type: String
    },
    keys: {
    	type: Array,
        required: true
    }
});

module.exports = mongoose.model('KeyMapping', KeyMappingSchema);