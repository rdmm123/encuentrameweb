var routemap = L.map('routemap').setView([11, -74.8], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap;',
    maxZoom: 18,
}).addTo(routemap);

var route = L.polyline([], {color: 'red'});
var marker1 =  L.marker([]); 
var marker2 =  L.marker([]); 


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
                var startDate = routeList[0].timestamp.split("T")[0];
                var startTime = routeList[0].timestamp.split("T")[1].split("Z")[0];
                startTable = generateTable(routeList[0].latitude, routeList[0].longitude, startDate, startTime);
                var popup1 = new L.popup({autoPan: false}).setContent(startTable);
                marker1.bindPopup(popup1).openPopup();

                marker2.setLatLng(locationList.at(-1)).addTo(routemap);
                var endDate = routeList.at(-1).timestamp.split("T")[0];
                var endTime = routeList.at(-1).timestamp.split("T")[1].split("Z")[0];
                endTable = generateTable(routeList.at(-1).latitude, routeList.at(-1).longitude, endDate, endTime);
                popup2 = new L.popup({autoPan: false}).setContent(endTable);
                marker2.bindPopup(popup2).openPopup();
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
