var EntryModel = require('../models/entries');
var _ = require('underscore');
var Q = require('q');

// save entry helper
var saveEntry = function(data) {
    var deferred = Q.defer();
    var tempObj = {
        game: data.game,
        area: data.area,
        playerID: data.playerID,
        timestamp: data.timestamp,
        posX: data.posX,
        posY: data.posY,
    }
    
    // gets the rest of the key
    var restKeys = _.chain(data)
    .omit(['game', 'area', 'playerID', 'timestamp', 'posX', 'posY'])
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
            deferred.resolve(console.log('saved'));
        }
    });

    return deferred.promise;
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
        // console.log(req.body.entries);

        var promises = []

    	data.forEach(function(entry){
    		promises.push(saveEntry(entry));
    	});
        Q.all(promises).done(function(){
            return res.send("added multi");
        });
    },

    get: function(req, res) {

        var game = req.query.game;
        var area = req.query.area;
        var fidelity = req.query.fidelity;
        var playerIDs = req.query.playerIDs || [];

        if (!game || !area) {
            return res.status(500).send('Missing parameters. Endpoint requires "game" and "area"');
        }
        

        return EntryModel.find({game: game, area: area, playerID: {$in: playerIDs}}, function(err, entries) {

            console.log("\nGET entries for " + area + " of " + game + " | " + entries.length + " entries.")
            
            if (err) {

                console.log(err);

            } else {

                if (!fidelity || fidelity < 2){
                    return res.send(entries);
                
                // If user specified a data fidelity
                } else {

                var index = 0;

                // Filter entries by fidelity. Restrict number
                // of datapoints per second being returned
                var filteredResults = _.filter(entries, function(entry){

                    // Filter any POSITIONS.
                    // Exlude actions from being removed.
                    if (!entry.action) {

                        if ((index % fidelity) == 0){
                            index += 1;
                            return true;
                        }

                        index += 1;

                    } else {

                        // if not a position value, 
                        // return everything
                        return true;
                    }
                });

                return res.send(filteredResults);

                }
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

    // delete: function(req, res) {
    //     return EntryModel.findById(req.params.id, function(err, entry) {
    //         return entry.remove(function(err) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log('deleted')
    //                 res.send('Deleted Entry ' + req.params.id);
    //             }
    //         });
    //     })
    // },

    // query: function(req, res) {
    //     return EntryModel.find({timestamp: req.params.time}, function(err, result){
    //         if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log('query')
    //                 res.send(result);
    //             }
    //     });
    // },

    getPlayers : function(req, res) {

        var game = req.query.game;
        var actions = req.query.actions;

        var playersThatDidActions = []

        var promises = [];

        if (!game) {
            return res.status(500).send('Missing parameter: "game"');
        }

        if (!actions) { 
            return EntryModel.find({game: game}).distinct('playerID', function(err, result){
                if (err) {
                    console.log(err);
                } else {
                    console.log('getUsers with no actions');
                    res.send(result);
                }
            });
        }

        actions.forEach(function(action){
            promises.push(createFindPromise(action));
        });

        function createFindPromise(action) {
            
            var deferred = Q.defer();

            EntryModel.find({game: game, action: action}).distinct('playerID', function(err, result){
                if (err) {
                    console.log(err);
                } else {
                    deferred.resolve(playersThatDidActions.push(result));
                }
            });

            return deferred.promise;
        }

        Q.all(promises).done(function(){
           return res.send(_.intersection.apply(_, playersThatDidActions));
        });
    },

    getActions : function(req, res){
        var game = req.query.game;

        if (!game) {
            return res.status(500).send('Missing parameter: "game"');
        }

        return EntryModel.find({game: game}).distinct('action', function(err, result){
            if (err) {
                console.log(err);
            } else {
                console.log('\nGET Actions | ' + result.length + ' results');
                res.send(result);
            }
        });
    },

}
