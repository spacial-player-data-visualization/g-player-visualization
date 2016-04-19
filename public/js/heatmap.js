/*
heatmap.js
G-Player Data Visualization

- Plots current active dataset as a heatmap 
  (ex: dataset filtered by action will display heatmap of such actions 
  on selected map area)

Authors:
Alex Johnson @alexjohnson505
Alex Gimmi   @ibroadband

Created: March 29, 2015
*/

var Heatmap = {};
var id = 100;

/* 
author: Alex Johnson, Alex Gimmi
created: March 29, 2015
purpose: creates new heatmapLayer to model data
argument: data is the current active dataset
*/
Heatmap.add = function(data, heatmap_name){

  var hmap = {};
  
  // store info(in heatmap_name) into hmap.info
  hmap.info = heatmap_name;
  
  heatmap_name = "HeatMap " + Heatmap.nextId();

  // credit: http://www.patrick-wied.at/static/heatmapjs/
  hmap.heatmapLayer = new HeatmapOverlay({
    "radius": .3,
    "maxOpacity": .8,
    "scaleRadius": true, 
    "useLocalExtrema": false,
    latField: 'latitude',
    lngField: 'longitude',
  });

  // Hide the previously active heatmap
  Heatmap.hide(settings.activeHeatmap);

  // Make the newest heatmap active
  settings.activeHeatmap = id;

  // Add new instance of heatmap to settings object
  settings.heatmaps.push(hmap);

  // Add newest id to settings object
  settings.heatmapIds.push(id);

  // Index of the newest heatmap
  var index = settings.heatmaps.length - 1;

  // Try to join selected data sets (new heatmap creation)
  try {
    data = data.positions.concat(data.actions);
  } catch (e) {
    console.log("Attempting to create a new heatmap with the data as is, likely a Boolean operation.");
  }

  console.log("Data to be Heatmapped");
  console.log(data);

  // Initialize heatmap
  var hmapData = { 
    max: 1,  
    data: data,
  };

  // Save heatmap data as LatLngs
  var saveData = [];
  _.each(data, function(d) {
    var latLng = {'latitude': d['latitude'], 'longitude': d['longitude'], 'timestamp': d['timestamp']};
    saveData.push(latLng);
  })
  settings.heatmapData.push(saveData);

  // Add heatmap
  var featureGroup = new L.FeatureGroup().addLayer(settings.heatmaps[index].heatmapLayer);
  addFeatureGroup(featureGroup);
  settings.heatmaps[index].heatmapLayer.setData(hmapData);

  var bool_btn = UI.heatmaps.generateBoolBtn(settings.activeHeatmap);
  var radio_btn = UI.heatmaps.generateRadio(settings.activeHeatmap, heatmap_name);
  var hmap_div = '<div id="heatmap' + settings.activeHeatmap + 'Div">' + bool_btn + radio_btn + '</div>';
  $('#available-heatmaps').append(hmap_div);
  console.log("New heatmap added at index " + index + " with id " + id);
}//asarsa

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: hides the active heatmap from the map
argument: heatmap_id is the id of the currently selected heatmap
*/
Heatmap.hide = function(heatmap_id) {
  if (_.contains(settings.heatmapIds, heatmap_id)) {
    var index = Heatmap.getIndexFromId(heatmap_id);
    map.removeLayer(settings.heatmaps[index].heatmapLayer);
    console.log("Hid heatmap at index " + index + " with id " + heatmap_id + " from the map.");
  }
}

/* 
author: Alex Gimmi
created: June 15, 2015
purpose: removes the active heatmap from the map, heatmaps tab, and memory
argument: heatmap_id is the id of the currently selected heatmap
*/
Heatmap.remove = function(heatmap_id) {
  var index = Heatmap.getIndexFromId(heatmap_id);
  console.log("Begin removing heatmap at index " + index);

  // Set the new active heatmap
  var show = 0;
  if (settings.heatmaps.length == 1) {
    show = -1;
	Heatmap.hide(index);
  } else if (index < settings.heatmaps.length - 1) {
    show = index ;
  } else {
    show = index - 1;
  }
  
  //console.log("hm" + index + "  " + show);
  
  // Remove the div from the Heatmaps tab
  var id = '#heatmap' + heatmap_id + 'Div';
  var div = $(id);
  div.remove();

  // Remove the heatmap from memory
  settings.heatmaps.splice(index, 1);
  settings.heatmapIds.splice(index, 1);
  settings.heatmapData.splice(index, 1);

  // Remove the heatmap from the Boolean operation tab if it's there
  UI.boolops.remove(heatmap_id);

  console.log("Heatmap at index " + index + " with id " + heatmap_id + " removed from the Heatmaps tab and from memory.");

  //update the selected radio button
  if (show >= 0) {
    $('#heatmap' + settings.heatmapIds[show] + 'Radio').click();
  }

  Visualizer.refresh();
}

/* 
author: Asarsa
created: March 04, 2016
purpose: fetches info for heatmap
argument: heatmap_id is the id of the currently selected heatmap
*/
Heatmap.showInfo = function(heatmap_id) {
	console.log("showing info...");
  if (_.contains(settings.heatmapIds, heatmap_id)) {
    var index = Heatmap.getIndexFromId(heatmap_id);
	//console.log(settings.heatmaps[index].info);
    alert(settings.heatmaps[index].info);
  }
}

Heatmap.download = function(heatmap_id) {
  if (_.contains(settings.heatmapIds, heatmap_id)) {
    var index = Heatmap.getIndexFromId(heatmap_id);
    var info = settings.heatmaps[index].info;
	var name = heatmap_id;
	
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:application/octet-stream,' + encodeURI(info);
	hiddenElement.target = '_blank';
	hiddenElement.download = name + '.hmap';
	hiddenElement.click();
  }
}//Asarsa

Heatmap.getIndexFromId = function(heatmap_id) {
  return _.indexOf(settings.heatmapIds, parseInt(heatmap_id));
}

// Generates ids for heatmaps starting from 0
Heatmap.nextId = function() {
  return ++id;
}

