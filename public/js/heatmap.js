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
created: March 29, 2015
purpose: uses heatmapLayer configurations from above to add heatmap layer
*/
Heatmap.addHeatmap = function(data){

  var heatmapData = { 
      max: 1,  
      data: data,
  };

  map.addLayer(Heatmap.heatmapLayer)
  Heatmap.heatmapLayer.setData(heatmapData);
}
