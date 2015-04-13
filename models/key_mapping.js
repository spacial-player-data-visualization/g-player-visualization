var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KeyMappingSchema = new Schema({
    game: {
        type: String,
        required: true
    },
    type: {
    	type: String,
        required: true
    },
    actions: {
    	type: Array
    },
    columns: {
    	type: Array,
        required: true
    }
});

module.exports = mongoose.model('KeyMapping', KeyMappingSchema);