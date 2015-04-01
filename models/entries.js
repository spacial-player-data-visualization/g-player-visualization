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
        type: Number,
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