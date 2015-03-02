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
	entries.get(req, res);
});

app.post('/api/entries', function (req, res){
    console.log("\nPOST api/entries");
    entries.multiPost(req, res);
});

app.get('/api/entries/:id', function (req, res){
    console.log("\nGET api/entries/id");
	entries.getById(req, res);
});

app.get('/api/timestamp/:time', function (req, res){
  entries.query(req, res);
})

// app.put('/api/entries/:id', function (req, res){
//     console.log("\nPUT api/entries");
// 	entries.put(req, res);
// });

// app.delete('/api/entries/:id', function (req, res){
//     console.log("\nDELETE api/entries");
// 	entries.delete(req, res);
// });

app.listen(app.get('port'), function() {
  console.log("\nAPI Running at localhost:" + app.get('port'));
});

