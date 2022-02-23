/* Map of GeoJSON data from MegaCities.geojson */

//declare map variable
var map;
//function that creates the map
function createMap(){
    //defines center and zoom
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //adds OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
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

//function that retrieves data from the MegaCities.json file and places it on the map
function getData(){
    //retrieves the data
    fetch("data/MegaCities.geojson copy")
        //converts data to a usable form
        .then(function(response){
            return response.json();
        })
        .then(function(json){
                //styles the circle markers 
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //add a Leaflet GeoJSON layer to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        });    
};

//loads the map on the server
document.addEventListener('DOMContentLoaded',createMap)