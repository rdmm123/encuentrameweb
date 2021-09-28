from django.shortcuts import render
from .models import Location
from django.http import JsonResponse, HttpResponse
from django.core import serializers
import json


# Create your views here.
def homepage_view(request):
    context = {"home_page": "active"}
    return(render(request, 'base.html', context))

def get_location(request):
    last_location = Location.objects.latest('id')
    
    last_location_json = json.loads(serializers.serialize('json', [last_location]))[0]
    return JsonResponse(last_location_json["fields"])

def get_route(request, date):
    route_query = Location.objects.filter(date=date)
    route_json = {'route': list(route_query.values())}
    return  JsonResponse(route_json, safe=False)