let CenterCoords = [37.2960514,-122.1457572]; //San Jose
let mapZoomLevel = 9;
let myMap;

// Create the createMap function.
function createMap(Earthquakes) {
  // Create the tile layer that will be the background of our map.
let backgroundMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
  // Create a baseMaps object to hold the map layer.
let BaseMaps = {
  "Street Map": backgroundMap
};
  // Create an overlayMaps object to hold the Earthquakes layer.
let overlayMaps = {
  "Earthquakes": Earthquakes
};
  // Create the map object with options.
myMap = L.map("map", {
    center: CenterCoords,
    zoom: mapZoomLevel,
    layers: [backgroundMap, Earthquakes]
})
  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
L.control.layers(BaseMaps, overlayMaps).addTo(myMap);
createLegend();
}

function createLegend() {
    // Create a legend to display information about Earthquake depths.
    let legend = L.control({
      position: "bottomright"
    });

    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "legend");
      div.innerHTML = [
        "<h3>Legend" + "</h3>",
        "<table>",
        "<th>" + "Color" + "</th>",
        "<th>" + "Depth (km)" + "</th>",
        "<tr>",
        "<td class='greaterthan90'>" + "</td>",
        "<td style='text-align: center;'>" +"> 90" + "</td>",
        "</tr>",
        "<tr>",
        "<td class='greaterthan70'>" + "</td>",
        "<td style='text-align: center;'>" +"70 - 90" + "</td>",
        "</tr>",
        "<tr>",
        "<td class='greaterthan50'>" + "</td>",
        "<td style='text-align: center;'>" +"50 - 70" + "</td>",
        "</tr>",
        "<tr>",
        "<td class='greaterthan30'>" + "</td>",
        "<td style='text-align: center;'>" +"30 - 50" + "</td>",
        "</tr>",
        "<tr>",
        "<td class='greaterthan10'>" + "</td>",
        "<td style='text-align: center;'>" +"10 - 30" + "</td>",
        "</tr>",
        "<tr>",
        "<td class='lessthan10'>" + "</td>",
        "<td style='text-align: center;'>" +"< 10" + "</td>",
        "</tr>",
        "</table>"
      ].join("");
      return div;
    };
  
    // Add the info legend to the map.
    legend.addTo(myMap);
  }  

// Create the createMarkers function.
function createMarkers(response) {
let All_EarthquakeMarkers = [];
  // Loop through the Earthquakes array.
    // For each earthquake, create a marker, and bind a popup with additional information regarding the earthquake.
  for (let i = 0; i < response.features.length; i++) {
    let earthquake = response.features[i];
    let longitude = earthquake.geometry.coordinates[0];
    let latitude = earthquake.geometry.coordinates[1];
    let depth = earthquake.geometry.coordinates[2];
    let magnitude = earthquake.properties.mag;
    let place = earthquake.properties.place;
    let url = earthquake.properties.url;

    let timestamp = earthquake.properties.time;
    // Create a Date object from the timestamp
    let date = new Date(timestamp);
    // Extract date and time components
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours() + 5).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    // Create a formatted date and time string
    let formattedDateTime = `${month}/${day}/${year} ${hours}:${minutes}`;

    //Format circles based on earthquake depth.
    let color = "";
    if (depth > 90) {
      color = "rgb(153,0,0)";
    }
    else if (depth > 70) {
      color = "rgb(255,0,0)";
    }
    else if (depth > 50) {
      color = "rgb(204,102,0)";
    }
    else if (depth > 30) {
        color = "rgb(255,153,51)";
      }
    else if (depth > 10) {
        color = "rgb(255,255,0)";
      }
    else {
      color = "rgb(0,255,0)";
    }

    let EarthquakeMarker = L.circle([latitude, longitude], {
        fillOpacity: 0.7,
        color: 'black',
        weight: 1,
        fillColor: color,
        radius: magnitude * 2000
    }).bindPopup(
    "<b>Date/Time: </b>" + formattedDateTime + " (UTC)"
    + "<br>" +
    "<b>Magnitude: </b>" + magnitude + " md"
    + "<br>" +
    "<b>Depth: </b>" + depth + " km"
    + "<br>" +
    "<b>Place: </b>" + place
    + "<br>" +
    "<b>Longitude: </b>" + longitude
    + "<br>" +
    "<b>Latitude: </b>" + latitude
    + "<br>" +
    "<a href=" + url + " target=_blank>" + "More Details" + "</a>"
    );
    // Add the marker to the EarhquakeMarkers array.
    All_EarthquakeMarkers.push(EarthquakeMarker);
  }
  // Create a layer group that's made from the All_EarthquakeMarkers array, and pass it to the createMap function.
  createMap(L.layerGroup(All_EarthquakeMarkers));
}

// Perform an API call to the Earthquake API to get the station information. Call createMarkers when it completes.
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(createMarkers);