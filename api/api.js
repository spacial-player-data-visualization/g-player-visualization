
var saveEntry = function(data, model) {
	console.log(data);
    var entry = new model({
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
}

module.exports = {
    post: function(req, res, model) {
        saveEntry(req.body, model);

        return res.send("added");
    },

    multiPost: function(req, res, model) {
    	var data = JSON.parse(req.body.entries);
    	data.entries.forEach(function(entry){
    		saveEntry(entry, model);
    	});
    	return res.send("added multi");
    },

    get: function(req, res, model) {
        return model.find(function(err, entries) {
            if (err) {
                console.log(err);
            } else {
                return res.send(entries);
            }
        });
    },

    getById: function(req, res, model) {
        return model.findById(req.params.id, function(err, entry) {
            if (err) {
                console.log(err);
            } else {
                return res.send(entry);
            }
        });
    },

    put: function(req, res, model) {
        return model.findById(req.params.id, function(err, entry) {
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

    delete: function(req, res, model) {
        return model.findById(req.params.id, function(err, entry) {
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