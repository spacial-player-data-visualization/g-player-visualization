var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EntrySchema = new Schema({
    area: {
        type: String
    },
    playerID: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    posX: {
        type: Number
    },
    posY: {
        type: Number
    },
    cameraX: {
        type: Number
    },
    cameraY: {
        type: Number
    }
});

module.exports = mongoose.model('Entry', EntrySchema);