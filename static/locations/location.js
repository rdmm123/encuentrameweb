
// Initialize and load map
var mymap = L.map('mapid');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(mymap);
mymap.setZoom(16);


// Initialize routing machine for map
var routing;
var first = true; // To check if it is the first time the function executes
var marker, startMarker; // Initialize marker
var locList = [] // List of received locations
var traceRoute; // To check if the route needs to be traced
var polyline = L.polyline([], {color: 'red'});

$(document).ready(doPoll); // Execute the function as soon as the page is ready

// Make ajax requests to the server every 2 seconds
function doPoll(){
    $.ajax({
        type: 'GET',
        url: getLocationUrl,
        success: function(response){                       
            console.log(response) // To check if everything is correct

            // Generates the HTML table that contains the location data
            table = generateTable(response.latitude, response.longitude, response.date, response.time);
            
            currLoc = [response.latitude, response.longitude];

            // The initial execution of the function initializes markers and popups
            if (first) {
                mymap.panTo(currLoc); // Centers the map to the current location
                marker = new L.marker(currLoc).addTo(mymap);
                var popup = new L.popup({autoPan: false}).setContent(table);
                marker.bindPopup(popup).openPopup();
                first = false;
            }

            marker.setLatLng(currLoc);
            marker._popup.setContent(table);
            
            lastLoc = locList.at(-1);
            if (!arraysEqual(currLoc, lastLoc) && traceRoute) {
                locList.push(currLoc);
            }

            console.log(locList);
            if (traceRoute) {
                // polyline.setLatLngs(locList).addTo(mymap);
                routing.setWaypoints(locList);
                routing.route({allowUTurns: true})
                routing.hide()
            }
        },
        error: function(response){
            console.log("error in ajax")
        }
    })
    setTimeout(doPoll, 2000);
}

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

function generateTable(lat, lon, date, time) {
    var table = 
        `
        <h5>
            <table class="table table-sm table-fit table-borderless mx-auto" id="pos">
                <tbody>
                    <tr>
                        <th scope="row">Latitud</th>
                        <td colspan="2" id="latitude"><span class="badge bg-light text-dark rounded-pill border border-dark">${lat}</span></td>
                    </tr>
                    <tr>
                        <th scope="row">Longitud</th>
                        <td colspan="2" id="longitude"><span class="badge bg-light text-dark rounded-pill border border-dark">${lon}</span></td>
                    </tr>
                    <tr>
                        <th scope="row">Fecha</th>
                        <td colspan="2" id="date"><span class="badge bg-light text-dark rounded-pill border border-dark">${date}</span></td>
                    </tr>
                    <tr>
                        <th scope="row">Hora</th>
                        <td colspan="2" id="time"><span class="badge bg-light text-dark rounded-pill border border-dark">${time}</span></td>
                    </tr>
                </tbody>
            </table>
        </h5>
        `;
    return table;
}

$('#trace').change(function() {
    traceRoute = $(this).prop('checked');
    if (traceRoute) {
        locList.push(currLoc)
        startMarker = L.marker(currLoc).addTo(mymap);
        routing = L.Routing.control({
            plan: L.Routing.plan([], {
                createMarker: () => false
            }),
            fitSelectedRoutes: false,
            waypointMode: 'snap',
            autoRoute: false,
        }).addTo(mymap);
        routing.route();
    } else {
        locList = []
        mymap.removeControl(routing);
        mymap.removeLayer(startMarker);
        polyline.setLatLngs([]);
    }
 })