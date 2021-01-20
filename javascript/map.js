let start = new Date

    var mymap = L.map('mapid').setView([42.3949919, -71.1045912], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 19,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

var polygons = [];
var labels = [];

mymap.on('zoomend', function () {
    let zoom = mymap.getZoom();

    for (let i = 0; i < labels.length; i++) {
        let label = labels[i];
        if (mymap.hasLayer(label)) {
            mymap.removeLayer(label);
        }
    }

	labels = [];

    if (zoom >= 18) {
        var bounds = mymap.getBounds();
        var length = polygons.length;
        for (let i = 0; i < length; i++) {
            let polygon = polygons[i];
            if (!polygon.options.number) {
                continue;
            }

            let center = polygon.getBounds().getCenter();
            if (bounds.contains(center)) {

                // fudge to center
                center.lat += .000025;
                center.lon -= .00007;
                var label = L.marker(center, {
                    icon: L.divIcon({
                        className: 'streetnumber',
                        html: polygon.options.number,
                        iconSize: [1, 1],
                        options: {
                            number: polygon.options.number,
                            street: polygon.options.street
                        }
                    })
                }).addTo(mymap);
                label.bindPopup(hi);
                labels.push(label);
            }
        }
    }
});

var style = {
    "color": "#aaa",
    "weight": 2.5,
    "opacity": 1,
    "fillOpacity": 0
};

var bostonLayer = L.geoJSON(boston, {
    style: style
}).addTo(mymap);

style.color = "#faa";
// style.fillOpacity = .25;

var wardsLayer = L.geoJSON(wards, {
    style: style
}).addTo(mymap);

// http://www.somervillema.gov/sites/default/files/ward-and-precinct-map.pdf
let wardColors = ['#fffec5', '#e4f3bb', '#eed6fc', '#aae6dc', '#f8d3c6', '#c6e7fd', '#f9d48b'];

style.fillOpacity = 0.5;

wardsLayer.eachLayer(function (layer) {
    var feature = layer.feature;
    var html = `<strong>WARD ${feature.properties.Ward}`;

    var label = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
            className: 'wardLabel',
            html: html,
            iconSize: [55, 15]
        })
    }).addTo(mymap);

    var index = parseInt(feature.properties.Ward);
    style.color = wardColors[index - 1];
    layer.setStyle(style);
});

style.color = '#555';
style.weight = 1;
style.fillOpacity = .5;

var buildingsLayer = L.geoJSON(buildings, {
    style: style
}).addTo(mymap);

var markers = [];

var scale = 2000000;
var step = 200000;

// https://colordesigner.io/gradient-generator
var colors = ['#0000ff', '#9900e2', '#cf00c1', '#f100a0', '#ff0080', '#ff0063', '#ff004a', '#ff3133', '#ff601c', '#ff8000']

var minPrice = 100000000;
var maxPrice = 0;

var minValue = 100000000;
var maxValue = 0;

var addresses = [];
var properties = [];

const draw = async() => {

    for (var i = 0; i < markers.length; i++) {
        mymap.removeLayer(markers[i]);
    }

    markers = [];

    let checks = document.getElementsByClassName('rangeCheck');
    let selected = [];
    for (var i = 0; i < checks.length; i++) {
        selected.push(checks[i].checked);
    }

    let zoneChecks = document.getElementsByClassName('zoneCheck');
    let zones = [];
    for (var i = 0; i < zoneChecks.length; i++) {
        if (zoneChecks[i].checked) {
            zones.push(zoneChecks[i].value);
        }
    }

    let wardChecks = document.getElementsByClassName('wardCheck');
    let wards = [];
    for (var i = 0; i < wardChecks.length; i++) {
        var check = wardChecks[i];
        if (check.checked) {
            wards.push(check.value);
        }
    }

    buildingsLayer.eachLayer(function (layer) {
        mymap.removeLayer(layer);
    });

    let parcels = 0;
    let value = 0;
    let bounds = null;
    let length = polygons.length;
    for (var i = 0; i < length; i++) {
        var polygon = polygons[i];
        var o = polygon.options;

        if (!zones.includes(o.zoning)) {
            continue;
        }

        if (!wards.includes(o.ward)) {
            continue;
        }

        if (!selected[o.interval]) {
            continue;
        }

        if (bounds == null) {
            bounds = polygon.getBounds();
        } else {
            bounds.extend(polygon.getBounds());
        }

        polygon.addTo(mymap);

        parcels++;
        value += o.value;

    }

    if (bounds != null) {
        mymap.fitBounds(bounds);
    }

    if (parcels) {
        log(`Parcels: ${parcels}`);
        // log(`Value: ${value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`)
    }
}

