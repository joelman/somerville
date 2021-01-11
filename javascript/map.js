var mymap = L.map('mapid').setView([42.3955522, -71.1387673], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

mymap.on('click', function (e) {
    //console.log(e);
    var point = L.latLng(e.latlng.lat, e.latlng.lng);

    var script = document.createElement('script');
    script.src = `https://nominatim.openstreetmap.org/reverse?lat=${point.lat}&lon=${point.lng}&format=json&json_callback=lookup`;

    document.querySelector('head').appendChild(script);
});

function lookup(response) {
    //console.log(response)
    var number = response.address.house_number;
    var street = response.address.road;

    if (!number || !street) {
        console.log(response);
        return;
    }

    var abbrevs = [['Boulevard', 'BLVD'], ['Street', 'ST'], ['Avenue', 'AVE'], ['Terrace', 'TERR'], ['Road', 'RD']];

    abbrevs.map(x => street = street.replace(x[0], x[1]))
    street = street.toUpperCase();

    console.log(`${number} ${street}`);

    var prop = properties.filter(function (row) {
        var n = number.split(';')
            for (var i = 0; i < n.length; i++) {

                if (row['HOUSE NO'] == n[i] && row['STREET'] == street)
                    return true;
            }

            return false;
    });

    console.log(prop);

}

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
        /*
        var circle = L.circle([a.lat, a.lon], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 1,
        radius: 1
        });


        circle.bindPopup(`${a.number} ${a.street}`).openPopup();

        circle.addTo(mymap);
         */
    }

    console.log(`loaded ${addresses.length} addresses.`)

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
    console.log(`loaded ${properties.length} properties.`)
}

draw();
load();