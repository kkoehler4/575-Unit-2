//declares map variable and sets scope and zoom
var map = L.map('map').setView([51.505, -0.09], 13);

//adds OSM base tilelayer 
var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//adds marker to map
var marker = L.marker([51.5, -0.09]).addTo(map);

//adds circle to map
var circle = L.circle([51.508, -0.11], {
    //styles circle
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//adds polygon to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//adds popups to objects on the map
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//adds popups as a layer
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//adds popup that displays the coordinates of anywhere you click on the map
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
    
map.on('click', onMapClick);


    