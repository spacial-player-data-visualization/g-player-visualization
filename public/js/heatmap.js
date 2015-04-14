/*
heatmap.js
G-Player Data Visualization

- Plots current active dataset as a heatmap 
  (ex: dataset filtered by action will display heatmap of such actions 
  on selected map area)

Authors:
Alex Johnson @alexjohnson505

Created: March 29, 2015
*/
var Heatmap = {};

// credit: http://www.patrick-wied.at/static/heatmapjs/
Heatmap.heatmapLayer = new HeatmapOverlay({
  "radius": .5,
  "maxOpacity": .8,
  "scaleRadius": true, 
  "useLocalExtrema": false,
  latField: 'latitude',
  lngField: 'longitude',
});

/* 
author: Alex Johnson
created: March 29, 2015
purpose: uses heatmapLayer configurations from above to add heatmap layer
argument: data is the current active dataset
*/
Heatmap.addHeatmap = function(data){

  // Filter data by the positions and
  // actions that are currently selected
  var data = selectedData(data);

  // Join selected data sets
  // var data = data.positions.concat(data.actions);
  data = data.actions;

  console.log("\nData to be Heatmapped");
  console.log(data);

  // Initialize heatmap
  var heatmapData = { 
      max: 1,  
      data: data,
  };

  // Add heatmap
  map.addLayer(Heatmap.heatmapLayer)
  Heatmap.heatmapLayer.setData(heatmapData);
}
