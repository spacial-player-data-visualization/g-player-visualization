/*

entries.js
G-Player Data Visualization

- Schema for Data entries for the Mongo database

Created: March 1, 2015
Authors:
Tommy Hu @tomxhu

*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EntrySchema = new Schema({
    game: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    playerID: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    posX: {
        type: Number,
        required: true
    },
    posY: {
        type: Number,
        required: true
    },
    action: {
        type: String
    }
}, { strict: false });

module.exports = mongoose.model('Entry', EntrySchema);
