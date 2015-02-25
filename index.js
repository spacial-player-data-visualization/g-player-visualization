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

// Determine database URL from current environment.
// MondoDB will direct at Heroku or Localhost depending
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

// Initialize database connection
var mongoose = require('mongoose');
mongoose.connect(mongoUrl);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', function callback () {
  console.log('Initialized Connection with MongoDB.\n');
});

// Initialize the port
app.set('port', (process.env.PORT || 5000));

// Support service static HTML from /public directory
app.use(express.static(__dirname + '/public'));

// Enable body parsing for incoming requests
app.use(bodyParser.urlencoded({ extended: true }));


/****************************
         SCHEMAS 
 ****************************/

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

/****************************
       CONTROLLERS 
 ****************************/

// Require entries controller
var entries = require('./api/entries');

/****************************
         ROUTES 
 ****************************/

// INDEX
app.get('/', function(request, response) {
  console.log("\nGET index")
  response.render('index');
});

// ENTRY
// app.post('/api/entry', function (req, res){
//     console.log("\nPOST api/entry");
//     entries.post(req, res, EntryModel);
// });

// ENTRIES
app.get('/api/entries', function (req, res){
    console.log("\nGET api/entries");
	entries.get(req, res, EntryModel);
});

app.post('/api/entries', function (req, res){
    console.log("\nPOST api/entries");
	entries.multiPost(req, res, EntryModel);
});

app.get('/api/entries/:id', function (req, res){
    console.log("\nGET api/entries/id");
	entries.getById(req, res, EntryModel);
});

// app.put('/api/entries/:id', function (req, res){
//     console.log("\nPUT api/entries");
// 	entries.put(req, res, EntryModel);
// });

// app.delete('/api/entries/:id', function (req, res){
//     console.log("\nDELETE api/entries");
// 	entries.delete(req, res, EntryModel);
// });

app.listen(app.get('port'), function() {
  console.log("\nAPI Running at localhost:" + app.get('port'));
});

