var EntryModel = require('../models/entries');
var _ = require('underscore');

var saveEntry = function(data) {
    EntryModel.find({playerID: data.playerID, timestamp: data.timestamp}, function(err, result){
        if (err) {
            console.log(err);
        } else {
            if (!result.length){
                var entry = new EntryModel({
                    area: data.area,
                    playerID: data.playerID,
                    timestamp: data.timestamp,
                    posX: data.posX,
                    posY: data.posY,
                    cameraX: data.cameraX,
                    cameraY: data.cameraY
                });

                entry.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return console.log('saved');
                    }
                });
            } else {
                console.log('already added');
            }
        }
    });
    
}

module.exports = {
    post: function(req, res) {
        saveEntry(req.body);
        return res.send("added");
    },

    multiPost: function(req, res) {

        // Extract DATA from request body
    	var data = JSON.parse(req.body.entries);

        console.log("\nMulti-Post Request");
        console.log(req.body.entries);

    	data.forEach(function(entry){
    		saveEntry(entry);
    	});
        
    	return res.send("added multi");
    },

    get: function(req, res) {
        return EntryModel.find({game: req.game, map: req.map}, function(err, entries) {
            if (err) {
                console.log(err);
            } else {
                var index = 0;
                return _.filter(entries, function(entry){
                    if (entry.area) {
                        if (index % req.fidelity == 0){
                            return true;
                        }
                        index += 1;
                    } else {
                        // if not a position value, return everything
                        return true
                    }
                });
            }
        });
    },

    getById: function(req, res) {
        return EntryModel.findById(req.params.id, function(err, entry) {
            if (err) {
                console.log(err);
            } else {
                return res.send(entry);
            }
        });
    },

    put: function(req, res) {
        return EntryModel.findById(req.params.id, function(err, entry) {
            
            entry.area = req.body.area;
            entry.playerID = req.body.playerID;
            entry.timestamp = req.body.timestamp;
            entry.posX = req.body.posX;
            entry.posY = req.body.posY;
            entry.cameraX = req.body.cameraX;
            entry.cameraY = req.body.cameraY;

            return entry.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('updated');
                }
                return res.send(entry);
            });
        })
    },

    delete: function(req, res) {
        return EntryModel.findById(req.params.id, function(err, entry) {
            return entry.remove(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('deleted')
                    res.send('Deleted');
                }
            });
        })
    },

    query: function(req, res) {
        return EntryModel.find({timestamp: req.params.time}, function(err, result){
            if (err) {
                    console.log(err);
                } else {
                    console.log('query')
                    res.send(result);
                }
        });
    },

    getUsers : function(req, res) {
        return EntryModel.find().distinct('playerID', function(err, result){
            if (err) {
                console.log(err);
            } else {
                console.log('getUsers');
                res.send(result);
            }
        });
    },

    getActions : function(req, res){
        var actions = [];

        var game = req.params.game;

        actions.push("NPC");
        actions.push("Rat");
        actions.push("Pickup");

        return res.send(actions);
    },

}