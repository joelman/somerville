var mymap = L.map('mapid').setView([42.3949919,-71.1045912], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

function lookup(e) {

//    console.log(e);
    var point = L.latLng(e.latlng.lat, e.latlng.lng);

    var dist = 1000
    var match = {}
    var length = addresses.length

    for(var i = 0; i < length; i++) {
	var address = addresses[i];
	var a = L.latLng(address.lat, address.lon)
	var d = mymap.distance(point, a)
	if(d < dist) {
	    dist = d;
	    match = address;
	}
    }

    log(`${match.number} ${match.street}`);
    
    var props = properties.filter(x => x['HOUSE NO'] == match.number && x['STREET'] == match.street)
    console.log(props)
}

mymap.on('click', lookup);

var addresses = [];
var properties = [];

const draw = async() => {

    var length = addressRows.length;
    for (var i = 0; i < length; i++) {
        var p = addressRows[i].split('\t');
        var a = {
            number: p[0],
            street: p[1],
            lat: p[2],
            lon: p[3]
        };
        addresses.push(a);

        var circle = L.circle([a.lat, a.lon], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 1,
        radius: 1
        });

        circle.bindPopup(`${a.number} ${a.street}`).openPopup();
	circle.on('click', lookup);

        circle.addTo(mymap);
    }

    log(`loaded ${addresses.length} addresses.`)
}

const load = async() => {

    var length = propertyRows.length;

    for (var i = 0; i < length; i++) {
        var x = propertyRows[i].split('\t')

            var plot = {};
        for (var f = 0; f < fields.length; f++) {
            plot[fields[f]] = x[f];
        }

        properties.push(plot);
    }
    log(`loaded ${properties.length} properties.`)
}

function log(message) {
    var box = document.getElementById('output')
    box.innerHTML += `<p>${message}</p>`
    box.style.visibility = 'visible'

}

draw();
load();
