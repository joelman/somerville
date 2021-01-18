var mymap = L.map('mapid').setView([42.3949919,-71.1045912], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

var polygons = [];

var style = {
    "color": "#aaa",
    "weight": 2.5,
    "fillOpacity": 0.0
};

var bostonLayer = L.geoJSON(boston, { style: style }).addTo(mymap);

style.color = "#faa";

var wardsLayer = L.geoJSON(wards, { style: style }).addTo(mymap);

var wardErrors = [
[], // 0
['43 THIRD AVE', '21 THIRD AVE', '132 MIDDLESEX AVE', '120 MIDDLESEX AVE'],
['31 HAROLD RD', '290 SOMERVILLE AVE', '14 BLEACHERY CT', '41 SCHOOL ST', '32 SKEHAN ST', '14 EVERETT ST', '42 DANE ST', '58 DANE ST',
'208 WASHINGTON ST', '204 WASHINGTON ST', '202 WASHINGTON ST', '198 WASHINGTON ST', '192 WASHINGTON ST', '216 MCGRATH HWY', 
'120 MCGRATH HWY', '181 MCGRATH HWY', '51 MCGRATH HWY', '35 MCGRATH HWY', '200 INNER BELT RD', '1 MCGRATH HWY', '120 WASHINGTON ST',
'218 HIGHLAND AVE', '216 HIGHLAND AVE', '214 HIGHLAND AVE', '212 HIGHLAND AVE', '116 BELMONT ST', '114 BELMONT ST', '67 BENTON RD', 
'162 HIGHLAND AVE'
],
['11 BELMONT PL', '414 MCGRATH HWY', '9 MONTROSE CT'],
['15 MELVILLE RD', '133 SHORE DR', '99 TEMPLE RD', '95 TEMPLE RD'],
['74 ELM ST', '28 CEDAR ST'],
['66 LEXINGTON AVE', '117 ELM ST', '74 ELM ST'],
['132 CURTIS ST']
]

// http://www.somervillema.gov/sites/default/files/ward-and-precinct-map.pdf
let wardColors = ['#fffec5', '#e4f3bb', '#eed6fc', '#aae6dc', '#f8d3c6', '#c6e7fd', '#f9d48b'];

style.fillOpacity = 0.55;

wardsLayer.eachLayer(function(layer) {
    var feature = layer.feature;
    var html = `<strong>WARD ${feature.properties.Ward}`;

    var label = L.marker(layer.getBounds().getCenter(), {
	icon: L.divIcon({
            className: 'label',
            html: html,
            iconSize: [100, 40]
	})
    }).addTo(mymap);

    var index = parseInt(feature.properties.Ward);
    style.color = wardColors[index-1];
    layer.setStyle(style);
});

style.color = '#555';
style.weight = 1;
style.fillOpacity = .5;

var buildingsLayer = L.geoJSON(buildings, { style: style }).addTo(mymap);

var markers = [];

var scale = 2000000;
var step = 200000;

// https://colordesigner.io/gradient-generator
var colors = ['#0000ff', '#9900e2', '#cf00c1', '#f100a0', '#ff0080', '#ff0063', '#ff004a', '#ff3133', '#ff601c', '#ff8000']

function initControls() {

    var table = document.getElementById('legend')

    let thead = table.createTHead();
    let row = thead.insertRow();
    let th = document.createElement("th");
    
    let button = document.createElement('button');
    button.innerText = 'toggle';
    button.id = 'toggle_value';
    button.addEventListener("click", toggle);
    th.appendChild(button);

    row.appendChild(th);

    let th2 = document.createElement("th");
    let text = document.createTextNode("Value");
    th2.appendChild(text);
    
    row.appendChild(th2);

    for(let i = 0; i < scale; i += step) {
	let row = table.insertRow();
	let c1 = document.createElement('td');
	c1.bgColor = colors[(i/step)];

	let check = document.createElement("INPUT");
	check.setAttribute("type", "checkbox");
	check.setAttribute('id', `index_${(i/step)}`);
	check.setAttribute('name', 'value');
	check.setAttribute('class', 'rangeCheck');
	check.checked = true;
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

    let zoneChecks = document.getElementsByClassName('zoneCheck');
    let zones = [];
    for(var i = 0; i < zoneChecks.length; i++) {
	if(zoneChecks[i].checked) {
	    zones.push(zoneChecks[i].value);
	}
    }

    let wardChecks = document.getElementsByClassName('wardCheck');
    let wards = [];
    for(var i = 0; i < wardChecks.length; i++) {
	var check = wardChecks[i];
	if(check.checked) {
	    wards.push(check.value);
	}
    }

    buildingsLayer.eachLayer(function(layer) {
	mymap.removeLayer(layer);
    });

    let bounds = null;
    let length = polygons.length;
    for(var i = 0; i < length; i++) {
	var polygon = polygons[i];
	var o = polygon.options;

	if(!zones.includes(o.zoning)) {
	    continue;
	}
	
	if(!wards.includes(o.ward)) {
	    continue;
	}
				
	if(!selected[o.interval]) {
	    continue;
	}

	if(bounds == null) {
	    bounds = polygon.getBounds();
	} else {
	    bounds.extend(polygon.getBounds());
	}
	
	polygon.addTo(mymap);
    }

    if(bounds != null) {
	mymap.fitBounds(bounds);
    }
    
    /*
    let length = addresses.length;
    for (var i = 0; i < length; i++) {
	
	var address = addresses[i]

	if(!zones.includes(address.zoning)) {
	    continue;
	}

	if(!wards.includes(address.ward)) {
	    continue;
	}
		
	if(!selected[address.interval]) {
	    continue;
	}
		
	var circle = L.circle([address.lat, address.lon], {
            color: colors[address.interval],
            fillColor: colors[address.interval],
            fillOpacity: 1,
            radius: 5,
	    lat: address.lat,
	    lon: address.lon
        });
		
        // circle.bindPopup(`${a.number} ${a.street}`).openPopup();
	circle.bindPopup(hi)
	circle.on('click', lookup);

	markers.push(circle);
        circle.addTo(mymap);
    }
*/
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

    log(`match: ${match.number} ${match.street}`);
    
    var props = properties.filter(x => x['HOUSE NO'] == match.number && x['STREET'] == match.street)
    console.log(props)
}

mymap.on('click', lookup);

function hi(e) {

    let parcels = [];
    if(e.options) {

	var o = e.options;
		
	parcels = properties.filter(x => x.HOUSE_NO == o.number && x.STREET == o.street);
	console.log(parcels);
    }

    if(parcels.length) {
	var data = [`${parcels[0].HOUSE_NO} ${parcels[0].STREET} (${parcels[0].ZONE_DESP})`];
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
}

function toggle(e) {
    var name = e.target.id.replace('toggle_', '');

    var checks = document.getElementsByName(name);

    for(var i = 0; i < checks.length; i++) {
	checks[i].checked = !checks[i].checked;
    }

    draw();
}

const load = async() => {

    let zones = [];
    let wards = [];
    
    let length = addressRows.length;
    for (let i = 0; i < length; i++) {
        var p = addressRows[i].split('\t');
        var a = {
	    price: parseInt(p[0]),
	    value: parseInt(p[1]),
	    parcel: p[2],
	    number: p[3],
            street: p[4],
	    zoning: p[5],
	    ward: p[6],
            lat: parseFloat(p[7]),
            lon: parseFloat(p[8])
        };

	/* for one-time setting of ward
	doesn't seem to match all of them
	let m1 = L.marker([a.lat, a.lon]);
	let wardFound = false;
	wardsLayer.eachLayer(function(layer) {		
		if(layer.contains(m1.getLatLng())) {
			console.log(`{ parcel: '${a.parcel}', ward: '${layer.feature.properties.Ward}' },\r\n`);
			wardFound = true;
		}
	});
	
	/*
	var w = wardParcels.filter(x => x.parcel == a.parcel);
	if(w.length) {
		a.ward = w[0].ward;
	}
	*/
	
	for(let i = 0; i < wardErrors.length; i++) {
		if(wardErrors[i].includes(`${a.number} ${a.street}`)) {
			a.ward = i.toString();
		}
	}
	
	a.interval = 0;

	for(var c = step; c < scale; c += step) {	    	   
	    if(a.value >= c) {
		a.interval++;
	    }
	}
	
	if(a.zoning == '') {
	    a.zoning = 'Blank';
	}
	
	var exists = zones.filter(x => x.zone == a.zoning);
	if(exists.length) {
	    exists[0].count++;
	} else {
	    zones.push({ zone: a.zoning, count: 1 });
	}

	if(!wards.includes(a.ward)) {
	    wards.push(a.ward);
	}
	
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

    addZones(zones);
    addWards(wards);

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
    }
    log(`loaded ${properties.length} properties.`)
	
	// add buildings		
	var temp = addresses;
  
	buildingsLayer.eachLayer(function(layer) {

	    polygons.push(layer);
	    
		var c = layer.feature.geometry.coordinates[0]
		var cRev = [];
		for(let i = 0; i < c.length; i++) {
			let coord = c[i];
			cRev.push([coord[1], coord[0]]);
		}

		var polygon = L.polygon(cRev);			
		var bounds = polygon.getBounds();
		var center = bounds.getCenter();
		
		for(let i = 0; i < temp.length; i++) {

		    var address = temp[i];						
		    let a = L.latLng(address.lat, address.lon);
	
		    if (bounds.contains(a)) {

				var style = { color: colors[address.interval] };
				layer.setStyle(style);

			layer.options.value = address.value;
			layer.options.parcel = address.parcel;
			layer.options.street = address.street;
			layer.options.number = address.number;
			layer.options.ward = address.ward;
			layer.options.zoning = address.zoning;
			layer.options.interval = address.interval;
			temp.splice(i, 1);

				break;	
			}
					
		}		
	});
	
	buildingsLayer.bindPopup(hi);
}

const addZones = async(zones) => {
    var table = document.getElementById('zones')

    let thead = table.createTHead();
    let row = thead.insertRow();
    let th = document.createElement("th");
        
    let button = document.createElement('button');
    button.innerText = 'toggle';
    button.id = 'toggle_zone';
    button.addEventListener("click", toggle);
    th.appendChild(button);

    row.appendChild(th);
    
    let th2 = document.createElement("th");
    let text = document.createTextNode("Zoning");    
    th2.appendChild(text);
    
    row.appendChild(th2);

//    zones = zones.sort();
    
    for(let i = 0; i < zones.length; i++) {
	let row = table.insertRow();
	let c1 = document.createElement('td');

	let check = document.createElement("INPUT");
	check.setAttribute("type", "checkbox");
	check.setAttribute('id', `zone_${i}`);
	check.setAttribute('name', 'zone');
	check.setAttribute('class', 'zoneCheck');
	check.value = zones[i].zone;
	check.checked = true;
	check.addEventListener("click", draw);
	c1.appendChild(check);
	row.appendChild(c1);

	let c2 = document.createElement('td')

	let text = `${zones[i].zone} (${zones[i].count})`;;
	
	let t = document.createTextNode(text);
	c2.appendChild(t);
	row.appendChild(c2);
    }
}


const addWards = async(wards) => {
    var table = document.getElementById('wards')

    let thead = table.createTHead();
    let row = thead.insertRow();

    let button = document.createElement('button');
    button.innerText = 'toggle';
    button.id = 'toggle_ward';
    button.addEventListener("click", toggle);

    let th = document.createElement("th");

    th.appendChild(button);    

    row.appendChild(th);

    let th2 = document.createElement("th");
    let text = document.createTextNode("Wards");
    th2.appendChild(text);

    row.appendChild(th2);

    wards = wards.sort();
    
    for(let i = 0; i < wards.length; i++) {

	let ward = wards[i];
	let row = table.insertRow();
	let c1 = document.createElement('td');

	if(ward) {
	    c1.bgColor = wardColors[i-1];
	}
	
	let check = document.createElement("INPUT");
	check.setAttribute("type", "checkbox");
	check.setAttribute('id', `ward_${i}`);
	check.setAttribute('name', 'ward');
	check.setAttribute('class', 'wardCheck');
	check.value = wards[i];
	check.checked = true;
	check.addEventListener("click", draw);
	c1.appendChild(check);
	row.appendChild(c1);

	let c2 = document.createElement('td')

	ward = ward ? ward : 'Blank';
	let t = document.createTextNode(ward);
	c2.appendChild(t);
	row.appendChild(c2);
    }
}

function log(message) {
    var box = document.getElementById('output')
    box.innerHTML += `<p>${message}</p>`
    box.style.visibility = 'visible'

}

initControls();

load();

console.log("load called")
