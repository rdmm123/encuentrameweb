from django.shortcuts import render
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

import requests
from ipaddress import ip_address, ip_network
import subprocess


@require_POST
@csrf_exempt
def git_pull(request):

    # Verify if request came from GitHub
    forwarded_for = u'{}'.format(request.META.get('HTTP_X_FORWARDED_FOR'))
    client_ip_address = ip_address(forwarded_for)
    whitelist = requests.get('https://api.github.com/meta').json()['hooks']

    for valid_ip in whitelist:
        if client_ip_address in ip_network(valid_ip):
            break
    else:
        return HttpResponse('Permission denied.')

    # Process the GitHub events
    event = request.META.get('HTTP_X_GITHUB_EVENT', 'ping')
    if event == 'push':
        subprocess.run(['/home/ubuntu/encuentrameweb/autopull/autopull.sh'])
        return HttpResponse('success')
    
    return HttpResponse(status=204)

def test(request):
    return HttpResponse('olaaaaaaaaa')