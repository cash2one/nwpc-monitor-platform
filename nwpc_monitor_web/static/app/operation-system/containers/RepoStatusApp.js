import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { NodeStatusImage } from '../../base/components/NodeStatusImage'

import { fetchOperationSystemRepoStatus } from '../actions/owner';
import { Util } from '../../base/util/util'

class RepoStatusApp extends Component{
    componentDidMount(){
        const { dispatch, params } = this.props;
        let owner = params.owner;
        let repo = params.repo;
        let path = '/';
        if(params.hasOwnProperty('splat'))
            path += params.splat;

        dispatch(fetchOperationSystemRepoStatus(owner, repo, path));
    }

    render() {
        const { params, node_status } = this.props;
        if(node_status===null)
        {
            return (
                <div>
                    <p>不存在</p>
                </div>
            )
        }

        let owner = params.owner;
        let repo = params.repo;
        let path = '/';
        if(params.hasOwnProperty('splat'))
            path += params.splat;

        let repo_last_update_time = '未知';
        let cur_time = new Date();
        if(node_status['last_updated_time']!=null) {
            let last_updated_time = new Date(node_status['last_updated_time']);
            repo_last_update_time = Util.getDelayTime(last_updated_time, cur_time);
        }

        let children_node = node_status['children'].map(function(a_child, i){
            let a_child_status = "unk";
            if(a_child['status']!=null)
                a_child_status = a_child['status'];

            return (
                <a className="weui-cell" key={i} href={ "/" + owner + "/" + repo + "/status/head" + a_child['path'] } >
                    <div className="weui-cell__hd">
                        <NodeStatusImage node_status={a_child_status} />
                    </div>

                    <div className="weui-cell__bd">
                        <p>{ a_child['name'] }</p>
                    </div>

                    <div className="weui-cell__ft">
                    </div>
                </a>
            )
        });

        return (
            <div>
                <p>更新时间：{ repo_last_update_time }</p>
                <p>当前路径：{ path }</p>

                <div className="weui-cells weui-cells_access">
                    { children_node }
                </div>
            </div>
        );
    }
}

RepoStatusApp.propTypes = {
    node_status: PropTypes.shape({
        last_updated_time: PropTypes.string,
        owner: PropTypes.string,
        repo: PropTypes.string,
    })
};

function mapStateToProps(state){
    return {
        node_status: state.operation_system.repo.node_status
    }
}

export default connect(mapStateToProps)(RepoStatusApp)