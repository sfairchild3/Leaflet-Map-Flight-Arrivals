//create main map tilelayer
function createMap(searchLayer) {
	var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',

	});
	var map = new L.Map("map", {
		center: new L.LatLng(37.8, -96),
		zoom: 5,
		minZoom: 3,
		zoomControl: false
	})
	map.addLayer(CartoDB_Positron);
	map.addControl(new L.Control.ZoomMin())
	getData(map);
}


function getData(map) {
	//load the data
	$.ajax("data/airports.geojson", {
		dataType: "json",
		success: function (response) {

			//create attributes
			var attributes = processData(response);
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);

		}
	});
}

//style data and add search element
function createPropSymbols(response, map, attributes) {

	var searchLayer = L.geoJson(response, {
		pointToLayer: function (feature, latlng) {
			return pointToLayer(feature, latlng, attributes)
		},
		style: function (feature) {
			return styleLayer(feature, attributes)
		}
	})
	searchLayer.addTo(map);

	//add search control feature to map
	map.addControl(new L.Control.Search({
		layer: searchLayer,
		propertyName: 'Airport Name',
		hideMarkerOnCollapse: true
	}))
	return searchLayer
}


function styleLayer(feature, attributes) {
	var colorToUse;
	var attribute = attributes[0];
	var attValue = Number(feature.properties[attribute]);
	if (attValue > 60 && attValue < 70) colorToUse = '#6CA4B0';
	if (attValue > 70 && attValue < 80) colorToUse = '#01818E';
	if (attValue > 80 && attValue < 90) colorToUse = '#01535E';
	return {
		color: colorToUse,
		radius: calcPropRadius(attValue),
		weight: 2
	};
}


function calcPropRadius(attValue) {
	//scale factor to adjust symbol size evenly
	var baseline = attValue - 60;
	var scaleFactor = 20;
	//area based on attribute value and scale factor
	var area = baseline * scaleFactor;
	//radius calculated based on area
	var radius = Math.sqrt(area / Math.PI);
	return radius;
}


//create markers to locate features
function pointToLayer(feature, latlng, attributes) {
	//Assign the current attribute based on the first index of the attributes array
	var attribute = attributes[0];

	//create marker color
	var geojsonMarkerOptions = {
		radius: 8,
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8

	};

	//get attribute value of airport precent arrival for popup
	var attValue = Number(feature.properties[attribute]);

	//create popup content to bind to marker
	var popUpContent = "<h6>" + feature.properties["Airport Name"] + "</h6><h6><b>Percent On Time:</b> " + attValue + "</h6>";

	var layer = L.circleMarker(latlng, geojsonMarkerOptions);

	//bind a tooltip to the marker layer
	layer.bindPopup(popUpContent);

	//add initial panel information on first load
	$('#year').html('2008');
	$("#best").html('<h5><b>Best on Time: </b> Salt Lake City International Airport 83.58 %</h5?');
	$("#worst").html('<h5><b>Worst on Time: </b> Newark Liberty International Airport 62.32%</h5>');

	// return 
	return layer;
}



//create sequence control slider options
function createSequenceControls(map, attributes) {
	//create range input element (slider)
	$('#slider').append('<input class="range-slider" type="range">');
	$('#reverse').append('<button class="skip" id="reverse"><i class="fas fa-backward"></i></button>');
	$('#forward').append('<button class="skip" id="forward"><i class="fas fa-forward"></i></button>');


	//set slider attributes
	$('.range-slider').attr({
		max: 11,
		min: 0,
		value: 0,
		step: 1
	});

	// create slider event handler
	$('.range-slider').on('input', function () {
		var index = $(this).val();
		$('#year').html(attributes[index]);
		updatePropSymbols(map, attributes[index]);
		sortData(map, attributes[index]);
	});


	//create button event handler
	$('.skip').click(function () {
		var index = $('.range-slider').val();
		if ($(this).attr('id') == 'forward') {
			index++;
			index = index > 11 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse') {
			index--;
			index = index < 0 ? 11 : index;
		}
		$('.range-slider').val(index);
		$('#year').html(attributes[index]);
		updatePropSymbols(map, attributes[index]);
		sortData(map, attributes[index]);
	});
}


function updatePropSymbols(map, attribute) {
	map.eachLayer(function (layer) {
		if (layer.feature && layer.feature.properties[attribute]) {

			//access feature properties
			var props = layer.feature.properties;

			var attValue = props[attribute]

			//add city to popup content string
			var popupContent = "<h6><b>" + props["Airport Name"] + "</b> </h6>";

			//add formatted attribute to panel content string
			popupContent += "<h6><b>Percent on Time: </b>" +
				props[attribute] + "</h6>";


			//change map values based on year (attribute index)
			var resetStyle = (function (layer) {
				var colorToUse;
				if (attValue > 60 && attValue < 70) colorToUse = '#6CA4B0';
				if (attValue > 70 && attValue < 80) colorToUse = '#01818E';
				if (attValue > 80 && attValue < 90) colorToUse = '#01535E';
				return {
					color: colorToUse,
					radius: calcPropRadius(attValue),
					weight: 2
				};
			})

			layer.bindPopup(popupContent);

			layer.setStyle(resetStyle(attValue));

		}
	});

}

//build attribute arrays
function processData(response) {
	var attributes = [];
	//	i = 0;
	var values = response.features[0].properties;
	for (var item in values) {
		if (item.indexOf("20") > -1) {
			attributes.push(item);
		}
	}
	return attributes;
}

//create arrays of attribute values to find min and max values
function sortData(map, attribute) {
	var ranked = []

	map.eachLayer(function (layer) {
		if (layer.feature && layer.feature.properties[attribute]) {

			//access feature properties
			var props = layer.feature.properties;
			var attValue = props[attribute];
			ranked.push(attValue);
		}
	})
	var max = Math.max.apply(Math, ranked);
	var min = Math.min.apply(Math, ranked);
	displayRanks(map, attribute, max, min)
}


//display min and max values in panel
function displayRanks(map, attribute, max, min) {
	map.eachLayer(function (layer) {
		if (layer.feature && layer.feature.properties[attribute]) {

			//access feature properties
			var props = layer.feature.properties;
			var attValue = props[attribute];

			//match min and max value from sortData in panel 
			if (max == attValue) {
				$("#best").html("<h5><b>Best on Time: </b>" + props['Airport Name'] + ' ' + max + '%</h5>')
			}
			if (min == attValue) {
				$("#worst").html("<h5><b>Worst on Time: </b>" + props['Airport Name'] + ' ' + min + '%</h5>')
			}

		}
	})
}


$(document).ready(createMap);
