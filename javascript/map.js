var mymap = L.map('mapid').setView([42.3955522,-71.1387673], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);


const draw = async() => {
	var p = [];
	
	var length = properties.length;
	var seen = [];
	for(var i = 0; i < length; i++) {
		var x = properties[i].split('\t')
		
		var plot = {};
		for(var f = 0; f < fields.length; f++) {
			plot[fields[f]] = x[f];
		}
		
		if(plot.lat == 'None')
			continue;
		
		/*
		var address = `${plot['HOUSE NO']} ${plot['STREET']}`;
		if(seen.includes(address))
			continue;
			
		seen.push(address);
		*/
		
		p.push(plot);
	}
	
	console.log(p.length);
}

draw();