from django.urls import path
from .views import homepage_view, get_location, get_route

urlpatterns = [
    path('', homepage_view, name='home'),
    path('ajax/get_location', get_location, name='get_location'),
    path('ajax/get_route/<str:date>/<str:start_time>/<str:end_time>', get_route, name='get_route'),
]