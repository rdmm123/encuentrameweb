# Generated by Django 3.2.7 on 2021-09-29 01:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0005_alter_location_timestamp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='location',
            name='date',
        ),
        migrations.RemoveField(
            model_name='location',
            name='time',
        ),
    ]