function lookup(e) {

    //    console.log(e);
    var point = L.latLng(e.latlng.lat, e.latlng.lng);

    var dist = 1000
        var match = {}
    var length = addresses.length

        for (var i = 0; i < length; i++) {
            var address = addresses[i];
            var a = L.latLng(address.lat, address.lon)
                var d = mymap.distance(point, a)
                if (d < dist) {
                    dist = d;
                    match = address;
                }
        }

        var props = properties.filter(x => x['HOUSE NO'] == match.number && x['STREET'] == match.street)
}

mymap.on('click', lookup);

function hi(e) {

    let parcels = [];
    if (e.options) {

        var o = e.options;
        // label?
        if (o.icon) {
            o = o.icon.options.options;
        }

        parcels = properties.filter(x => x.HOUSE_NO == o.number && x.STREET == o.street);
        parcels.map(x => console.log(x.PARCEL_ID));
    }

    if (parcels.length) {
        var data = [`${parcels[0].HOUSE_NO} ${parcels[0].STREET} (${parcels[0].ZONE_DESP})`];
        if (parcels[0].UNIT) {
            data.push(`${parcels.length} Units`);
        }

        for (var i = 0; i < parcels.length; i++) {
            var parcel = parcels[i];
            var line = '';
            if (parcel.UNIT) {
                line = `Unit: ${parcel.UNIT} `;
            }

            var price = parseInt(parcel.SALE_PRICE);
            var pf = price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            })
                var val = parseInt(parcel.PARCEL_VAL);
            var vf = val.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            })
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

    for (var i = 0; i < checks.length; i++) {
        checks[i].checked = !checks[i].checked;
    }

    draw();
}

const load = async() => {

    let start = new Date;

    let values = [];
    let zones = [];
    let wards = [];

    let json = '';

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
        if(!json) {
        json = 'var parcelWards = [\r\n';
        let m1 = L.marker([a.lat, a.lon]);
        let wardFound = false;
        wardsLayer.eachLayer(function(layer) {
        if(layer.contains(m1.getLatLng())) {
        json += `    { parcel: '${a.parcel}', ward: '${layer.feature.properties.Ward}' },\r\n`;
        wardFound = true;
        }
        });

         */

        a.interval = 0;

        for (var c = step; c < scale; c += step) {
            if (a.value >= c) {
                a.interval++;
            }
        }

        if (values[a.interval]) {
            values[a.interval]++;
        } else {
            values[a.interval] = 1;
        }

        if (a.zoning == '') {
            a.zoning = 'Blank';
        }

        var exists = zones.filter(x => x.zone == a.zoning);
        if (exists.length) {
            exists[0].count++;
        } else {
            zones.push({
                zone: a.zoning,
                count: 1
            });
        }

        if (!wards.includes(a.ward)) {
            wards.push(a.ward);
        }

        if (a.price > maxPrice) {
            maxPrice = a.price;
        }

        if (a.value > maxValue) {
            maxValue = a.value;
        }

        if (a.price < minPrice && a.price > 0) {
            minPrice = a.price;
        }

        if (a.value < minValue && a.value > 0) {
            minValue = a.value;
        }
        addresses.push(a);
    }

    if (json) {
        json += '];';
        console.log(json);
    }

    let now = new Date;
    log(`loaded ${addresses.length} addresses in ${now - start} milliseconds`);

    addValues(values);
    addZones(zones);
    addWards(wards);

    start = new Date
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

    now = new Date
        log(`loaded ${properties.length} properties in ${now - start}`)

}

