var mymap = L.map('mapid').setView([42.3949919,-71.1045912], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

var red = 8388608;
var green = 800;

var minVal = 900;
var maxVal = 1838600;

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
	    price: p[0],
	    value: p[1],
            number: p[2],
            street: p[3],
            lat: p[4],
            lon: p[5]
        };
		
	var circle = L.circle([a.lat, a.lon], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 1,
        radius: 1,
		lat: a.lat,
		lon: a.lon
        });
		
        // circle.bindPopup(`${a.number} ${a.street}`).openPopup();
		circle.bindPopup(hi).openPopup();
		circle.on('click', lookup);

        circle.addTo(mymap);
		
        addresses.push(a);
        
    }

    log(`loaded ${addresses.length} addresses.`)
}

function hi(e) {
	console.log(e);
	var o = e.options;
	var parcels = properties.filter(x => x.lat == x.lat && x.lon == o.lon)
	console.log(parcels);
	
	var data = [`${parcels[0].HOUSE_NO} ${parcels[0].STREET}`];
	if(parcels[0].UNIT) {
		data.push(`${parcels.length} Units`);
	}
	
	for(var i = 0; i < parcels.length; i++) {
		var parcel = parcels[i];
		var line = '';
		if(parcel.UNIT) {
			line = `Unit: ${parcel.UNIT} `;
		}
		
		var price = parseInt(parcel.SALE_PRICE);
		var pf = price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
		var val = parseInt(parcel.PARCEL_VAL);
		var vf = val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
		line += `Price: ${pf} Value: ${vf}`;
		
		data.push(line);
	}
	o.color = 'red'
	return data.join('<br />')
	
}

const load = async() => {

    var length = propertyRows.length;
	var plotted = [];
	
    for (var i = 0; i < length; i++) {
        var x = propertyRows[i].split('\t')

            var plot = {};
        for (var f = 0; f < fields.length; f++) {
            plot[fields[f].replace(' ', '_')] = x[f];
        }

        properties.push(plot);
		/*
		if(plot.lat == "None")
			continue;
		
		var key = `${plot.lat},${plot.lon}`
		if(plotted.includes(key))
			continue;
		
		var circle = L.circle([plot.lat, plot.lon], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 1,
        radius: 1
        });
		
        circle.bindPopup(`${plot.HOUSE_NO} ${plot.STREET}`).openPopup();
		circle.on('click', lookup);

        circle.addTo(mymap);
		
		plotted.push(key);
		*/
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
