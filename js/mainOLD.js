//create main map tilelayer
function createMap() {
    var backgroundLayer = new L.StamenTileLayer("terrain");
    var map = new L.Map("map", {
        center: new L.LatLng(37.8, -96),
        zoom: 5,
        minZoom: 3
    });
    map.addLayer(backgroundLayer);
    getData(map);
    $('#year').html("<h4>2008</h4")
}


function getData(map) {
    //load the data
    $.ajax("../data/AirportArrivals_percentOnTime.geojson", {
        //    $.ajax("../data/practice.geojson", {
        dataType: "json",
        success: function (response) {

            //create attributes
            let attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);


        }
    })
}

//version using attributes of geojson response
function createPropSymbols(response, map, attributes) {
    L.geoJson(response, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map)

}


//calculate the radius of each proportional symbol

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    let baseline = attValue - 60
    let scaleFactor = 30;
    //area based on attribute value and scale factor
    let area = baseline * scaleFactor
    //radius calculated based on area
    let radius = Math.sqrt(area / Math.PI);
    return radius;
};


//create markers to locate features
function pointToLayer(feature, latlng, attributes) {


    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];

    //create marker color
    let geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#53b7d2",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }

    //create popup content to bind to marker
    let attValue = Number(feature.properties[attribute])
    //    console.log(attValue)

    let popUpContent = "<p>" + feature.properties["Airport Name"] + "</p><p><b>Percent On Time:</b> " + attValue + "</p>";


    //use circle radius function to create proportional symbols
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //assign location and style to leaflet circle layer
    let layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //bind a tooltip to the marker layer
    layer.bindTooltip(popUpContent);

    // return 
    return layer

}


//create sequence control slider options
function createSequenceControls(map, attributes) {
    //create range input element (slider)
    $('#slider').append('<input class="range-slider" type="range">');
    $('#reverse').append('<button class="skip" id="reverse"><i class="fas fa-backward"></i></button>');
    $('#forward').append('<button class="skip" id="forward"><i class="fas fa-forward"></i></button>');


    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    // create slider event handler
    $('.range-slider').on('input', function () {
        let index = $(this).val();
        updatePropSymbols(map, attributes[index])
    });


    //create button event handler
    $('.skip').click(function () {
        let index = $('.range-slider').val();
        if ($(this).attr('id') == 'forward') {
            index++;
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;

            index = index < 0 ? 9 : index;
        };
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index])
        updateYear(index)
    });
};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute) {
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            //access feature properties
            let props = layer.feature.properties;


            //update each feature's radius based on new attribute values
            let radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>" + props["Airport Name"] + "</b> </p>";

            //add formatted attribute to panel content string
            let attValue = Number(props[attribute])
            //            var year = attribute.split("_")[1];
            popupContent += "<p><b>Percent on Time:</b> " + props[attribute] + "</p>";

            //replace the layer tooltip
            layer.bindTooltip(popupContent);

            updateYear()
            //update year on panel
            //            let year = Object.values(attribute)
            //            console.log(year)
            //            $('#year').html("<p>" + year + "</p>")
        };
    });

};

function updateYear(index) {
    if (index == 0) {
        $('#year').html("<h4>2008</h4")
    } else if (index == 1) {
        $('#year').html("<h4>2009</h4")
    } else if (index == 2) {
        $('#year').html("<h4>2010</h4")
    } else if (index == 3) {
        $('#year').html("<h4>2011</h4")
    } else if (index == 4) {
        $('#year').html("<h4>2012</h4")
    } else if (index == 5) {
        $('#year').html("<h4>2013</h4")
    } else if (index == 6) {
        $('#year').html("<h4>2014</h4")
    } else if (index == 7) {
        $('#year').html("<h4>2015</h4")
    } else if (index == 8) {
        $('#year').html("<h4>2016</h4")
    } else if (index == 8) {
        $('#year').html("<h4>2017</h4")
    } else if (index == 9) {
        $('#year').html("<h4>2018</h4")
    }
}


//build attribute arrays
function processData(response) {
    let attributes = [];
    //
    i = 0

    let values = response.features[i].properties;
    for (var item in values) {
        if (item.indexOf("20") > -1) {
            attributes.push(item);
        }
    };

    return attributes;
    //}
}
$(document).ready(createMap);
