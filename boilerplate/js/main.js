// Add all scripts to the JS folder

//declares map var in global scope
var map;
//function that creates the Leaflet map
function createMap(){
    //creates the map
    map = L.map('map', {
        center: [36.5, -120],
        zoom: 5.85
    });

    //adds my own Monarch base tilelayer 
    L.tileLayer('https://api.mapbox.com/styles/v1/kkoehler4/ckzyymsrb000y15joz612q9br/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia2tvZWhsZXI0IiwiYSI6ImNrdjZza3psZjlkMHcyb2s2ZzVxbzV6YjQifQ.OfaWlujeGgvfX7xd7eg9xA', {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //calls getData function
    getData();
};

//function that attaches popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function that retrieves data from my monarchData.geojson file and places it on the map
function getData(){
    //retrieves the data
    fetch("data/monarchData.geojson")
        //converts data to a usable form
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //styles the circle markers  
            var geojsonMarkerOptions = {
                radius: 10,
                fillColor: "#00000",
                color: "#DD9F76",
                weight: 1.5,
                opacity: 0.5,
                fillOpacity: 1
            };

            //creates a Leaflet GeoJSON layer and adds it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        });    
};

//loads the map on the server
document.addEventListener('DOMContentLoaded',createMap)