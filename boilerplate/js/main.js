//declares map var in global scope
var map;
var minValue;

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

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1997; year <= 2021; year+=2){
              //get population for current year
              var value = city.properties[(year)];
              if(value && value > 0){
                  allValues.push(value)
              }
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //console.log(attValue)
    if (attValue){
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.08;
    //Flannery Apperance Compensation formula
    var radius = 0.5 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
    }
    else {
        return 1;
    }
};

//function to convert markers to circle markers and add popups
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
       //Step 4: Assign the current attribute based on the first index of the attributes array
       var attribute = attributes[0];
       //check
    //create marker options
    var options = {
        fillColor: "#000",
        color: "#D8994E",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8

    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    console.log(Number(feature.properties[attribute]))
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>Site:</b> " + feature.properties.Site_Name + "</p>";

    //add formatted attribute to popup content string
    var year = attribute;
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " </p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-options.radius)
      });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attribute]){
                //access feature properties
                var props = layer.feature.properties;
    
                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);
    
                //add city to popup content string
                var popupContent = "<p><b>Site:</b> " + props.Site_Name + "</p>";
    
                //add formatted attribute to panel content string
                var year = attribute;
                popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + "";
    
                //update popup content            
                popup = layer.getPopup();            
                popup.setContent(popupContent).update();
            };
    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes wit"h population values
        if (!isNaN(attribute)){
            attributes.push(attribute);
        };
    };

    return attributes;
};

//Create new sequence controls
function createSequenceControls(attributes){

    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    
    //set slider attributes
    document.querySelector(".range-slider").max = 12;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    
    //add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/backward.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")


    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 12 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 12 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            updatePropSymbols(attributes[index]);
        })
    })
    
    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //Step 6: get the new index value
        var index = this.value;

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);

    });
};

//import Geojson data
function getData(map){
    //load the data
    fetch("data/monarchData.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)



