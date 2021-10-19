from django.db import models

# Create your models here.
class Location(models.Model):
    latitude = models.CharField(max_length=50)
    longitude = models.CharField(max_length=50)
    plate = models.CharField(max_length=50)
    timestamp = models.DateTimeField()
