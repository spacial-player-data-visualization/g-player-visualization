var EntryModel = require('../models/entries');
var _ = require('underscore');

// save entry helper
var saveEntry = function(data) {
    EntryModel.find({playerID: data.playerID, timestamp: data.timestamp}, function(err, result){
        if (err) {
            console.log(err);
        } else {
            if (!result.length){

                var tempObj = {
                    area: data.area,
                    playerID: data.playerID,
                    timestamp: data.timestamp,
                    posX: data.posX,
                    posY: data.posY,
                }
                
                // gets the rest of the key
                var restKeys = _.chain(data)
                                .omit(['area', 'playerID', 'timestamp', 'posX', 'posY'])
                                .keys()
                                .value();

                restKeys.forEach(function(key) {
                    tempObj[key] = data[key]
                });
                console.log(tempObj);
                var entry = new EntryModel(tempObj);

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
        return EntryModel.find(function(err, entries) {
            if (err) {
                console.log(err);
            } else {
                return res.send(entries);
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
        return EntryModel.find().distinct('action', function(err, result){
            if (err) {
                console.log(err);
            } else {
                console.log('getAction');
                res.send(result);
            }
        });
    },

}