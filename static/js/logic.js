 // API endpoint
let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Get request to the URL
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3>
                         <hr><p>Location: ${feature.properties.place}</p>
                         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }

    // Create earthquake layer with markers styled by depth and magnitude
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            let depth = feature.geometry.coordinates[2];
            let color = getColor(depth);
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: color,
                color: "white",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.75
            });
        },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function getColor(depth) {
    return depth > 90 ? "red" :
           depth > 70 ? "darkorange" :
           depth > 50 ? "orange" :
           depth > 30 ? "yellow" :
           depth > 10 ? "yellowgreen" :
           "green";
}

function createMap(earthquakes) {
    let myMap = L.map("map", {
        center: [15.5994, -28.6731],
        zoom: 3,
    });

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    // Add earthquakes layer
    earthquakes.addTo(myMap);

    // Add legend for depth colors
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
            
        // Style the legend's white background and padding
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)";
            
        
        
        
        let depthRanges = [-10, 10, 30, 50, 70, 90],
            colors = ["green", "yellowgreen", "yellow", "orange", "darkorange", "red"];
        for (let i = 0; i < depthRanges.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> 
                ${depthRanges[i]}${(depthRanges[i + 1] ? `&ndash;${depthRanges[i + 1]}` : '+')} km<br>`;
            }
            return div;
        };
    legend.addTo(myMap);
}
