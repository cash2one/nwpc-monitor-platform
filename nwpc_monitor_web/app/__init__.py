# coding=utf-8
import redis
from pymongo import MongoClient
from flask import Flask
from .app_config import load_config
from .common.json_encoder import NwpcMonitorWebApiJSONEncoder
from .common.converter import NoStaticConverter
from .api import api_app

app = Flask(__name__, static_url_path='/static', static_folder='../static')

app.config.from_object(load_config())
redis_host = app.config['NWPC_MONITOR_WEB_CONFIG']['redis']['host']['ip']
redis_port = app.config['NWPC_MONITOR_WEB_CONFIG']['redis']['host']['port']
redis_client = redis.StrictRedis(host=redis_host, port=redis_port)

mongodb_client = MongoClient(app.config['NWPC_MONITOR_WEB_CONFIG']['mongodb']['host']['ip'],
                             app.config['NWPC_MONITOR_WEB_CONFIG']['mongodb']['host']['port'])

app.json_encoder = NwpcMonitorWebApiJSONEncoder
app.url_map.converters['no_static'] = NoStaticConverter

app.register_blueprint(api_app, url_prefix="/api/v1")

import nwpc_monitor_web.app.controller
