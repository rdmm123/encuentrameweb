#!/bin/bash
cd /home/ubuntu/encuentrameweb
git pull
sudo supervisorctl restart encuentrame:gunicorn