var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EntrySchema = new Schema({
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
    }
}, { strict: false });

module.exports = mongoose.model('Entry', EntrySchema);