
/****************************************************

  G­Player: Visualization of Spatial­-temporal Play Data
 
  Created in association with Truong-Huy D. Nguyen, 
    
  MIT License. Code available at:
  github.com/spacial-player-data-visualization/g-player-visualization

 ****************************************************/

// Load dependencies
var express = require('express');
var connect = require('connect')
var bodyParser = require('body-parser')

// Create an express app
var app = express();

// Increase the size of accepted POST requests
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

// Determine database URL from current environment.
// MondoDB will direct at Heroku or Localhost depending
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

// Initialize database connection
var mongoose = require('mongoose');
mongoose.connect(mongoUrl);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.on('error', function callback(){
  console.log('\nEnsure that you are running a database. \nYou may need to start one with "$ sudo mongod" \nPlease see our README.md for more info. ')
});

db.once('open', function callback () {
  console.log('Initialized Connection with MongoDB.\n');
});

var EntryModel = require('./models/entries');

/****************************
      SERVER SETTINGS
 ****************************/

// Initialize the port
app.set('port', (process.env.PORT || 5000));

// Support service static HTML from /public directory
app.use(express.static(__dirname + '/public'));

// Enable body parsing for incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

/****************************
       CONTROLLERS 
 ****************************/

// Require entries controller
var entries = require('./api/entries');
var maps = require('./api/map');

/****************************
         ROUTES 
 ****************************/

// INDEX
app.get('/', function(request, response) {
  console.log("\nGET index")
  response.render('index');
});

// Entry Endpoints

// Create an Entry
app.post('/api/entry', function (req, res){
    console.log("\nPOST api/entry");
    entries.post(req, res, EntryModel);
});

// Get Multiple Entries
app.get('/api/entries', function (req, res){
	entries.get(req, res);
});

// Create Multiple Entries
app.post('/api/entries', function (req, res){
    console.log("\nPOST api/entries");
    entries.multiPost(req, res);
});

// Get a Specific Entry
app.get('/api/entries/:id', function (req, res){
    console.log("\nGET api/entries/id");
	entries.getById(req, res);
});

// TIMESTAMP
app.get('/api/timestamp/:time', function (req, res){
  entries.query(req, res);
})

// Get list of unique users
app.get('/api/players/', function (req, res){
  entries.getPlayers(req, res);
});

// Get list of unique actions
app.get('/api/actions/', function (req, res){
  entries.getActions(req, res);
});

// Map Endpoint

app.post('/api/maps', function (req, res){
  maps.post(req, res);
});

app.get('/api/maps', function (req, res){
  maps.get(req, res);
});

app.put('/api/maps/:id', function (req, res){
  maps.put(req, res);
});

app.delete('/api/maps/:id', function (req, res){
  maps.delete(req, res);
});

/****************************
        START SERVER
 ****************************/

app.listen(app.get('port'), function() {
  console.log("\nAPI Running at localhost:" + app.get('port'));
});

