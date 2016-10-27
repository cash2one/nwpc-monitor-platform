import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchOperationSystemOwnerRepos } from '../actions/owner';

import { MonitorWebAppTab } from "../../base/components/MonitorWebAppTab"

class OwnerApp extends Component{

    componentDidMount(){
        const { dispatch, params } = this.props;
        let owner = params.owner;
        dispatch(fetchOperationSystemOwnerRepos(owner));
    }

    static getTimeInterval(start_date, end_date){
        let ms_interval=end_date.getTime()-start_date.getTime();
        let days=Math.floor(ms_interval/(24*3600*1000));

        let leave1=ms_interval%(24*3600*1000);    //计算天数后剩余的毫秒数
        let hours=Math.floor(leave1/(3600*1000));

        let leave2=leave1%(3600*1000);      //计算小时数后剩余的毫秒数
        let minutes=Math.floor(leave2/(60*1000));

        let leave3=leave2%(60*1000);     //计算分钟数后剩余的毫秒数
        let seconds=Math.round(leave3/1000);

        return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }
    }

    static getDelayTime(start_time, end_time){
        let repo_delay = OwnerApp.getTimeInterval(start_time, end_time);
        if (repo_delay.days){
            return repo_delay.days+'天前';
        } else if (repo_delay.hours) {
            return repo_delay.hours+'小时前';
        } else if (repo_delay.minutes) {
            return repo_delay.minutes  + '分钟前';
        } else if (repo_delay.seconds) {
            return repo_delay.seconds  + '秒前';
        }
        return "";
    }

    static getStatusBackgroundImage(status) {
        switch (status) {
            case 'abo':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCcAB37JbAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAByElEQVRo3u2YTUuUURiGrxENxw9ooWMLXRgtBBfqoLioRWDQDygXrW0ZtGrrso1ftegvOJoLwYW/ICLaRe3cR4Gp5MJ0krvNPTJM71eoxMBz4OHlOec+573O4dwPvG8JQCDarHXQpi3AAzzAAzzAAzzAAzzAA/yawEuOOPEAbyfwR8A4MAB0AjeB+8B6xpyvwFOgApSBe8DHFk0dWAWqQK+jCrwCfhelFygtyIiXKdr+BG0faM+6M9CDjHUfguoZTBcf98oRNeIcdAR66xcMp4A/Bn0AnYC+gKbdv2DdsvMKaAO071gHDXps9bLgR6A3oHlQFTQCKnvxUgp46xrv3D/qfNL5VoJ2w2NTlwH/BBrKuS5FwI/df8N5Y+M/ErT7HuvJAc805zPgO3AX2AQ+A9+A03+sAL/87PrbW0l+K97SdtXj3R9kmLbIiW+7f8b5hPNagrZ2FVflthd5Dfpps70HPckB3wEd+ors2sSA1lrMOWjQhjlrV2XOpZR7PZQDnhSzoNOmcjh3neXw3Du/A+r280WTgZLAe0GLoDHPuQV67tNv1p6BVlxhyo5Jv69eoDSX4m9tgAd4gAd4gAd4gAd4gAf4f2t/AJyaWtkmCBATAAAAAElFTkSuQmCC";
            case 'act':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCc3v8NsYwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABeUlEQVRo3u3WT0tVYRDH8c+VKG2ji0IR24S4UCSIcNMi97UTN76CFrYs8A2IKLTrFQjGrXYKvYTW0ZsokLpohAoybh7jUOf+UbkXlJlheDjn/DjzfebMPJwGCOGa2ZBragme4Ame4Ame4Ame4Ame4Al+CWuUyIrfOPAlzOEebmEMi9ip0Z5gA/MYLtrn2Ku0yb8tc6XWiQ6uQ6xXdMfCYgdtt3dd1LuCV/1UaAkfSrKpyrPNcu++0BR+lfgoPKkpxFW9K3hLeCcsC4+FB8JISd6o6B6Ve++7JhwA+FdhvMdPfL6Z/cGAdx7OVfzAUzTxDd9xXDsn/w9g363dvu6W6vzsoXKz5brZY8WP+lnxibJu4xBH+IKVNscmvMIntErs4llFN1nWdfzpV8W32vT1eE3FD4T5Hmbh5SCOw1PhrTAtDJf1dRnAuoQHwpowI9wWRoUXwueK5rfwRngo3CmahYuDN/6C579Kgid4gid4gid4gid4gif4oO0MY2wtUf5tgaoAAAAASUVORK5CYII=";
            case 'com':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCc0Jso92QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAB50lEQVRo3u2WvUoDURCFv0TURPGnSbAUkVgFY7AWQSGFFtY+ga8gqFiKaPApTGQ7ESy08BHEt1BWAjbqJjIWw7rq3k1cUUGYgWHhzJmbj7DnshkAEYR/Vln+aRm4gRu4gRu4gRu4gRu4gRu4gRv4WwUB7O1BuQy5HIyPw8oKnJ1FnnYb6nWoVmF4WLtahaMj6HTiZ2Yy2jc3sLYGo6Pa6+vQasHVFdRqMDICExOwsQGPjw44EcTVz8/I4iIC7hZBggBZXk721GpIu/3x3HCWzcb9k5Puc7a2Ymckg+/v61KhgJycIK2Wtuch8/PqOThQT7GINJuI72sfH+seIPW6G3xhAbm+Rp6ekN1dt76zo9r0dArw2VldajTccxGkUlGP58VnzabO5ubc4C8vkXZ3p1p//0f99lb1wcEU4Pm8Lvl+Mnjoub+Pz3xfZ0NDbvD3WqeTTu8aTpEoTL1K5GtaUvX1pdO7gk9N6fPyMtlTKunz4iI+C/dmZn7pTkx6Dba3o+B5XhTO01MN0PtwFgqahTCcjUbvcH7+vTR6V/CHB6Rc7n0dLi197zr8NfAQfnMTKZWQgQFkbAxZXUXOzyNPECCHh3rD5PPalYr+05+hfwo8E4Lbt4qBG7iBG7iBG7iBG7iBG/if1ysZPuQErn+1GAAAAABJRU5ErkJggg==";
            case 'hal':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCcwIaf5wAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAB80lEQVRo3u3YT0iTcRjA8e/mcsM/o6mjP+wiSocIihJBBAMVq0OXWhCOiC6OWGQNRkQePHhQGDoP+Qe6iGRoFIHQn4vOLqGoxSCQhlBDact823rVFIt1SF8YEhr+eRs8D7yH9+H5/d7P7+HHc3gNAOPdySRpFkbSNAQucIELXOACF7jABS7wf4CXuA2UuA07/uHt7itXReBbDNNWC6NKhI5nDbwODZJpMlN1ysktpx/zPotW4+u6yMfoFMr3GOpSnCxLDkccJ7hQUcfZ0lp94K6mkyQW57X3x8H77M8pwH2+UcsNv32asmbhR4LJ8AiT4RE+z3/i2rm7e39Vig4fo6/hHcFAgqtn7gDwcqwvpWa8O6k9Y52/CAbiNNcNrB20Q5+Od3mHMBr/nNNV7aXnVQtRJbKhwy9GHzLxIcjM3DTf1DniC18B+BKf1Qe+jgawZucBsPpzRcuFZ0J4AjUoauwvOyT1gacsyti4rOXRDRQ1xvGici5X3qTw0FFsuXasWTbKPGb9pspmMRWZAKDNM4g125Y+czzfehCA56O9LC6rrKwuE5p+w70HtbsC37GOO09fp/2JD39/Pf7+ei2fl3vg/+64q9rL7UutOOzFZJosOOzFXKnxMdD4flfghrX5K39rBS5wgQtc4AIXuMAFLvC9j981U5PXfXL3pQAAAABJRU5ErkJggg==";
            case 'que':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCcq3MUAugAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACxElEQVRo3u3YW0hUQRjA8b+63vDuetlCVHowC0LDLXoo3KykKIwIxaiIQhO0oIckFErwUgRtpYEoK1oZloiwlplQhpZtJGayRN7IcjUTU9Hwtpd2e5HCvNXqizTzOOc7c37nY+Y7M8cGoLDZYmGVNVtWaRNwARdwARdwARdwARdwARdwAf9/4JKlAvRTE1SrMmmqLWN8dAhvWSARu2OpK7uBYXqSwubfx9UkuQ0zZ9hZYyzU31JXSUNlAbq2t+inxvHwWUu44iD7Ey7h6im1Hm4yGriZEk23VvOrb1DXyZPinGVnrDT7NI1q1ay+kYEenj/I472mlvS7TTi7elg3Veor8unWanCXykhWVpHb8B3ls28kK6uWhX5dfYdGtQpPvwASr5Rz7ekgtxonSS9tJiRCwaCuk9rbV62f429q7gEQn5pHWGQMTi5uuHr6EBYZsyz4i8pCAJKVauR74nDz8sXByZmgDRGcyiwFoLVebf1UGfjcBkDoll0rurD6urQAXD4uXzBmqP+T9Rn/YTIBYCex/yeY2Wxe9LrFYl5yDJNh2vqMe/kHMPSlG117CyERkUuXKHtHTEY9E2PDuHn5LvgSsuBQejveka3+iG/AupWv4xu3RQNQrjxHX5cWo0GPrr0FVVr8vPHeskAA6u7nYjTo6e1o5XrSzjlxOw4lAqBMUvCqqpiRAR1G/TSG6Sn6uz9QX5FPzjH5onCbmfo677/D4a89ZB0JZ2p8dJ7bLHNq88OCDB4XZc6KdPGQMjE2PCvWbDZTmpWA5lHJorg/6/5fZ1y6JojzqgbWy6Owd3TG2dWDTdsPcKFEM2/8vpNpKOLO4Obtj5OLO1v3HuViWevch9raciKjmLO5NWyOOoynXwB2Egck9o7IgkNRxKaQWvTS+owv1hb6Goq9ioCvtt2hNSteZFzABVzABVzABVzAV6j9BJCy93MYoumAAAAAAElFTkSuQmCC";
            case 'shu':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCcnonR8BwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACZUlEQVRo3u3YX0hTURzA8e/upnNs6fBPf61g+RJlUM6I0UOiMAskCfvH+mMkbFlE7KWkKSUuEVTMSCYtQcglhMOMNJFUpIcISakIAwVRGpZmjDKbmvaQFGMyaNhIOL+3e87hnM895/zuPffKABZqexdYYSGxQkPABVzABVzABVzABVzABXyZ4TKzHplZL2ZcwP/HUASr/DbznaIWB73DbxkcH+Xjl88kaLTs0SVzLNXI4ZQMv/Yjk2PYmmt49KoHpSKSnJR0ynMuERWh9MuHxe/cgDxZqjwkeFGLg4qOe35lHu8E7r4u3H1dAYPsKjHxacr7+/p29wPiNVquZZnDu1Wcz5oBaMmvxFvVzUzNc4ZKmrlz0oZ+89aA9tvXb6Hf5sJb1c1l42kAXC+ehH+rqCOj8E5/xeMdR61UIZfk6BIS0SUkkrc3O6B9p9WBJP2aC2uGibL2ekYmx8KfnPbs88hlEpaGUuKs6aRXWrjivsXLkYGlO5P+dBerjgbANzcbfniuIYuB4iZKDp7DoNvB6/eDlLXXo7efoLqzMfhSyoMuJvPz8//2cZi0eiNXD5yl9WI1H8o7aMy7wQJgb70b0oBKRQSAXxKHchNB4cnXj1Lb08TwhIe5H3NM+aZRK1UATPmmQ4Jvil0LwM2n9/HNztA/+o60SvPyJucbzxCWhtIl6zK3GUKCH081UvzYib2tDntbHQBx6pjlnfGH+RUc2pnGuph4FJIcrUpD8oYkCjJzcZ4qDAlesP8MF/YdYc2qWKKj1Jh2Z9Jf6Pr7g93i20r8rRVwARdwARdwARdwARdwAQ9//ASYardJpEv2vgAAAABJRU5ErkJggg==";
            case 'sub':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCci0h6IiAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAB8ElEQVRo3u3Yvy9zYRjG8e9BihxUIupnJDZLN2IxYLOqiZGRGEjEYvIPdCMGq8QgGPoPGEQiMdhEIpEYGBCqqbSud3gi56V66PueBMn9JHdOep07dz89ec4z1ANAEr9sVfFLl8ENbnCDG9zgBje4wQ3+nXDPc2VP3OA/Af70BIuLMDwM3d0Qi0FXF6RSsL39+b4N289XVzAzA4kE1NfD0BAcHVXIl/RhLSwIKF+vfe8/h+WvWWNj6byGBnF2prKet3NC4PG4G7i3J+7vxfOzOD8XGxuiv///4BMT4vBQ5HLi9NTNAzE9HQG8s9MNW1sThULYkMrh73sPDlze2xsBfHNTVFe7gfG4GB0VS0vi+Dh6+MODy2OxCOCS23Orq2JsTLS2uuGeJ9LpUkyx+O/wmxuX+35E8L/r5UVsbbkvSCSCvLbWZdfXQVYsVgbf2XH5wMCXLOHHYTIJ6+twcQGFAmSz4PvuXjYb9PX0uGs6Dfk8nJzAyEj4Sba/D3d38PgImQzMzbl8cjKC4zDsKEylgr6VldL7LS3hT/yjGhwU+XwEW2V3V4yPi44OUVMjmptFMimWl8XtbdCXy4nZWdHWJpqaxNSUuLwsD/d992P7+kRdnWhvF/Pz7gX94rb17N9agxvc4AY3uMENbnCDG/zb1h+tWnAsNzmtZwAAAABJRU5ErkJggg==";
            case 'sus':
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCce/XH0DwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAByUlEQVRo3u2XO0hCURjHf2oPw2oorM1BqK0hIygKopqDwKL2gl7QEA1NZUFDUFZTCK0NRTQITT2GqE2iNXDQgiB7kPTULBsODobernmX6PvD5RzOd86fH+d83+FcE0DSR5I/JjN/VAIu4AIu4AIu4AIu4AIu4AIu4P8HvEAr+BKHaT8EQhC8gcgj2EuhyQn9jdDboOaZhlSb9KWv/z6u10+PTFo/y5PbsLSXfXEKSC+4Xr+8d3z9WLX+UWirhZIiuLyHw3PwHeV+vEb6aYLbiiD6CldRsBWDxQxOu/oGW3MHN9JPszjnu8FiguENqJyATi9M7cDpxe8Kykg/zRwHCEZgMwAnQQiE4eZJLVrpg/GO9Fz+WAOzOXuO6/UzBDyteJKwFYD+dagqg+tFNW4dg1gCIotgL1Njn59gGdEuumx+eadK3awqmtAtJD7gOaZyE1Q/JUeFalcPIPYOZ5fQ7v29X947njrqTHLXw/aw6s/4YW43PV5pg7vnzNfmT356ZAHwdOHJFHQ5IJ6Ah1d4e4dyK9RUw0ALLLjBWqjmNTsh+gLhO3VT9LgUxPK+inu6cvMzPMflrSLgAi7gAi7gAi7gAi7gAm6ovgAJ+cHO8zAxxAAAAABJRU5ErkJggg==";
            case 'unk':
            default:
                return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYEBCcHmRpczwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAB7ElEQVRo3u3YPY9pQRjA8f8eh4R4a9SiUYtCIgofQIgQjVL0NCQIoaChkigVgsJLFESjUp9voCGRqBQiOsTe4u59KXbtjZfN3WSe7sx5JvnNnGdmcuYFYDKZvPLNQuKbhoALuIALuIALuIALuIAL+H8A9/v9+P1+MeMC/uyQ/6UW3/5LP23/1dZsNul0OiiKglqtxuPxEIvF0Gg0n4J2ux3FYpHVakU8HicQCNwGvyWSySSHw+H383Q6xWg0Eo1Gr/bbbDYUCgX2+z2ZTAa32/21pWK1WqnX6/R6PcLhMADz+fxqn8ViQTqd5ng8UqlUrqKfBi+Xy9hsNnQ6HcFgEIDtdvthvqIo5HI5jEYjtVoNu91+f43ftOKlP/NhMBgAOJ/P7+bOZjMajQYmk4lqtYper3/srnK5XG4ahEqluvq+0WggSRK73Y7BYPC47VCWf36UvxfbrYN4L0qlEvl8HlmWGY1GtFqtx8AtFgsA4/GY0+nEcrkkm80+DO5wOHA6nWQyGWRZZjgc0m6374d7vV4A+v0+oVCIRCLBer1++LpwuVyk02kkSaLf79PpdO6DRyIRfD4fZrMZrVaL1+ulXq8/5TR0u92kUikkSaLX69Htdj/MfXk7/cRtrYALuIALuIALuIALuIAL+NfHD4n5lJDnxpNDAAAAAElFTkSuQmCC";
        }
    }

    render() {
        const { params, repos_status } = this.props;
        let owner = params.owner;
        let cur_time = new Date();

        let repos = repos_status.map(function(element,i){
            let repo_status = "unk";
            if(element['status']!=null)
                repo_status = element['status'];

            let repo_last_update_time = '未知';
            if(element['last_updated_time']!=null) {
                let last_updated_time = new Date(element['last_updated_time']);
                repo_last_update_time = OwnerApp.getDelayTime(last_updated_time, cur_time)
            }

            const image_style = {
                width: '40px',
                marginRight: '5px',
                display: 'block',
            };

            return (
                <a className="weui-cell" key={i} href={ "/" + owner + "/" + repo_status['repo'] }>
                    <div className="weui-cell__hd">
                        <img src={OwnerApp.getStatusBackgroundImage(repo_status)}
                             alt="icon" style={image_style} />
                    </div>
                    <div className="weui-cell__bd weui-cell_primary">
                        <p>{ element['repo'] }</p>
                    </div>
                    <div className="weui-cell__ft">
                        { repo_last_update_time}
                    </div>
                </a>
            )
        });

        return (
            <div>
                <h1 className="page_title"><a href={ "/" + owner } >{ owner }</a></h1>
                <div className="weui-cells weui-cells_access">
                    { repos }
                </div>
            </div>
        );
    }
}

OwnerApp.propTypes = {
    repos_status: PropTypes.arrayOf(PropTypes.shape({
        last_updated_time: PropTypes.string,
        owner: PropTypes.string,
        repo: PropTypes.string,
    }))
};

function mapStateToProps(state){
    return {
        repos_status: state.operation_system.owner.repos_status
    }
}

export default connect(mapStateToProps)(OwnerApp)