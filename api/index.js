var express = require('express');
var connect = require('connect')
var bodyParser = require('body-parser')
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema;

var Entry = new Schema({
  area: {type: String},
  playerID: {type: Number},
  timestamp: {type: Number},
  posX: {type: Number},
  posY: {type: Number},
  cameraX: {type: Number},
  cameraY: {type: Number}
});

var EntryModel = mongoose.model('Entry', Entry);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/api/entries', function (req, res){
  return EntryModel.find(function (err, entries) {
    if (err) {
      console.log(err);
    } else {
      return res.send(entries);
    }
  });
});

app.post('/api/entries', function (req, res){
  console.log(req.body.playerID);
  var entry = new EntryModel({
    area: req.body.area,
    playerID: req.body.playerID,
    timestamp: req.body.timestamp,
    posX: req.body.posX,
    posY: req.body.posY,
    cameraX: req.body.cameraX,
    cameraY: req.body.cameraY
  });

  entry.save(function (err){
    if (err) {
      console.log(err);
    } else {
      return console.log('saved');
    }
  });

  return res.send(entry);
});

app.get('/api/entries/:id', function (req, res){
  return EntryModel.findById(req.params.id , function (err, entry){
    if (err) {
      console.log(err);
    } else {
      return res.send(entry);
    }
  });
});

app.put('/api/entries/:id', function (req, res){
  return EntryModel.findById(req.params.id, function (err, entry){
    entry.area = req.body.area;
    entry.playerID = req.body.playerID;
    entry.timestamp = req.body.timestamp;
    entry.posX = req.body.posX;
    entry.posY = req.body.posY;
    entry.cameraX = req.body.cameraX;
    entry.cameraY = req.body.cameraY;
    return entry.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('updated');
      }
      return res.send(entry);
    });
  })
});

app.delete('/api/entries/:id', function (req, res){
  return EntryModel.findById(req.params.id, function (err, entry){
    return entry.remove(function (err){
      if (err) {
        console.log(err);
      } else {
        console.log('deleted')
        res.send('Deleted');
      }
    });
  })
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

