import React, { Component, PropTypes } from 'react';

export default class WatcherList extends Component{
    constructor(props) {
        super(props);
        this.checked_users = [];
    }

    handleUnWatchClick(owner, repo, user, event) {
        let users = [user];
        this.props.unwatch_click_handler(owner, repo, users)
    }

    handleWatchClick(owner, repo, user, event) {
        let users = [user];
        this.props.watch_click_handler(owner, repo, users)
    }

    handleAllCheckClick() {

    }

    handleAllUnCheckClick() {

    }

    handleCheckboxClick(user, event) {
        let flag = event.target.checked;
        if(flag){
            this.checked_users.push(user);
        }
        else{
            let user_index = this.checked_users.indexOf(user);
            if (user_index!=-1)
            {
                this.checked_users.splice(user_index, 1);
            }
        }

        console.log(this.checked_users);
    }

    render() {
        const {owner, repo} = this.props;
        let watcher_list = this.props.watcher_list;

        return (
            <div>
                <ui className="list-group">
                    {watcher_list.map((an_user, index) =>
                        <li className="list-group-item" key={an_user.owner_name}>
                            <label>
                                <input type="checkbox" value={an_user.owner_name}
                                       onClick={this.handleCheckboxClick.bind(this, an_user.owner_name)} />
                                &nbsp;
                                <a href={ '/' + an_user.owner_name }>{an_user.owner_name}</a>
                            </label>
                            {
                                an_user.is_watching?
                                    (<button className="btn btn-danger btn-xs active pull-right"
                                             onClick={this.handleUnWatchClick.bind(this, owner, repo, an_user.owner_name)}>
                                        取消
                                    </button>) :
                                    (<button className="btn btn-primary btn-xs pull-right"
                                             onClick={this.handleWatchClick.bind(this, owner, repo, an_user.owner_name)}>
                                        关注
                                    </button>)
                            }
                        </li>
                    )}
                    <li className="list-group-item">
                        <button type="button" className="btn btn-default btn-xs">
                            全选
                        </button>
                        <button type="button" className="btn btn-default btn-xs">
                            取消全选
                        </button>
                        <button className="btn btn-default btn-xs pull-right" onClick={this.handleAllUnCheckClick.bind(this)}>
                                取消
                        </button>
                        <button className="btn btn-default btn-xs pull-right" onClick={this.handleAllCheckClick.bind(this)}>
                                关注
                        </button>
                    </li>
                </ui>
            </div>
        );
    }
}

WatcherList.propTypes = {
    type: PropTypes.string.isRequired,

    watcher_list: PropTypes.arrayOf(PropTypes.shape({
        owner_name: PropTypes.string.isRequired,
        is_watching:PropTypes.bool.isRequired,
        warn_watch: PropTypes.shape({
            start_date_time: PropTypes.string,
            end_date_time: PropTypes.string
        })
    })).isRequired,

    owner: PropTypes.string.isRequired,
    repo: PropTypes.string.isRequired,

    /**
     * 取消某个项目的关注时调用的函数
     *  unwatch_click_handler(owner, repo, users)
     */
    unwatch_click_handler: PropTypes.func.isRequired,

    /**
     * 关注某个项目时调用的函数
     *  unwatch_click_handler(owner, repo, users)
     */
    watch_click_handler: PropTypes.func.isRequired
};