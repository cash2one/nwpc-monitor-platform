# coding=utf-8
from flask import Blueprint
from nwpc_monitor_broker import app

import redis

redis_host = app.config['BROKER_CONFIG']['redis']['host']['ip']
redis_port = app.config['BROKER_CONFIG']['redis']['host']['port']
redis_client = redis.Redis(host=redis_host, port=redis_port)

api_app = Blueprint('api_app', __name__, template_folder='template')

import nwpc_monitor_broker.api.api_sms