
/************************************
       Heatmap Logic
************************************/

var Heatmap = {};

// http://www.patrick-wied.at/static/heatmapjs/
Heatmap.heatmapLayer = new HeatmapOverlay({
  "radius": .5,
  "maxOpacity": .8,
  "scaleRadius": true, 
  "useLocalExtrema": false,
  latField: 'latitude',
  lngField: 'longitude',
});


Heatmap.addHeatmap = function(data){

  var heatmapData = { 
      max: 1,  // No idea what this does
      data: data,
  };

  map.addLayer(MAP.heatmapLayer)
  MAP.heatmapLayer.setData(heatmapData);
}

