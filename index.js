var express = require('express');
var connect = require('connect')
var bodyParser = require('body-parser')
var app = express();

var api = require('./api/api');

var mongoose = require('mongoose');
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/test';
mongoose.connect(mongoUrl);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('db opened');
});



app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  response.render('index');
});

app.get('/api/entries', api.get);

app.post('/api/entries', api.post);

app.get('/api/entries/:id', api.getById);

app.put('/api/entries/:id', api.put);

app.delete('/api/entries/:id', api.delete);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

