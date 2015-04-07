var mongoose = require('mongoose');
var should = require('should');
var request = require('supertest');
var EntryModel = require('../models/entries');
var entries = require('../api/entries');
var url = 'localhost:5000/api'

describe('API Tests', function() {
	before(function(done) {
		mongoose.connect('mongodb://localhost/test');
		EntryModel.remove({}, function(err) { 
   			console.log('collection removed') 
		});				
		done();		
	});


	it('should respond with an empty array', function(done){
		request(url)
		.get('/entries')
		.expect(200)
		.end(function(err, res){
			if (err) return done(err);
			res.body.should.be.empty
			done();
		});
	})

	it('should post data with no errors', function (done) {
		var testObj = {
			game: 'test game',
			area: 'test area',
			playerID: 123,
			timestamp: 123,
			posX: 123,
			posY: 123,
			action: 'test action'
		}
		request(url)
		.post('/entry')
		.send(testObj)
		.expect(200)
		.end(function(err, res) {
			if (err) {
				throw err;
			}
			done();
		});
	});

	it('should respond with data after post', function(done){
		request(url)
		.get('/entries?game=test+game&area=test+area&playerIDs[]=123')
		.expect(200)
		.end(function(err, res){
			if (err) return done(err);
			res.body[0].game.should.be.equal('test game');
			res.body[0].area.should.be.equal('test area');
			res.body[0].playerID.should.be.equal(123);
			res.body[0].timestamp.should.be.equal(123);
			res.body[0].posX.should.be.equal(123);
			res.body[0].posY.should.be.equal(123);
			res.body[0].action.should.be.equal('test action');

			done();

		});
	});

	it('should respond playerIDs', function(done){
		request(url)
		.get('/players?game=test+game&actions[]=test+action')
		.expect(200)
		.end(function(err, res){
			if (err) return done(err);

			res.body[0].should.be.equal(123);

			done();
		});
	});

	it('should respond with actions', function(done){
		request(url)
		.get('/actions?game=test+game')
		.expect(200)
		.end(function(err, res){
			if (err) return done(err);

			res.body[0].should.be.equal('test action');

			done();
		});
	});


})