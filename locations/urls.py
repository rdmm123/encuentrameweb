from django.urls import path
from .views import homepage_view, get_location

urlpatterns = [
    path('', homepage_view, name='home'),
    path('ajax/get_location', get_location, name='get_location'),
]