var mymap = L.map('mapid').setView([42.3949919,-71.1045912], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

var markers = [];

var scale = 1000000;
var step = 100000;

// https://colordesigner.io/gradient-generator
var colors = ['#0000ff', '#9900e2', '#cf00c1', '#f100a0', '#ff0080', '#ff0063', '#ff004a', '#ff3133', '#ff601c', '#ff8000']

function initControls() {

    var table = document.getElementById('legend')

    let thead = table.createTHead();
    let row = thead.insertRow();
    let text = document.createTextNode("Price");
    let th = document.createElement("th");
    th.appendChild(text);
    th.colSpan = 2;
    row.appendChild(th);

    for(let i = 0; i < scale; i += step) {
	let row = table.insertRow();
	let c1 = document.createElement('td');
	c1.bgColor = colors[(i/step)];

	let check = document.createElement("INPUT");
	check.setAttribute("type", "checkbox");
	check.setAttribute('id', `index_${(i/step)}`);
	check.setAttribute('class', 'rangeCheck');
//	check.checked = true;
	check.addEventListener("click", draw);
	c1.appendChild(check);
	row.appendChild(c1);

	let c2 = document.createElement('td')

	let text = '';
	if(i == scale - step) {
	    text = `${i.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} and over`;
	} else {
	    var from = i.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
	    var to = (i + step).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
	    text = `${from} to ${to}`;
	}
	
	let t = document.createTextNode(text);
	c2.appendChild(t);
	row.appendChild(c2);
    }
}

var minPrice = 100000000;
var maxPrice = 0;

var minValue = 100000000;
var maxValue = 0;   


var addresses = [];
var properties = [];

const draw = async() => {

    for(var i = 0; i < markers.length; i++) {
	mymap.removeLayer(markers[i]);
    }

    markers = [];
    
    let checks = document.getElementsByClassName('rangeCheck');
    let selected = [];
    for(var i = 0; i < checks.length; i++) {
	selected.push(checks[i].checked);
    }

//    console.log(selected);
    
    let length = addresses.length;
    for (var i = 0; i < length; i++) {
	
	var address = addresses[i]

	var color = 0;

	for(var c = step; c < scale; c += step) {
	    if(address.price >= c) {
		color++;
	    }
	}

	if(!selected[color]) {
	    continue;
	}
	
	var circle = L.circle([address.lat, address.lon], {
            color: colors[color],
            fillColor: colors[color],
            fillOpacity: 1,
            radius: 5,
	    lat: address.lat,
	    lon: address.lon
        });
		
        // circle.bindPopup(`${a.number} ${a.street}`).openPopup();
	circle.bindPopup(hi).openPopup();
	circle.on('click', lookup);

	markers.push(circle);
        circle.addTo(mymap);
    }

    log(`loaded ${addresses.length} addresses.`)
}

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
    
    let length = addressRows.length;
    for (var i = 0; i < length; i++) {
        var p = addressRows[i].split('\t');
        var a = {
	    price: parseInt(p[0]),
	    value: parseInt(p[1]),
            number: p[2],
            street: p[3],
            lat: parseFloat(p[4]),
            lon: parseFloat(p[5])
        };

	if(a.price > maxPrice) {
	    maxPrice = a.price;
	}

	if(a.value > maxValue) {
	    maxValue = a.value;
	}

	if(a.price < minPrice && a.price > 0) {
	    minPrice = a.price;
	}

	if(a.value < minValue && a.value > 0) {
	    minValue = a.value;
	}
	
        addresses.push(a);
    }	

    draw();
    
    log(`minPrice: ${minPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
    log(`maxPrice: ${maxPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);

    log(`minValue: ${minValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
    log(`maxValue: ${maxValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);

    length = propertyRows.length;
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

initControls();
load();
