var routemap = L.map('routemap').setView([11, -74.8], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(routemap);

var route = L.polyline([], {color: 'red'});
var marker1 =  L.marker([]); 
var marker2 =  L.marker([]); 


$('#datepicker').datepicker({
    format: "yyyy-mm-dd",
    language: "es",
    autoclose: true,
    // todayHighlight: true,
});

$('#accept').click(function () {
    var inDate = document.getElementById("inDate").value
    var start = document.getElementById("start").value + ":00"
    var end = document.getElementById("end").value + ":00"
    
    var routeUrl = "ajax/get_route/" + inDate + "/" + start + "/" + end
    routeUrl = routeUrl.replace('date', inDate);
    routeUrl = routeUrl.replace('start', start);
    routeUrl = routeUrl.replace('end', end);

    $.ajax({
        type: 'GET',
        url: routeUrl,
        success: function(response){
            routemap.removeLayer(marker1);
            routemap.removeLayer(marker2);
            route.setLatLngs([])

            console.log(response) // To check if everything is correct
            routeList = response.route;
            locationList = routeList.map(function (json) {
                return [json.latitude, json.longitude]
            })
            route.setLatLngs(locationList).addTo(routemap);
            routemap.fitBounds(route.getBounds());

            marker1.setLatLng(locationList[0]).addTo(routemap);
            startTable = generateTable(routeList[0].latitude, routeList[0].longitude, routeList[0].date, routeList[0].time);
            var popup1 = new L.popup({autoPan: false}).setContent(startTable);
            marker1.bindPopup(popup1).openPopup();

            marker2.setLatLng(locationList.at(-1)).addTo(routemap);
            endTable = generateTable(routeList.at(-1).latitude, routeList.at(-1).longitude, routeList.at(-1).date, routeList.at(-1).time);
            popup2 = new L.popup({autoPan: false}).setContent(endTable);
            marker2.bindPopup(popup2).openPopup();
        },
        error: function(response){
            console.log("error in ajax")
        }
    })
})