var features=[]; //global variable that will contain all the points that will be drawn on the map

fetch('http://localhost:3000/api/stations')  //fetch the data from the backend
  .then(response => response.json())
  .then(data => {
    for(let i=0; i<data.length; i++){
      var point = new ol.geom.Point(ol.proj.fromLonLat([data[i].x, data[i].y]));
      // Create a new feature with the point geometry and add it to the global features variable
      features.push( new ol.Feature({
        geometry: point
      }));
    }
    // Create a vector layer and add the features to it
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
      })
    });
    map.addLayer(vectorLayer); //add the layer of points to the map

    // Create a select interaction with a custom style function, so you can select a station
    var selectInteraction = new ol.interaction.Select({
      style: function(feature) {
        return new ol.style.Style({
          image: new ol.style.Icon({
            src: 'https://openlayers.org/en/latest/examples/data/icon.png',
            scale: 1.2,
            color: feature === selectInteraction.getFeatures().getArray()[0] ? 'red' : 'white'
          })
        });
      }
    });
    map.addInteraction(selectInteraction);
  })
  .catch(error => {
    // handle the error
    console.error(error);
  });

  var map = new ol.Map({
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([24.945831, 60.212059]), // center the map to Helsinki
      zoom: 10.8
    })
  });

var osmSource = new ol.source.OSM();
var osmLayer = new ol.layer.Tile({
  source: osmSource
});
map.addLayer(osmLayer);
