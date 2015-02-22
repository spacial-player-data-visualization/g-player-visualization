var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Entry = new Schema({
    area: {
        type: String
    },
    playerID: {
        type: Number
    },
    timestamp: {
        type: Number
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

var EntryModel = mongoose.model('Entry', Entry);

module.exports = {
    post: function(req, res) {
        var entry = new EntryModel({
            area: req.body.area,
            playerID: req.body.playerID,
            timestamp: req.body.timestamp,
            posX: req.body.posX,
            posY: req.body.posY,
            cameraX: req.body.cameraX,
            cameraY: req.body.cameraY
        });

        entry.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                return console.log('saved');
            }
        });

        return res.send(entry);
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
    }

}