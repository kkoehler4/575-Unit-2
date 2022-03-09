//declares map var in global scope
var map;
var dataStats = {};

//function that creates the Leaflet map
function createMap(){
    //creates the map
    map = L.map('map', {
        center: [37.3, -120],
        zoom: 5.85,
        //restrict zoom to major cities
        maxZoom: 9,
        minZoom: 5,
        //restrcit pan to California
        maxBounds: [
            [45, -130],[30, -110]
        ]
    });

    //adds my own Monarch base tilelayer 
    L.tileLayer('https://api.mapbox.com/styles/v1/kkoehler4/cl0hiyomi000114mquf1zke1o/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia2tvZWhsZXI0IiwiYSI6ImNrdjZza3psZjlkMHcyb2s2ZzVxbzV6YjQifQ.OfaWlujeGgvfX7xd7eg9xA', {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //calls getData function
    getData(map);
};

function calcStats(data){
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
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
      //calculate meanValue
    var sum = allValues.reduce(function (a, b) {
    return a + b;
  });
  dataStats.mean = sum / allValues.length;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //console.log(attValue)
    if (attValue){
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.08;
    //Flannery Apperance Compensation formula
    var radius = 0.5 * Math.pow(attValue/dataStats.min,0.5715) * minRadius
    return radius;
    }
    else {
        return 1;
    }
};

function createPopupContent(properties, attribute){
    //add city to popup content string
    var popupContent = "<p><b>Site:</b> " + properties.Site_Name + "</p>";

    //add formatted attribute to panel content string
    //var year = attribute.split("_")[1];
    popupContent += "<p><b>Monarch Population in " + attribute + ":</b> " + properties[attribute] + "</p>";

    return popupContent;
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
        color: "#F9D7B2",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7

    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    console.log(Number(feature.properties[attribute]))
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

   var popupContent = createPopupContent(feature.properties, attribute);

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

function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);
  
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }
  
function updateLegend(attribute) {
    //create content for legend
    var year = attribute.split("_")[1];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(attribute);
  
    for (var key in circleValues) {
      //get the radius
      var radius = calcPropRadius(circleValues[key]);
  
      document.querySelector("#" + key).setAttribute("cy", 59 - radius);
      document.querySelector("#" + key).setAttribute("r", radius)
      document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + " million";
    }
  }

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
    
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/Wing_Arrow.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/Wing_Arrow_2.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());

        //set slider attributes
        document.querySelector(".range-slider").max = 12;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;
    
    
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

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){

  //update temporal legend
  document.querySelector("span.year").innerHTML = attribute;

  map.eachLayer(function(layer){
          if (layer.feature && layer.feature.properties[attribute]){
              //access feature properties
              var props = layer.feature.properties;
  
              //update each feature's radius based on new attribute values
              var radius = calcPropRadius(props[attribute]);
              layer.setRadius(radius);
              
              var popupContent = createPopupContent(props, attribute);   

              //update popup with new content    
              popup = layer.getPopup();    
              popup.setContent(popupContent).update();
          };
  });
};

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
      options: {
        position: "bottomright",
      },
  
      onAdd: function () {
        // create the control container with a particular class name
        var container = L.DomUtil.create("div", "legend-control-container");
  
        container.innerHTML = '<p class="temporalLegend">Monarch population in <span class="year">1997</span></p>';
  
        //Step 1: start attribute legend svg string
        var svg = '<svg id="attribute-legend" width="100px" height="100px margin="30px">';
  
        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];
  
        //Step 2: loop to add each circle and text to svg string
        for (var i = 0; i < circles.length; i++) {
          //calculate r and cy
          var radius = calcPropRadius(dataStats[circles[i]]);
          console.log(radius);
          var cy = 59 - radius;
          console.log(cy);
  
          //circle string
          svg +=
            '<circle class="legend-circle" id="move"' +
            circles[i] +
            '" r="' +
            radius +
            '"cy="' +
            cy +
            '" fill="#000" fill-opacity="1" stroke="#F9D7B2" cx="30"/>';
  
          //evenly space out labels
          var textY = i * 20 + 20;
  
          //text string
          svg +=
            '<text id="' +
            circles[i] +
            '-text" x="65" y="' +
            textY +
            '">' +
            Math.round(dataStats[circles[i]] * 100) / 100 + "</text>";
        }
  
        //close svg string
        svg += "</svg>";
  
        //add attribute legend svg to container
        container.insertAdjacentHTML('beforeend',svg);
  
        return container;
      },
    });
  
    map.addControl(new LegendControl());
  }

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
            calcStats(json);
            //minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)



