var cars = $("#carselect :selected").val();
console.log(cars);

// Initialize and load map
var mymap = L.map('mapid');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(mymap);
mymap.setZoom(16);

var allPlates = JSON.parse(document.getElementById('plates').textContent);
var plates = getPlates(cars);
var first = new Array(allPlates.length).fill(true);
var marker = new Array(allPlates.length);
var startMarker = new Array(allPlates.length);// Initialize marker
var locList = new Array(allPlates.length).fill().map(() => []) // List of received locations
var lastLoc = new Array(allPlates.length);
var traceRoute = true; // To check if the route needs to be traced
var polyline = new Array(allPlates.length);
polyline[0] = L.polyline([], {color: 'red'});
polyline[1] = L.polyline([], {color: 'blue'});
var currLoc = new Array(allPlates.length);
var getLocationUrl = "ajax/get_location/"

$(document).ready(doPoll); // Execute the function as soon as the page is ready

// Make ajax requests to the server every 2 seconds
function doPoll(){
    plates.forEach((plate) => {
        $.ajax({
            type: 'GET',
            url: getLocationUrl + plate,
            success: function(response){  
                i = allPlates.indexOf(plate);
                if (plates.length <= 1) {
                    var toRemove = removeElement(plates[0], allPlates);
                    clearMap(toRemove);
                }

                console.log(response, i) // To check if everything is correct
                var date = response.timestamp.split("T")[0];
                var time = response.timestamp.split("T")[1].split("Z")[0];
                
    
                // Generates the HTML table that contains the location data
                table = generateTable(response.latitude, response.longitude, date, time, response.plate, response.humidity, 6);
                
                currLoc[i] = [response.latitude, response.longitude];
                if (plates.length <= 1) {
                    mymap.panTo(currLoc[i])
                }
    
                // The initial execution of the function initializes markers and popups
                if (first[i]) {
                    startMarker[i] = L.marker(currLoc[i]).addTo(mymap);
                    mymap.panTo(currLoc[i]); // Centers the map to the current location
                    marker[i] = new L.marker(currLoc[i]).addTo(mymap);
                    var popup = new L.popup({autoPan: false}).setContent(table);
                    marker[i].bindPopup(popup).openPopup();
                    console.log(JSON.parse(JSON.stringify(locList[i])), i);
                    first[i] = false;
                }
    
                marker[i].setLatLng(currLoc[i]);
                marker[i]._popup.setContent(table);
                
                lastLoc[i] = locList[i].at(-1);
                
                console.log(arraysEqual(currLoc[i], lastLoc[i]))
                if (!arraysEqual(currLoc[i], lastLoc[i]) && traceRoute) {
                    locList[i].push(currLoc[i]);
                }
    
                if (traceRoute) {
                    console.log(JSON.parse(JSON.stringify(locList[i])), i);
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

function generateTable(lat, lon, date, time, plate, humidity, txtSize) {
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
                    <tr>
                        <th scope="row">Humedad</th>
                        <td colspan="2" id="time"><span class="badge bg-light text-dark rounded-pill border border-dark">${humidity}</span></td>
                    </tr>
                </tbody>
            </table>
        </h${txtSize}>
        `;
    return table;
}

$('#trace').change(function() {
    traceRoute = $(this).prop('checked');
    allPlates.forEach((plate, i) => {
        if (traceRoute) {
            locList[i].push(currLoc[i])
            startMarker[i] = L.marker(currLoc[i]).addTo(mymap);
        } else {
            locList[i] = []
            mymap.removeLayer(startMarker[i]);
            polyline[i].setLatLngs([]);
        }
    });
 });

 $("#carselect").change(function() {
    var cars = $("#carselect :selected").val();
    console.log(cars);
    plates = getPlates(cars);
    if (plates.length <= 1) {
        var toRemove = removeElement(plates[0], allPlates);
        clearMap(toRemove);
    }
 });

 function getPlates(opt) {
     var plates;
     if (opt == "all") {
        plates = allPlates;
     } else {
        plates = [opt]
     }
     console.log(plates)
     return plates;
 }

 function clearMap(platesToRemove) {
    allPlates.forEach((plate, i) => {
        if (platesToRemove.includes(plate)) {
            locList[i] = [];
            mymap.removeLayer(startMarker[i]);
            mymap.removeLayer(marker[i]);
            polyline[i].setLatLngs([]);
            first[i] = true;
        }
    });
 }

 function removeElement(element, array) {
    var filtered = array.filter(function(value, index, arr){ 
        return value!=element;
    });
    return filtered;
 }

