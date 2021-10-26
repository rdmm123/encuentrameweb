var routemap = L.map('routemap').setView([11, -74.8], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(routemap);

var route = new Array(allPlates.length);
route[0] = L.polyline([], {color: 'red'});
route[1] = L.polyline([], {color: 'blue'});
var routeMarker = L.marker([]);
var rangeCircle = L.circle([]);
// var marker1 =  L.marker([]); 
// var marker2 =  L.marker([]); 
var locationList, routeList;
var carRoute = $("#carselect-route :selected").val();
var daterange, startDt, endDt, routeUrl;


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
        daterange = document.getElementById("datetime").value
        startDt = daterange.split(" a ")[0]
        endDt = daterange.split(" a ")[1]
        startDt = startDt.replace(" ", "_") + ":00"
        endDt = endDt.replace(" ", "_") + ":00"
        
        routeUrl = "ajax/get_route/" + carRoute + "/" + startDt + "/" + endDt

        pollRoute();
    });
  
    $('input[name="datetimes"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
});

$("#carselect-route").change(function() {
    carRoute = $("#carselect-route :selected").val();
    routeUrl = "ajax/get_route/" + carRoute + "/" + startDt + "/" + endDt
    pollRoute();
 });

routemap.on('click', function(e) {
    $(".item").remove()

    var rangeMts = 25;
    routeMarker.setLatLng(e.latlng).addTo(routemap);
    rangeCircle.setLatLng(e.latlng).setRadius(rangeMts).addTo(routemap);

    var distances =  locationList.map((latLng) => routemap.distance(latLng, e.latlng));
    var distancesRounded = distances.map((d) => Math.ceil(d/rangeMts) * rangeMts);

    console.log(distances);
    console.log(distancesRounded);
    
    var minIdx = index(distancesRounded, rangeMts);

    minIdx.forEach(idx => {
        var routeDate = routeList[idx].timestamp.split("T")[0];
        var routeTime = routeList[idx].timestamp.split("T")[1].split("Z")[0];
        
        var routeTable = generateTable(routeList[idx].latitude, routeList[idx].longitude, routeDate, routeTime, routeList[idx].plate, 6);
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

function pollRoute() {
    $.ajax({
        type: 'GET',
        url: routeUrl,
        success: function(response){
            route.forEach(polyline => {
                polyline.setLatLngs([]);
            });

            console.log(response) // To check if everything is correct
            routeList = response.route;
            console.log(routeList);
            locationList = routeList.map(function (json) {
                return [json.latitude, json.longitude]
            })
            console.log(locationList);

            allPlates.forEach((plate, i) => {
                console.log(plate)
                plateRoute = routeList.filter((location) => location.plate == plate)
                plateLocations = plateRoute.map(function (json) {
                    return [json.latitude, json.longitude]
                })
                console.log(plateLocations)
                route[i].setLatLngs(plateLocations).addTo(routemap);
            });
            routemap.fitBounds(L.polyline(locationList).getBounds());
            
        },
        error: function(response){
            console.log("error in ajax")
        }
    })
}