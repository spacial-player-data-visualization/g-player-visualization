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