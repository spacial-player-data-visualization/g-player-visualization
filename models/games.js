/*

games.js
G-Player Data Visualization

- Schema for Games for the Mongo database

Created: March 22, 2015
Authors:
Tommy Hu @tomxhu

*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Game', GameSchema);