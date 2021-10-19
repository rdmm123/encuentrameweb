
// Initialize and load map
var mymap = L.map('mapid');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(mymap);
mymap.setZoom(16);


var plates = JSON.parse(document.getElementById('plates').textContent)
var first = new Array(plates.length).fill(true);
var marker = new Array(plates.length);
var startMarker = new Array(plates.length);// Initialize marker
var locList = new Array(plates.length).fill([]) // List of received locations
var traceRoute = true; // To check if the route needs to be traced
var polyline = new Array(plates.length).fill(L.polyline([], {color: 'red'}));
var currLoc = new Array(plates.length);
var getLocationUrl = "ajax/get_location/"

$(document).ready(doPoll); // Execute the function as soon as the page is ready

// Make ajax requests to the server every 2 seconds
function doPoll(){
    plates.forEach((plate, i) => {
        $.ajax({
            type: 'GET',
            url: getLocationUrl + plate,
            success: function(response){                       
                console.log(response, i) // To check if everything is correct
                var date = response.timestamp.split("T")[0];
                var time = response.timestamp.split("T")[1].split("Z")[0];
                
    
                // Generates the HTML table that contains the location data
                table = generateTable(response.latitude, response.longitude, date, time, response.plate, 5);
                
                currLoc[i] = [response.latitude, response.longitude];
    
                // The initial execution of the function initializes markers and popups
                if (first[i]) {
                    startMarker[i] = L.marker(currLoc[i]).addTo(mymap);
                    mymap.panTo(currLoc[i]); // Centers the map to the current location
                    marker[i] = new L.marker(currLoc[i]).addTo(mymap);
                    var popup = new L.popup({autoPan: false}).setContent(table);
                    marker[i].bindPopup(popup).openPopup();
                    first[i] = false;
                }
    
                marker[i].setLatLng(currLoc[i]);
                marker[i]._popup.setContent(table);
                
                var lastLoc = locList[i].at(-1);
                console.log(lastLoc, i);
                console.log(currLoc[i], i);
                if (!arraysEqual(currLoc[i], lastLoc) && traceRoute && lastLoc != undefined) {
                    locList[i].push(currLoc[i]);
                }
                console.log(locList[i], i)
    
                if (traceRoute) {
                    polyline[i].setLatLngs(locList[i]).addTo(mymap);
                }
            },
            error: function(response){
                console.log("error in ajax")
            }
    });
    })
    setTimeout(doPoll, 2000);
}

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

function generateTable(lat, lon, date, time, plate, txtSize) {
    var table = 
        `
        <h${txtSize}>
            <table class="table table-sm table-fit table-borderless mx-auto my-0 py-0" id="pos">
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
                        <th scope="row">Placa</th>
                        <td colspan="2" id="placa"><span class="badge bg-light text-dark rounded-pill border border-dark">${plate}</span></td>
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
        </h${txtSize}>
        `;
    return table;
}

$('#trace').change(function() {
    traceRoute = $(this).prop('checked');
    plates.forEach((plate, i) => {
        if (traceRoute) {
            locList[i].push(currLoc[i])
            startMarker[i] = L.marker(currLoc[i]).addTo(mymap);
        } else {
            locList[i] = []
            mymap.removeLayer(startMarker[i]);
            polyline[i].setLatLngs([]);
        }
    });
 })