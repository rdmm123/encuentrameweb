from django.urls import path
from .views import git_pull, test

urlpatterns = [
    path('git/pull', git_pull, name='pull'),
]