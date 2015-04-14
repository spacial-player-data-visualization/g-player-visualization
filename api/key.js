/*

key.js
G-Player Data Visualization

- Creates endpoint for all CRUD operations on kay mappings

Created: April 13, 2015
Authors:
Tommy Hu @tomxhu

*/
var KeyModel = require('../models/key_mapping.js');
var _ = require('underscore');

/* 
author: Tommy Hu
created: April 13, 2015
purpose: handles CRUD operations
*/
module.exports = {
	post: function(req, res) {
		console.log(req.body);
		var key = {
			game: req.body.game,
			type: req.body.type,
			actions: req.body.actions,
			columns: req.body.columns,
		}

		var keyModel = new KeyModel(key);

		keyModel.save(function(err) {
			if (err) {
				console.log(err);
			} else {
				return console.log('saved');
			}
		});

		res.send('added');
	},
	get: function(req, res) {
		return KeyModel.find({}, function(err, keys){
			if (err) {
				console.log(err);
			} else {
				return res.send(keys);
			}
		})
	},
	put: function(req, res) {
		return KeyModel.findById(req.params.id, function(err, key){

			key.game = req.body.game;
			key.type = req.body.type;
			key.actions = req.body.actions;
			key.columns = req.body.columns;

			return key.save(function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('key updated')
				}
				return res.send(key);
			});
		});
	},
	delete: function(req, res) {
        return KeyModel.findById(req.params.id, function(err, key) {
            return key.remove(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send('Deleted Key ' + req.params.id);
                }
            });
        })
    },


}