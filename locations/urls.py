from django.urls import path
from .views import homepage_view, get_location, get_route

urlpatterns = [
    path('', homepage_view, name='home'),
    path('ajax/get_location', get_location, name='get_location'),
    path('ajax/get_route/<str:start_ts>/<str:end_ts>', get_route, name='get_route'),
]