import datetime

from nwpc_monitor_broker import app, db
from nwpc_monitor.model import Owner, Repo, DingtalkUser, DingtalkWarnWatch

from nwpc_monitor.model.nwpc_takler import Commit, Tree, Blob, Ref

from nwpc_monitor_broker.api_v2 import mongodb_client

# mongodb
nwpc_monitor_platform_mongodb = mongodb_client.nwpc_monitor_platform_develop
sms_server_status = nwpc_monitor_platform_mongodb.sms_server_status


def get_ding_talk_warn_user_list(owner: str, repo: str) -> list:
    query = db.session.query(Owner, Repo, DingtalkUser, DingtalkWarnWatch).filter(Repo.owner_id == Owner.owner_id)\
        .filter(Repo.repo_name == repo)  \
        .filter(Owner.owner_name == owner) \
        .filter(DingtalkWarnWatch.repo_id == Repo.repo_id) \
        .filter(DingtalkWarnWatch.dingtalk_user_id == DingtalkUser.dingtalk_user_id)

    warn_to_user_list = []
    for (owner_object, repo_object, dingtalk_user_object, dingtalk_warn_watch_object) in query.all():
        userid = dingtalk_user_object.dingtalk_member_userid
        print(userid)
        warn_to_user_list.append(userid)

    return warn_to_user_list


def get_new_64bit_ticket():
    batch_id = None
    engine = db.engine
    connection = engine.connect()
    trans = connection.begin()
    try:
        connection.execute("REPLACE INTO tickets_64 (stub) VALUES ('a');")
        (batch_id,) = connection.execute('SELECT LAST_INSERT_ID() AS id').fetchone()
        trans.commit()
    except:
        trans.rollback()
        raise
    return batch_id


def save_sms_server_status_to_nwpc_takler_object_system(
        owner: str, repo: str, sms_name: str,
        message: dict,
        error_task_dict_list: list
) -> dict:
    """
    保存 sms server 状态到 mongodb 数据库，并返回保存对象的 dict 格式。

    :param owner:
    :param repo:
    :param sms_name:
    :param message:
    :param error_task_dict_list:
    :return:
    """
    status_blob = Blob()
    status_blob.id = get_new_64bit_ticket()
    status_blob.owner = owner
    status_blob.repo = repo
    status_blob_data = {
        'type': 'status',
        'name': 'sms_server_status',
        'content': {
            'sms_name': sms_name,
            'update_time': datetime.datetime.now(),
            'collected_time': message['time'],
            'status': message['status']
        }
    }
    status_blob.set_data(status_blob_data)
    blobs_collection = nwpc_monitor_platform_mongodb.blobs
    blobs_collection.insert_one(status_blob.to_dict())

    aborted_tasks_blob = Blob()
    aborted_tasks_blob.id = get_new_64bit_ticket()
    aborted_tasks_blob.owner = owner
    aborted_tasks_blob.repo = repo
    aborted_tasks_blob_data = {
        'type': 'aborted_tasks',
        'name': 'sms_server_aborted_tasks',
        'content': {
            'status_blob_id': status_blob.id,
            'sms_name': sms_name,
            'update_time': datetime.datetime.now(),
            'collected_time': message['time'],
            'tasks': error_task_dict_list
        }
    }
    aborted_tasks_blob.set_data(aborted_tasks_blob_data)
    blobs_collection.insert_one(aborted_tasks_blob.to_dict())

    tree_object = Tree()
    tree_object.id = get_new_64bit_ticket()
    tree_object.owner = owner
    tree_object.repo = repo
    tree_object_data = {
        'nodes': [
            {
                'type': 'status',
                'name': 'sms_server_status',
                'blob_id': status_blob.id
            },
            {
                'type': 'aborted_tasks',
                'name': 'sms_server_aborted_tasks',
                'blob_id': aborted_tasks_blob.id
            }
        ]
    }
    tree_object.set_data(tree_object_data)
    trees_collection = nwpc_monitor_platform_mongodb.trees
    trees_collection.insert_one(tree_object.to_dict())

    commit_object = Commit()
    commit_object.id = get_new_64bit_ticket()
    commit_object.owner = owner
    commit_object.repo = repo
    commit_object_data = {
        'committer': 'aix',
        'type': 'status',
        'tree_id': tree_object.id,
        'committed_time': datetime.datetime.now()
    }
    commit_object.set_data(commit_object_data)
    commits_collection = nwpc_monitor_platform_mongodb.commits
    commits_collection.insert_one(commit_object.to_dict())

    # NOTE:
    #   如果只保存出错时的任务，Ref就失去意义

    # # find ref in mongodb
    # ref_collection = nwpc_monitor_platform_mongodb.refs
    #
    # ref_key = {
    #     'owner': owner,
    #     'repo': repo,
    #     'data.key': 'sms_server/status/head'
    # }
    # ref_found_result = ref_collection.find_one(ref_key)
    # if ref_found_result is None:
    #     ref_object = Ref()
    #     ref_object.id = get_new_64bit_ticket()
    #     ref_object.owner = owner
    #     ref_object.repo = repo
    #     ref_object_data = {
    #         'key': 'sms_server/status/head',
    #         'type': 'blob',
    #         'id': status_blob.id
    #     }
    #     ref_object.set_data(ref_object_data)
    #     # save
    #     ref_collection.update(ref_key, ref_object.to_dict(), upsert=True)
    # else:
    #     ref_found_result['data']['id'] = status_blob.id
    #     ref_found_result['timestamp'] = datetime.datetime.now()
    #     # save
    #     ref_collection.update(ref_key, ref_found_result, upsert=True)
    return {
        'blobs': [
            status_blob.to_dict(),
            aborted_tasks_blob.to_dict()
        ],
        'trees': [
            tree_object.to_dict()
        ],
        'commits': [
            commit_object.to_dict()
        ]
    }


