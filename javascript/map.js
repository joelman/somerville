var mymap = L.map('mapid').setView([42.3955522,-71.1387673], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

var addresses = [];
var properties = [];

const draw = async() => {

    var length = addressRows.length;
    for(var i = 0; i < length; i++) {
	var p = addressRows[i].split('\t');
	var a = { number: p[0], street: p[1], lat: p[2], lon: p[3] };
	addresses.push(a);
    }
    console.log(`loaded ${addresses.length} addresses.`)
}

const load = async() => {
    
    var length = propertyRows.length;

    for(var i = 0; i < length; i++) {
	var x = propertyRows[i].split('\t')
	
	var plot = {};
	for(var f = 0; f < fields.length; f++) {
	    plot[fields[f]] = x[f];
	}

	properties.push(plot);
    }
    console.log(`loaded ${properties.length} properties.`)
}

draw();
load();
