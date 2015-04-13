/*

map.js
G-Player Data Visualization

- Creates endpoint for all map-related operations

Created: April 5, 2015
Authors:
Alex Johnson @alexjohnson505
Tommy Hu @tomxhu

*/

var MapModel = require('../models/map');
var _ = require('underscore');

/* 
author: Tommy Hu
created: April 5, 2015
purpose: handles CRUD operations
contributions by: Alex Johnson
*/
module.exports = {
	post: function(req, res) {
		var map = {
			name: req.body.name,
			game: req.body.game,
			imageURL: req.body.imageURL,
			top: req.body.top,
			bottom: req.body.bottom,
			left: req.body.left,
			right: req.body.right
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
		return MapModel.findById(req.params.id, function(err, map){

			map.name = req.body.name;
			map.game = req.body.game;
			map.imageURL = req.body.imageURL;
			map.top = req.body.top;
			map.bottom = req.body.bottom;
			map.left = req.body.left;
			map.right = req.body.right;

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
                    res.send('Deleted Map ' + req.params.id);
                }
            });
        })
    },


}