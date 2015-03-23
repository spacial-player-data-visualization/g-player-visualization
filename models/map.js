var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MapSchema = new Schema({
    area: {
        type: String,
        required: true
    },
    offsetX: {
    	type: Number,
    	required: true
    },
    offsetY: {
    	type: Number,
    	required: true
    },
    scaleX: {
    	type: Number,
    	required: true
    },
    scaleY: {
    	type: Number,
    	required: true
    },
});

module.exports = mongoose.model('Map', MapSchema);