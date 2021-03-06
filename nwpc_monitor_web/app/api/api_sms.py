import datetime
import gzip

import requests
from flask import request, json, jsonify, url_for
from nwpc_work_flow_model.sms.visitor import SubTreeNodeVisitor, pre_order_travel_dict

from nwpc_monitor_web.app import app, redis_client, mongodb_client
from nwpc_monitor_web.app.api import api_app
from nwpc_monitor_web.app.common import analytics
from nwpc_monitor_web.app.common.operation_system import owner_list, get_owner_repo_status_from_cache

# mongodb
nwpc_monitor_platform_mongodb = mongodb_client.nwpc_monitor_platform_develop
sms_server_status = nwpc_monitor_platform_mongodb.sms_server_status


@api_app.route('/repos/<owner>/<repo>/sms/status', methods=['POST'])
def post_sms_status(owner, repo):
    content_encoding = request.headers.get('content-encoding', '').lower()
    if content_encoding == 'gzip':
        gzipped_data = request.data
        data_string = gzip.decompress(gzipped_data)
        body = json.loads(data_string.decode('utf-8'))
    else:
        body = request.form

    message = json.loads(body['message'])
    if 'error' in message:
        result = {
            'status': 'ok'
        }
        return jsonify(result)

    key = "{owner}/{repo}/status".format(owner=owner, repo=repo)

    if message['data']['type'] == 'status':
        redis_value = message['data']

        redis_value['type'] = 'sms'

        # 保存到本地缓存
        # TODO: use a single schema for mongodb cache and redis item.
        """
        redis_value:
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
        redis_client.set(key, json.dumps(redis_value))

    elif message['data']['type'] == 'takler_object':
        status_blob = None
        aborted_blob = None
        for a_blob in message['data']['blobs']:
            if a_blob['data']['type'] == 'status':
                status_blob = a_blob
            if a_blob['data']['type'] == 'aborted_tasks':
                aborted_blob = a_blob
        if status_blob is None:
            result = {
                'status': 'error',
                'message': 'can\'t find a status blob.'
            }
            return jsonify(result)

        tree_object = message['data']['trees'][0]
        commit_object = message['data']['commits'][0]

        # 保存到本地缓存
        redis_value = {
            'owner': owner,
            'repo': repo,
            'sms_name': repo,
            'time': status_blob['data']['content']['collected_time'],
            'status': status_blob['data']['content']['status'],
            'type': 'sms'
        }
        redis_client.set(key, json.dumps(redis_value))

        # 保存到 mongodb
        blobs_collection = nwpc_monitor_platform_mongodb.blobs
        blobs_collection.insert_one(status_blob)
        if aborted_blob:
            blobs_collection.insert_one(aborted_blob)

        trees_collection = nwpc_monitor_platform_mongodb.trees
        trees_collection.insert_one(tree_object)

        commits_collection = nwpc_monitor_platform_mongodb.commits
        commits_collection.insert_one(commit_object)

    # send data to google analytics
    analytics.send_google_analytics_page_view(
        url_for('api_app.post_sms_status', owner=owner, repo=repo)
    )

    result = {
        'status': 'ok'
    }
    return jsonify(result)


@api_app.route('/repos/<owner>/<repo>/sms/status', methods=['GET'])
def get_sms_status(owner, repo):
    r = request
    args = request.args

    depth = -1
    if 'depth' in args:
        depth = int(args['depth'])

    # 保存到本地缓存
    message = get_owner_repo_status_from_cache(owner, repo)

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
            {"name": "type", "type": "enum", "symbols": ["sms"]},
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

    # send data to google analytics
    google_analytics_config = app.config['NWPC_MONITOR_WEB_CONFIG']['analytics']['google_analytics']
    if google_analytics_config['enable'] is True:
        post_data = {
            'v': google_analytics_config['version'],
            't': 'pageview',
            'tid': google_analytics_config['track_id'],
            'cid': google_analytics_config['client_id'],
            'dh': google_analytics_config['document_host'],
            'dp': url_for('api_app.get_sms_status', owner=owner, repo=repo)
        }
        requests.post(google_analytics_config['url'], data=post_data)

    result = {
        'status': 'ok',
        'data': message
    }
    return jsonify(result)


@api_app.route('/operation-systems/owners/<owner>/repos', methods=['GET'])
def get_owner_repos(owner: str):
    # get repo list
    repo_list = []
    if owner in owner_list:
        repo_list = owner_list[owner]['repos']

    # get status for each repo in repo list
    owner_repo_status = []
    for a_repo in repo_list:
        a_repo_name = a_repo['name']
        cache_value = get_owner_repo_status_from_cache(owner, a_repo_name)
        repo_status = None
        last_updated_time = None
        if cache_value is not None:
            bunch_dict = cache_value['status']

            repo_status = bunch_dict['status']
            time_string = cache_value['time']
            data_collect_datetime = datetime.datetime.strptime(time_string, "%Y-%m-%dT%H:%M:%S.%f")
            last_updated_time = data_collect_datetime.strftime('%Y-%m-%d %H:%M:%S')
        owner_repo_status.append({
            'owner': owner,
            'repo': a_repo_name,
            'status': repo_status,
            'last_updated_time': last_updated_time
        })

    return jsonify(owner_repo_status)


@api_app.route('/operation-systems/repos/<owner>/<repo>/status/head/', methods=['GET'])
@api_app.route('/operation-systems/repos/<owner>/<repo>/status/head/<path:sms_path>', methods=['GET'])
def get_repo_status(owner: str, repo: str, sms_path: str='/'):
    path = '/'
    last_updated_time = None
    children_status = []

    node_status = {
        'owner': owner,
        'repo': repo,
        'path': path,
        'last_updated_time': last_updated_time,
        'children': children_status
    }

    result = {
        'app': 'nwpc_monitor_web',
        'type': 'repo',
        'data': {
            'node_status': node_status
        }
    }

    if owner not in owner_list:
        return jsonify(result)

    found_repo = False
    for a_repo in owner_list[owner]['repos']:
        if repo == a_repo['name']:
            found_repo = True
            break
    if not found_repo:
        return jsonify(result)

    cache_value = get_owner_repo_status_from_cache(owner, repo)
    node_status = None
    if cache_value is not None:
        time_string = cache_value['time']
        data_collect_datetime = datetime.datetime.strptime(time_string, "%Y-%m-%dT%H:%M:%S.%f")
        last_updated_time = data_collect_datetime.strftime('%Y-%m-%d %H:%M:%S')

        bunch_dict = cache_value['status']

        def find_node(root, a_path):
            if a_path == '' or a_path == '/':
                return root, None
            tokens = a_path.split("/")
            cur_node = root
            parent_node = None
            for a_token in tokens:
                t_node = None
                for a_child_node in cur_node['children']:
                    if a_child_node['name'] == a_token:
                        t_node = a_child_node
                        break
                if t_node is None:
                    return None
                parent_node = cur_node
                cur_node = t_node
            return cur_node, parent_node
        node, p_node = find_node(bunch_dict, sms_path)
        if node is not None:
            children_status = []
            if p_node:
                children_status.append(
                    {
                        'name': '..',
                        'path': p_node['path'],
                        'status': p_node['status'],
                        'has_children': True
                    }
                )
            path = node['path']
            for a_child in node['children']:
                if len(a_child['children']) > 0:
                    has_children = True
                else:
                    has_children = False
                children_status.append({
                    'name': a_child['name'],
                    'path': a_child['path'],
                    'status': a_child['status'],
                    'has_children': has_children
                })

    result['data']['node_status'] = {
        'owner': owner,
        'repo': repo,
        'path': path,
        'last_updated_time': last_updated_time,
        'children': children_status
    }

    return jsonify(result)


@api_app.route('/operation-systems/repos/<owner>/<repo>/aborted_tasks/<int:aborted_id>', methods=['GET'])
def get_repo_aborted_tasks(owner, repo, aborted_id):
    aborted_tasks_content = {
        'update_time': None,
        'collected_time': None,
        'status_blob_id': None,
        'tasks': []
    }

    if owner not in owner_list:
        return jsonify(aborted_tasks_content)

    found_repo = False
    for a_repo in owner_list[owner]['repos']:
        if repo == a_repo['name']:
            found_repo = True
            break
    if not found_repo:
        return jsonify(aborted_tasks_content)

    blobs_collection = nwpc_monitor_platform_mongodb.blobs
    query_key = {
        'owner': owner,
        'repo': repo,
        'id': aborted_id
    }
    query_result = blobs_collection.find_one(query_key)
    if not query_result:
        return jsonify(aborted_tasks_content)

    blob_content = query_result['data']['content']

    aborted_tasks_content = {
        'update_time': blob_content['update_time'],
        'collected_time': blob_content['collected_time'],
        'status_blob_id': blob_content['status_blob_id'],
        'tasks': blob_content['tasks']
    }

    return jsonify(aborted_tasks_content)


@api_app.route('/operation-systems/repos/<owner>/<repo>/task_check', methods=['POST'])
@api_app.route('/repos/<owner>/<repo>/sms/task-check', methods=['POST'])
def post_sms_task_check(owner, repo):
    content_encoding = request.headers.get('content-encoding', '').lower()
    if content_encoding == 'gzip':
        gzipped_data = request.data
        data_string = gzip.decompress(gzipped_data)
        body = json.loads(data_string.decode('utf-8'))
    else:
        body = request.form

    message = json.loads(body['message'])
    if 'error' in message:
        result = {
            'status': 'ok'
        }
        return jsonify(result)

    if message['data']['type'] == 'takler_object':
        unfit_nodes_blob = None
        for a_blob in message['data']['blobs']:
            if a_blob['data']['type'] == 'unfit_nodes':
                unfit_nodes_blob = a_blob

        if unfit_nodes_blob is None:
            result = {
                'status': 'error',
                'message': 'can\'t find a unfit nodes blob.'
            }
            return jsonify(result)

        tree_object = message['data']['trees'][0]
        commit_object = message['data']['commits'][0]

        # 保存到 mongodb
        blobs_collection = nwpc_monitor_platform_mongodb.blobs
        blobs_collection.insert_one(unfit_nodes_blob)

        trees_collection = nwpc_monitor_platform_mongodb.trees
        trees_collection.insert_one(tree_object)

        commits_collection = nwpc_monitor_platform_mongodb.commits
        commits_collection.insert_one(commit_object)

    result = {
        'status': 'ok'
    }
    return jsonify(result)


@api_app.route('/operation-systems/repos/<owner>/<repo>/task_check/unfit_nodes/<int:unfit_nodes_id>', methods=['GET'])
def get_repo_unfit_nodes(owner, repo, unfit_nodes_id):
    unfit_nodes_content = {
        'update_time': None,
        'name': None,
        'trigger': None,
        'unfit_node_list': []
    }

    if owner not in owner_list:
        return jsonify(unfit_nodes_content)

    found_repo = False
    for a_repo in owner_list[owner]['repos']:
        if repo == a_repo['name']:
            found_repo = True
            break
    if not found_repo:
        return jsonify(unfit_nodes_content)

    blobs_collection = nwpc_monitor_platform_mongodb.blobs
    query_key = {
        'owner': owner,
        'repo': repo,
        'id': unfit_nodes_id
    }
    query_result = blobs_collection.find_one(query_key)
    if not query_result:
        return jsonify(unfit_nodes_content)

    blob_content = query_result['data']['content']

    unfit_nodes_content = blob_content

    return jsonify(unfit_nodes_content)
