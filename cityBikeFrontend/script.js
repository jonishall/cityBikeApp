var features = []; //global variable that will contain all the points that will be drawn on the map
const searchbutton = document.getElementById("searchbutton");  // only real button that is always usable, so global variable.

// initializing map view
fetch('http://localhost:3000/api/stations')  //fetch the data from the backend
  .then(response => response.json())
  .then(data => {
    for(let i = 0; i < data.length; i++){
      var point = new ol.geom.Point(ol.proj.fromLonLat([data[i].x, data[i].y]));
      // Create a new feature with the point geometry and add it to the global features variable
      features.push(new ol.Feature({
        geometry: point,
        name: data[i].Nimi
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

    // find station info when clicking a map point
    map.addInteraction(selectInteraction);
    selectInteraction.on('select', function(event) {
      var feature = event.selected[0];
      if (feature) {
        var name = feature.get('name');
        // call the station with the name
       loadStations([`stationName=${feature.values_.name}`]);
       loadJourneys([`stationName=${feature.values_.name}`, `orderBy=Dname`]);
       loadSingleStationView(feature.values_.name);
      }
   })
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

// loads a list of journeys by parameter and displays them in journeys table
function loadJourneys(input){
  let query = 'http://localhost:3000/api/journeys';
  let jlist = document.getElementById('journeylist');
  jlist.innerHTML = `<tr>
                      <th>Departure station</th>
                      <th>Return station</th>
                      <th>Distance (km)</th>
                      <th>Duration (min)</th>
                      </tr>`;
  let pholder = '';
  //check for parameters
  if(input.length > 0){
    query += '?';
    for(let i = 0; i < input.length; i++){
      query += input[i]+'&';
    }
  }
  // display data in the table created for journeys
  fetch(query)
  .then(response => response.json())
  .then(data => {
  for(let i = 0; i < data.length; i++){
    pholder += `<tr>
                  <td> ${data[i].Dname} </td>
                  <td> ${data[i].Rname} </td>
                  <td> ${((data[i].Distance)/1000).toFixed(2)} </td>
                  <td> ${((data[i].Duration)/60).toFixed(2)} </td>
                  <td>
                </tr>`;
    }
    jlist.innerHTML += pholder;
  });
}


//same as loadJourneys but for stations
function loadStations(input){
  let query = 'http://localhost:3000/api/stations';
  let slist = document.getElementById('stationlist');
  slist.innerHTML = `<tr>
                      <th>Station Name</th>
                    </tr>`
  let pholder = '';
  //check for parameters
  if(input.length > 0){
    query += '?';
    for(let i = 0; i < input.length; i++){
      query += input[i]+'&';
    }
  }
  // display data in the table created for stations
  fetch(query)
  .then(response => response.json())
  .then(data => {
    for(let i = 0; i < data.length; i++){
      pholder += `<tr>
                    <td> <a href="#" class="station-link" stationx=${data[i].x} stationy=${data[i].y}> ${data[i].Nimi} </a> </td>
                  </tr>`;
      }
      slist.innerHTML += pholder;
      // make all station names clickable with appropriate function
      const stationLinks = document.querySelectorAll(".station-link");
        stationLinks.forEach(link => {
          link.addEventListener("click", function(event) {
            event.preventDefault();
            const stationName = link.innerText;
            loadJourneys([`stationName=${stationName}`]);
            // center map to the selected station
            var newCenter = ol.proj.fromLonLat([link.getAttribute("stationx"), link.getAttribute("stationy")]);
            map.setView(new ol.View({
              center: newCenter,
              zoom: 14
          }));
          // highlight the selected station
          var vectorLayer = map.getAllLayers()[1];
          var features = vectorLayer.getSource().getFeatures();
          features.forEach(function(feature) {
            if (feature.get('name') === stationName) {
              feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                  src: 'https://openlayers.org/en/latest/examples/data/icon.png',
                  scale: 1.2,
                  color: 'red'
                })
              }));
            }
          });
          loadSingleStationView(stationName);
      });
    });
  });
}


//loads single station view with station name, coordinates and averages
function loadSingleStationView(stationName){
  let stationview = document.getElementById("stationview");
  stationview.innerHTML = '';
  stationview.style.display = 'block';
  fetch(`http://localhost:3000/api/stations?stationName=${stationName}`)
  .then(response=> response.json())
  .then(data => {
    stationview.innerHTML += `${data[0].Nimi} <br> Coordinates: ${data[0].x}, ${data[0].y} `;
    fetch(`http://localhost:3000/api/journeys?stationName=${stationName}&count`)
    .then(response=> response.json())
    .then(data => {
      stationview.innerHTML += `<br>Departures: ${data[0]["COUNT(*)"]} Returns: ${data[1]["COUNT(*)"]}`;
      fetch(`http://localhost:3000/api/avg?stationName=${stationName}`)
      .then(response=> response.json())
      .then(data => {
        stationview.innerHTML += `<br>Average distance of departure journeys: ${data[0]["AVG(Distance)"].toFixed(2)} <br>
        Average distance of return journeys: ${data[1]["AVG(Distance)"].toFixed(2)}`;
      });
    });
  });
}

// initialize the journeys table with default, unsorted page 1
loadJourneys([]);
// initialize the stations table
loadStations([]);

// search interface function, gets the parameters from the table and calls loadJourneys and loadStations
searchbutton.addEventListener('click', ()=> {
  let param = [];
  const stationName = document.getElementById('stationName').value;
  const orderBy = document.getElementById('orderBy').value;
  const pageNum = document.getElementById('pageNum').value;
  if(stationName.length > 0){
    param.push(`stationName=${stationName}`);
  }
  if(orderBy != 'None'){
    param.push(`orderBy=${orderBy}`);
  }
  if(pageNum !=1 ){
    param.push(`pageNum=${pageNum}`);
  }
  loadJourneys(param);
  loadStations([`stationName=${stationName}`]);
});
