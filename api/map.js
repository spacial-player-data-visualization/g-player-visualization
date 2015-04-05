var MapModel = require('../models/map');
var _ = require('underscore');

module.exports = {
	post: function(req, res) {
		var map = {
			name: req.body.name,
			game: req.body.game,
			imageURL: req.body.imageURL,
			topLeft: req.body.topLeft,
			bottomRight: req.body.bottomRight
		}

		var mapModel = new MapModel(map);

		mapModel.save(function(err) {
			if (err) {
				console.log(err);
			} else {
				return console.log('saved');
			}
		});

		res.send('added');
	},
	get: function(req, res) {
		return MapModel.find({}, function(err, maps){
			if (err) {
				console.log(err);
			} else {
				return res.send(maps);
			}
		})
	},
	put: function(req, res) {
		console.log(req.params.id);
		return MapModel.findById(req.params.id, function(err, map){

			map.name = req.body.name;
			map.game = req.body.game;
			map.imageURL = req.body.imageURL;
			map.topLeft = req.body.topLeft;
			map.bottomRight = req.body.bottomRight;
			
			return map.save(function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('map updated')
				}
				return res.send(map);
			});
		});
	},
	delete: function(req, res) {
        return MapModel.findById(req.params.id, function(err, map) {
            return map.remove(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('deleted')
                    res.send('Deleted Map ' + req.params.id);
                }
            });
        })
    },


}