const color = async() => {
    // add buildings

    let start = new Date;

    var temp = addresses;
    let i = 0;
    let counter = document.getElementById('counter');

    buildingsLayer.eachLayer(function (layer) {

        i++;
        polygons.push(layer);

        var c = layer.feature.geometry.coordinates[0]
            var cRev = [];
        for (let i = 0; i < c.length; i++) {
            let coord = c[i];
            cRev.push([coord[1], coord[0]]);
        }

        var polygon = L.polygon(cRev);
        var bounds = polygon.getBounds();

	let corner1 = bounds.getSouthWest();
	let corner2 = bounds.getNorthEast();

		// calculate interval as average of values
		let values = [];

        for (let i = 0; i < temp.length; i++) {

            let address = temp[i];

			if(layer.options.street && layer.options.number != address.number && layer.options.street != address.street) {
									
					let total = 0;
					values.forEach(function(v) { total += v });
					let average = total/values.length;
					
					layer.options.interval = 0;
					for (var c = step; c < scale; c += step) {
						if (average >= c) {
							layer.options.interval++;
						}
					}
		
					var style = {
						color: colors[layer.options.interval],
						fillOpacity: .5
					};
					layer.setStyle(style);
					
					break;
			}

	    // simple discard
	    if(address.lat < corner1.lat || address.lat > corner2.lat || address.lon < corner1.lng || address.lon > corner2.lng)
	    {
		continue;
	    }
	    
            let a = L.latLng(address.lat, address.lon);

            if (bounds.contains(a)) {

				values.push(address.value);
				
                layer.options.street = address.street;
                layer.options.number = address.number;
                layer.options.ward = address.ward;
                layer.options.zoning = address.zoning;

                temp.splice(i, 1);
            }

        }
    });

    buildingsLayer.bindPopup(hi);
    document.getElementById('loader').style.display = 'none';

    let end = new Date;
    log(`colored ${i} polygons in ${end - start}`)

    return "done";
}

function addValues(values) {

    var table = document.getElementById('legend')

        let thead = table.createTHead();
    let row = thead.insertRow();
    let th = document.createElement("th");
	th.colSpan = 2
	
    let button = document.createElement('button');
	button.textContent = "Value"
    button.id = 'toggle_value';
    button.style.width = "100%"
    button.addEventListener("click", toggle);
    th.appendChild(button);

    row.appendChild(th);

    for (let i = 0; i < scale; i += step) {
        let row = table.insertRow();
        let c1 = document.createElement('td');
        c1.bgColor = colors[(i / step)];

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
        let count = values[i / step];
        if (i == scale - step) {
            text = `${i.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} and over (${count.toLocaleString()})`;
        } else {
            var from = i.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            })
                var to = (i + step).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            })
                text = `${from} to ${to} (${count.toLocaleString()})`;
        }

        let t = document.createTextNode(text);
        c2.appendChild(t);
        row.appendChild(c2);
    }
}

const addZones = async(zones) => {
    var table = document.getElementById('zones');

        let thead = table.createTHead();
    let row = thead.insertRow();
    let th = document.createElement("th");
	th.colSpan = 2;
	
    let button = document.createElement('button');
    button.id = 'toggle_zone';
	button.textContent = "Zones"
    button.style.width = "100%"
    button.addEventListener("click", toggle);
    th.appendChild(button);

    row.appendChild(th);

    //    zones = zones.sort();

    for (let i = 0; i < zones.length; i++) {
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

            let text = `${zones[i].zone} (${zones[i].count.toLocaleString()})`; ;

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
    button.textContent = 'Ward'
    button.id = 'toggle_ward';
    button.addEventListener("click", toggle);

    let th = document.createElement("th");
	th.colSpan = 2;
    th.appendChild(button);

    row.appendChild(th);

    wards = wards.sort();

    for (let i = 0; i < wards.length; i++) {

        let ward = wards[i];
        let row = table.insertRow();
        let c1 = document.createElement('td');

        if (ward) {
            c1.bgColor = wardColors[i];
        }

        let check = document.createElement("INPUT");
        check.setAttribute("type", "checkbox");
        check.setAttribute('id', `ward_${i+1}`);
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
        box.innerHTML += `${message}\r\n`
        box.style.visibility = 'visible'

}

load().then(
//    setTimeout(function () {
        color()
//}, 0)
);

let end = new Date;

/*
['mapContainer', 'controls'].forEach(function(id) {
let element = document.getElementById(id);
let style = getComputedStyle(element)
console.log('display: ' + style.display);
if (style.display === "none") {
element.style.display = "flex";
} else {
element.style.display = "none";
}
});
 */
