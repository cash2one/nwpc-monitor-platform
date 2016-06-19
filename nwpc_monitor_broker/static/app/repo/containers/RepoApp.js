import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import PageHeader from '../../base/components/page_header'
import RepoAppTitle from '../components/repo_app_title'
import RepoAppNaviBar from '../components/repo_app_navi_bar'
import RepoAppStatusTab from '../components/repo_app_status_tab'

class RepoApp extends Component{
    componentDidMount(){

    }

    render() {
        const { params } = this.props;
        let owner = params.owner;
        let repo = params.repo;

        let url = {
            index_page: '/'
        };

        return (
            <div>
                <PageHeader url={ url }/>

                <RepoAppTitle owner={owner} repo={repo} />

                <RepoAppNaviBar owner={owner} repo={repo} />

                <RepoAppStatusTab owner={owner} repo={repo} />
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
    }
}

export default connect(mapStateToProps)(RepoApp)