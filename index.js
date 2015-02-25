var express = require('express');
var connect = require('connect')
var bodyParser = require('body-parser')
var app = express();

var api = require('./api/api');

var mongoose = require('mongoose');

// If Heroku, process env, otherwise assume localhost
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

// Initialize database connection
mongoose.connect(mongoUrl);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('db opened');
});

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



app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  response.render('index');
});

app.get('/api/entries', function (req, res){
	api.get(req, res, EntryModel)
});

app.post('/api/entry', function (req, res){
	api.post(req, res, EntryModel)
});

app.post('/api/entries', function (req, res){
	api.multiPost(req, res, EntryModel)
});


app.get('/api/entries/:id', function (req, res){
	 api.getById(req, res, EntryModel)
});

app.put('/api/entries/:id', function (req, res){
	api.put(req, res, EntryModel)
});

app.delete('/api/entries/:id', function (req, res){
	api.delete(req, res, EntryModel)
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

