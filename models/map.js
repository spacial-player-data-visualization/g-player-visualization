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
    topLeft: {
    	type: Number,
    	required: true
    },
    bottomRight: {
    	type: Number,
    	required: true
    },
});

module.exports = mongoose.model('Map', MapSchema);