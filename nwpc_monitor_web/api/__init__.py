# coding=utf-8
from flask import Blueprint, request, json, jsonify
from nwpc_monitor_web import app
from nwpc_monitor.nwpc_log.visitor import NodeVisitor, pre_order_travel_dict

import redis

redis_host = app.config['NWPC_MONITOR_WEB_CONFIG']['redis']['host']['ip']
redis_port = app.config['NWPC_MONITOR_WEB_CONFIG']['redis']['host']['port']
redis_client = redis.Redis(host=redis_host, port=redis_port)

api_app = Blueprint('api_app', __name__, template_folder='template')

@api_app.route('/repos/<owner>/<repo>/sms/<sms_name>/status', methods=['POST'])
def post_sms_status(owner, repo, sms_name):
    r = request
    """
    message:
    {
        "name": "sms_status_message_data",
        "type": "record",
        "fields": [
            {"name": "owner", "type": "string"},
            {"name": "repo", "type": "string"},
            {"name": "sms_name", "type": "string"},
            {"name": "time", "type": "string"},
            {
                "name": "status",
                "doc": "bunch status dict",
                "type": { "type": "node" }
            }
        ]
    }
    """
    message = json.loads(request.form['message'])
    if 'error' in message:
        result = {
            'status': 'ok'
        }
        return jsonify(result)

    # 保存到本地缓存
    key = "{owner}/{repo}/sms/{sms_name}/status".format(owner=owner, repo=repo, sms_name=sms_name)
    redis_client.set(key, json.dumps(message))
    result = {
        'status': 'ok'
    }
    return jsonify(result)

class SubTreeNodeVisitor(NodeVisitor):
    def __init__(self, max_depth):
        NodeVisitor.__init__(self)
        self.level = 0
        self.max_depth = max_depth

    def visit(self, node):
        if self.level == self.max_depth:
            del node['children']
            node['children'] = list()

    def before_visit_child(self):
        self.level += 1

    def after_visit_child(self):
        self.level -= 1


@api_app.route('/repos/<owner>/<repo>/sms/<sms_name>/status', methods=['GET'])
def get_sms_status(owner, repo, sms_name):
    r = request
    args = request.args

    depth = -1
    if 'depth' in args:
        depth = int(args['depth'])

    # 保存到本地缓存
    key = "{owner}/{repo}/sms/{sms_name}/status".format(owner=owner, repo=repo, sms_name=sms_name)
    message_string = redis_client.get(key)
    message = json.loads(message_string)

    """
    message:
    {
        "name": "sms_status_message_data",
        "type": "record",
        "fields": [
            {"name": "owner", "type": "string"},
            {"name": "repo", "type": "string"},
            {"name": "sms_name", "type": "string"},
            {"name": "time", "type": "string"},
            {
                "name": "status",
                "doc": "bunch status dict",
                "type": { "type": "node" }
            }
        ]
    }
    """

    bunch_dict = message['status']
    visitor = SubTreeNodeVisitor(depth)
    pre_order_travel_dict(bunch_dict, visitor)

    message['status'] = bunch_dict

    result = {
        'status': 'ok',
        'data': message
    }
    return jsonify(result)