def save_sms_task_check_to_nwpc_takler_object_system(
        owner: str, repo: str,
        message_data: dict,
        unfit_node_list: list
) -> dict:
    unfit_tasks_blob = Blob()
    unfit_tasks_blob.id = get_new_64bit_ticket()
    unfit_tasks_blob.owner = owner
    unfit_tasks_blob.repo = repo
    status_blob_data = {
        'type': 'unfit_tasks',
        'name': 'sms_check_task_unfit_tasks',
        'content': {
            'name': message_data['request']['task']['name'],
            'trigger': message_data['request']['task']['trigger'],
            'unfit_node_list': unfit_node_list,
            'update_time': datetime.datetime.now(),
        }
    }
    unfit_tasks_blob.set_data(status_blob_data)
    blobs_collection = nwpc_monitor_platform_mongodb.blobs
    blobs_collection.insert_one(unfit_tasks_blob.to_dict())

    tree_object = Tree()
    tree_object.id = get_new_64bit_ticket()
    tree_object.owner = owner
    tree_object.repo = repo
    tree_object_data = {
        'nodes': [
            {
                'type': 'unfit_tasks',
                'name': 'sms_check_task_unfit_tasks',
                'blob_id': unfit_tasks_blob.id
            }
        ]
    }
    tree_object.set_data(tree_object_data)
    trees_collection = nwpc_monitor_platform_mongodb.trees
    trees_collection.insert_one(tree_object.to_dict())

    commit_object = Commit()
    commit_object.id = get_new_64bit_ticket()
    commit_object.owner = owner
    commit_object.repo = repo
    commit_object_data = {
        'committer': 'broker',
        'type': 'task_check',
        'tree_id': tree_object.id,
        'committed_time': datetime.datetime.now()
    }
    commit_object.set_data(commit_object_data)
    commits_collection = nwpc_monitor_platform_mongodb.commits
    commits_collection.insert_one(commit_object.to_dict())

    return {
        'blobs': [
            unfit_tasks_blob.to_dict()
        ],
        'trees': [
            tree_object.to_dict()
        ],
        'commits': [
            commit_object.to_dict()
        ]
    }
