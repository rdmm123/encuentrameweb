from typing import final
from django.shortcuts import render
from .models import Location
from django.http import JsonResponse, HttpResponse
from django.core import serializers
import json
import datetime as dt  


# Create your views here.
def homepage_view(request):
    context = {"home_page": "active"}
    return(render(request, 'base.html', context))

def get_location(request):
    last_location = Location.objects.latest('id')
    
    last_location_json = json.loads(serializers.serialize('json', [last_location]))[0]
    return JsonResponse(last_location_json["fields"])

def get_route(request, date, start_time, end_time):
    route_query = Location.objects.filter(date=date)
    route_values = route_query.values()

    start_dt = dt.time(*map(int, start_time.split(':')))
    end_dt = dt.time(*map(int, end_time.split(':')))

    final_query = []

    for location in route_values:
        curr_dt = dt.time(*map(int, location["time"].split(':')))
        if isNowInTimePeriod(start_dt, end_dt, curr_dt):
            final_query.append(location)

    route_json = {'route': final_query}
    return  JsonResponse(route_json, safe=False)

def isNowInTimePeriod(startTime, endTime, nowTime): 
    if startTime < endTime: 
        return nowTime >= startTime and nowTime <= endTime 
    else: 
        return nowTime >= startTime or nowTime <= endTime