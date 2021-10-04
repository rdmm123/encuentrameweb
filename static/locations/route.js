var routemap = L.map('routemap').setView([11, -74.8], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(routemap);

var route = L.polyline([], {color: 'red'});
var routeMarker = L.marker([]);
var rangeCircle = L.circle([]);
// var marker1 =  L.marker([]); 
// var marker2 =  L.marker([]); 
var locationList, routeList;


$(function() {
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        autoUpdateInput: false,
        locale: {
            format: 'YYYY-MM-DD hh:mm',
            applyLabel: "Aceptar",
            cancelLabel: "Cancelar",
        }
    });

    $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD hh:mm') + ' a ' + picker.endDate.format('YYYY-MM-DD hh:mm'));
        var daterange = document.getElementById("datetime").value
        var startDt = daterange.split(" a ")[0]
        var endDt = daterange.split(" a ")[1]
        startDt = startDt.replace(" ", "_") + ":00"
        endDt = endDt.replace(" ", "_") + ":00"
        
        var routeUrl = "ajax/get_route/" + startDt + "/" + endDt

        $.ajax({
            type: 'GET',
            url: routeUrl,
            success: function(response){
                // routemap.removeLayer(marker1);
                // routemap.removeLayer(marker2);
                route.setLatLngs([])

                console.log(response) // To check if everything is correct
                routeList = response.route;
                locationList = routeList.map(function (json) {
                    return [json.latitude, json.longitude]
                })
                route.setLatLngs(locationList).addTo(routemap);
                routemap.fitBounds(route.getBounds());

                // marker1.setLatLng(locationList[0]).addTo(routemap);
                // var startDate = routeList[0].timestamp.split("T")[0];
                // var startTime = routeList[0].timestamp.split("T")[1].split("Z")[0];
                // startTable = generateTable(routeList[0].latitude, routeList[0].longitude, startDate, startTime);
                // var popup1 = new L.popup({autoPan: false}).setContent(startTable);
                // marker1.bindPopup(popup1).openPopup();

                // marker2.setLatLng(locationList.at(-1)).addTo(routemap);
                // var endDate = routeList.at(-1).timestamp.split("T")[0];
                // var endTime = routeList.at(-1).timestamp.split("T")[1].split("Z")[0];
                // endTable = generateTable(routeList.at(-1).latitude, routeList.at(-1).longitude, endDate, endTime);
                // popup2 = new L.popup({autoPan: false}).setContent(endTable);
                // marker2.bindPopup(popup2).openPopup();
            },
            error: function(response){
                console.log("error in ajax")
            }
        })
    });
  
    $('input[name="datetimes"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
});

routemap.on('click', function(e) {
    $(".item").remove()
    var distances =  locationList.map((latLng) => routemap.distance(latLng, e.latlng));
    var distancesRounded = distances.map((d) => Math.ceil(d/25) * 25);

    console.log(distances);
    console.log(distancesRounded);
    var rangeMts = 25;
    
    var minIdx = index(distancesRounded, rangeMts);

    routeMarker.setLatLng(e.latlng).addTo(routemap);
    rangeCircle.setLatLng(e.latlng).setRadius(25).addTo(routemap);

    minIdx.forEach(idx => {
        var routeDate = routeList[idx].timestamp.split("T")[0];
        var routeTime = routeList[idx].timestamp.split("T")[1].split("Z")[0];
        
        var routeTable = generateTable(routeList[idx].latitude, routeList[idx].longitude, routeDate, routeTime, 6);
        var toappend = '<div class="container-fluid border bg-white rounded-max pt-2 mb-2 item px-0">' + routeTable + '<div/>'
        $("#loc-list").append(toappend);
    });
    
})

function index(arr, num) {
    var idxs  = [];
    arr.filter(function(elem, index) {
        if(elem == num){
            idxs.push(index)
        }
    });
    return idxs
}
