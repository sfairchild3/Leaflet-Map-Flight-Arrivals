//create main map tilelayer
function createMap(searchLayer) {
	var backgroundLayer = new L.StamenTileLayer("terrain");
	var map = new L.Map("map", {
		center: new L.LatLng(37.8, -96),
		zoom: 5,
		minZoom: 3,
	});
	map.addLayer(backgroundLayer);
	getData(map);
	$('#year').html("<h4>2008</h4");
}


function getData(map, searchLayer) {
	//load the data
	$.ajax("data/AirportArrivals_percentOnTime.geojson", {
		dataType: "json",
		success: function (response) {

			//create attributes
			var attributes = processData(response);
			console.log(attributes)
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
		}
	});
}

//version using attributes of geojson response
function createPropSymbols(response, map, attributes) {
	var searchLayer = L.geoJson(response, {
		pointToLayer: function (feature, latlng) {
			return pointToLayer(feature, latlng, attributes)
		}
	})

	searchLayer.addTo(map);
	map.addControl(new L.Control.Search({
		layer: searchLayer,
		propertyName: 'Airport Name',
		hideMarkerOnCollapse: true
	}))
	return searchLayer
}



//function searchName(map, searchLayer) {
//	map.addControl(new L.Control.Search({
//		layer: searchLayer,
//		propertyName: 'Airport Name'
//	}))
//
//}




//
//function searchBar(response, map) {
//	var searchLayer = L.geoJson(response, {
//		eachLayer: getName
//	})
//
//	map.addControl(new L.Control.Search({
//		layer: searchLayer
//	}));



//function getName(feature, layer) {
//	var name = feature.properties["Airport Name"]
//	console.log(name)
//	return name
//}

//calculate the radius of each proportional symbol

function calcPropRadius(attValue) {
	//scale factor to adjust symbol size evenly
	var baseline = attValue - 60;
	var scaleFactor = 30;
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
		fillColor: "#53b7d2",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8

	};

	//create popup content to bind to marker
	var attValue = Number(feature.properties[attribute]);
	//    console.log(attValue)

	var popUpContent = "<h6>" + feature.properties["Airport Name"] + "</h6><h6><b>Percent On Time:</b> " + attValue + "</h6>";

	var title = feature.properties["Airport Name"]
	//	console.log(title)


	//use circle radius function to create proportional symbols
	geojsonMarkerOptions.radius = calcPropRadius(attValue);

	//assign location and style to leaflet circle layer
	var layer = L.circleMarker(latlng, geojsonMarkerOptions);

	//bind a tooltip to the marker layer
	layer.bindPopup(popUpContent);

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
		max: 10,
		min: 0,
		value: 0,
		step: 1
	});

	// create slider event handler
	$('.range-slider').on('input', function () {
		var index = $(this).val();
		updatePropSymbols(map, attributes[index]);
		updateYear(index);
	});


	//create button event handler
	$('.skip').click(function () {
		var index = $('.range-slider').val();
		if ($(this).attr('id') == 'forward') {
			index++;
			index = index > 10 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse') {
			index--;

			index = index < 0 ? 10 : index;
		}

		$('.range-slider').val(index);
		updatePropSymbols(map, attributes[index]);
		updateYear(index);
	});
}


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute) {
	map.eachLayer(function (layer) {
		if (layer.feature && layer.feature.properties[attribute]) {
			//access feature properties
			var props = layer.feature.properties;


			//update each feature's radius based on new attribute values
			var radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			//add city to popup content string
			var popupContent = "<h6><b>" + props["Airport Name"] + "</b> </h6>";

			//add formatted attribute to panel content string
			popupContent += "<h6><b>Percent on Time: </b>" +
				props[attribute] + "</h6>";

			//replace the layer tooltip
			layer.bindPopup(popupContent);

			updateYear();
		}
	});

}

function updateYear(index) {
	if (index == 0) {
		$('#year').html("<h4>2008</h4");
	} else if (index == 1) {
		$('#year').html("<h4>2009</h4");
	} else if (index == 2) {
		$('#year').html("<h4>2010</h4");
	} else if (index == 3) {
		$('#year').html("<h4>2011</h4");
	} else if (index == 4) {
		$('#year').html("<h4>2012</h4");
	} else if (index == 5) {
		$('#year').html("<h4>2013</h4");
	} else if (index == 6) {
		$('#year').html("<h4>2014</h4");
	} else if (index == 7) {
		$('#year').html("<h4>2015</h4");
	} else if (index == 8) {
		$('#year').html("<h4>2016</h4");
	} else if (index == 9) {
		$('#year').html("<h4>2017</h4");
	} else if (index == 10) {
		$('#year').html("<h4>2018</h4");
	}
}


//build attribute arrays
function processData(response) {
	var attributes = [];
	i = 0;
	var values = response.features[i].properties;
	for (var item in values) {
		if (item.indexOf("20") > -1) {
			attributes.push(item);
		}
	}
	return attributes;
}

$(document).ready(createMap);
