from django.shortcuts import render
from .models import Location
from django.http import JsonResponse
from django.core import serializers
import json


# Create your views here.
def homepage_view(request):
    return(render(request, 'home.html'))

def get_location(request):
    last_location = Location.objects.latest('id')
    
    last_location_json = json.loads(serializers.serialize('json', [last_location]))[0]
    return JsonResponse(last_location_json["fields"])
