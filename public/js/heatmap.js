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

/* 
author: Alex Johnson
created: March 29, 2015
purpose: uses heatmapLayer configurations from above to add heatmap layer
argument: data is the current active dataset
*/
addHeatmap = function(data){

  var Heatmap = {};

  // credit: http://www.patrick-wied.at/static/heatmapjs/
  Heatmap.heatmapLayer = new HeatmapOverlay({
    "radius": .3,
    "maxOpacity": .8,
    "scaleRadius": true, 
    "useLocalExtrema": false,
    latField: 'latitude',
    lngField: 'longitude',
  });

  // Add new instance of Heatmap to settings object
  settings.heatmaps.push(Heatmap);

  // Hide the previously active Heatmap
  hideHeatmap(settings.activeHeatmap);

  // Make the newest Heatmap active
  settings.activeHeatmap = settings.heatmaps.length - 1;

  // Filter data by the positions and
  // actions that are currently selected
  var data = Visualizer.activeData(data);

  // Join selected data sets
  data = data.positions.concat(data.actions);

  console.log("\nData to be Heatmapped");
  console.log(data);

  // Initialize heatmap
  var heatmapData = { 
    max: 1,  
    data: data,
  };

  // Add heatmap
  var featureGroup = new L.FeatureGroup().addLayer(settings.heatmaps[settings.activeHeatmap].heatmapLayer);
  addFeatureGroup(featureGroup);
  settings.heatmaps[settings.activeHeatmap].heatmapLayer.setData(heatmapData);

  var bool_btn = UI.heatmaps.generateBoolBtn(settings.activeHeatmap);
  var radio_btn = UI.heatmaps.generateRadio(settings.activeHeatmap);
  var hmap_div = '<div id="heatmap' + settings.activeHeatmap + 'Btns">' + bool_btn + radio_btn + '</div>';
  $('#available-heatmaps').append(hmap_div);
  console.log("Add heatmap div: " + hmap_div);
}

hideHeatmap = function(heatmap_index) {
  map.removeLayer(settings.heatmaps[heatmap_index].heatmapLayer);
  console.log("Removed heatmap " + heatmap_index + " from the map.");
}

// Note: This function does not delete the heatmap from memory to avoid id issues
// TODO: There is a minor bug where if you delete and add several heatmaps, it will
// no long auto-update the map because the heatmap_indices are not concurrent anymore
removeHeatmap = function(heatmap_index) {
  console.log("Begin removing heatmap " + heatmap_index);

  // Set the new active heatmap
  var show = 0;
  if (heatmap_index < settings.heatmaps.length - 1) {
    show = heatmap_index + 1;
  } else {
    show = heatmap_index - 1;
  }

  $('#heatmap' + show + 'Radio').click();

  // Remove the div from the Heatmaps tab
  var id = '#heatmap' + heatmap_index + 'Btns';
  var div = $(id);
  div.remove();
  console.log("Heatmap " + heatmap_index + " removed from the Heatmaps tab.");
}