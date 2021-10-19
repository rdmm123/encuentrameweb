from typing import final
from django.shortcuts import render
from .models import Location
from django.http import JsonResponse, HttpResponse
from django.core import serializers
import json
import datetime as dt  


# Create your views here.
def homepage_view(request):
    plates_query = Location.objects.values_list("plate", flat=True)
    plates = list(dict.fromkeys(plates_query))

    context = {"home_page": "active", "plates": plates}
    return(render(request, 'base.html', context))

def get_location(request, plate):
    location_query = Location.objects.filter(plate=plate)
    last_location = location_query.latest('id')
    
    last_location_json = json.loads(serializers.serialize('json', [last_location]))[0]
    return JsonResponse(last_location_json["fields"])

def get_route(request, start_ts, end_ts):
    start_dt = dt.datetime.strptime(start_ts, "%Y-%m-%d_%H:%M:%S")
    end_dt = dt.datetime.strptime(end_ts, "%Y-%m-%d_%H:%M:%S")
    route_query = Location.objects.filter(timestamp__range=(start_dt, end_dt))
    route_values = route_query.values()

    route_json = {'route': list(route_values)}
    return  JsonResponse(route_json, safe=False)

def isNowInTimePeriod(startTime, endTime, nowTime): 
    if startTime < endTime: 
        return nowTime >= startTime and nowTime <= endTime 
    else: 
        return nowTime >= startTime or nowTime <= endTime