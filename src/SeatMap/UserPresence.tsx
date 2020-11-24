import { Tooltip as ReactTooltip } from '@material-ui/core';
import MailOutline from '@material-ui/icons/MailOutline';
import { Agenda, Person } from '@microsoft/mgt-react';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { Circle, Popup, Tooltip } from 'react-leaflet';
import { getUserPhoto, Presence } from '../GraphService';
import { UserInfo, UserStatus } from './SeatMap';
import './SeatMap.css';
import './UserPresence.css';
// import ReactTooltip from 'react-tooltip';

interface UserPresenceProps {
    key: string;
    accessToken: string;
    userInfo: UserInfo,
}

interface UserPresenceState {
    userStatus: UserStatus,
    userPhoto?: object;
}



export class UserPresence extends React.Component<UserPresenceProps, UserPresenceState> {

    circleRef?: React.RefObject<any> = React.createRef();
    circleColor: string = "grey";
    constructor(props: any) {
        super(props);
        this.state = {
            userStatus: {
                availability: "Offline",
                activity: "Offline"
            }
        }

    }

    async componentDidUpdate() {

        if (this.props && !this.props.userInfo.dataLoaded) {

        }
    }

    async updatePresence(presence: Presence) {
        if (this.state.userStatus.activity !== presence.activity || this.state.userStatus.availability !== presence.availability) {
            this.setPresence(presence)
        }
    }
    async setPresence(presence: Presence) {
        this.setState({
            userStatus: {
                availability: presence.availability,
                activity: presence.activity
            }
        })
        switch (presence.availability) {
            case "Available":
                this.circleColor = "green"
                break;
            case "Away":
                this.circleColor = "yellow"
                break;

            case "Offline":
            case "PresenceUnknown":
                this.circleColor = "grey"
                break;
            default:
                this.circleColor = "red"
                break;
        }
        this.circleRef?.current.setStyle({
            color: this.circleColor,
            fillColor: this.circleColor,
        })
    }





    // <renderSnippet>
    render() {



        const center: [number, number] = [this.props.userInfo.seatPosition.y, this.props.userInfo.seatPosition.x]
        const eventStartTime = new Date();
        const eventEndTime = new Date();
        eventEndTime.setDate(eventStartTime.getDate() + 3)
        return (
            <Circle
                ref={this.circleRef}
                key="persence"
                center={center}
                fillColor={this.circleColor}
                color={this.circleColor}
                radius={25}
            >
                <Tooltip key="persence" permanent={true} direction={"center"} offset={[0, 0]} >{this.props.userInfo.displayName}</Tooltip>
                <Popup maxWidth={500}>
                    <div style={{ flex: "auto", height: "200px", width: "380px" }}>
                        <div style={{ display: "flex-inline", float: "left", width: "150px" }}>
                            {this.props.userInfo.userDetail?.dept ?
                                <div className="sub-title">{this.props.userInfo.userDetail.dept}</div> :
                                null}
                            <h3 className="title">{this.props.userInfo.userDetail?.fullname}</h3>
                            <div className="user-badge">
                                <LazyLoadComponent>
                                    <UserPhoto token={this.props.accessToken} id={this.props.userInfo.id} userName={this.props.userInfo.displayName} />
                                </LazyLoadComponent>
                            </div>
                            <table className="user-info-table">
                                <tbody>
                                    <tr>
                                        <th>状態:</th> <td>{this.state.userStatus.availability}</td>
                                    </tr>
                                    {this.state.userStatus.availability !== this.state.userStatus.activity ?
                                        (<tr>
                                            <th>詳細:</th> <td>{this.state.userStatus.activity}</td>
                                        </tr>) : null
                                    }
                                </tbody>
                            </table>
                            <div className="action-list">
                                <ReactTooltip title={<h6>Teamsでチャットする</h6>}>
                                    <a target="_blank"
                                        href={`https://teams.microsoft.com/l/chat/0/0?users=${this.props.userInfo.mail}`}
                                    >
                                        <img src="icons/Teams-24x24.png" />
                                    </a>
                                </ReactTooltip>
                                <ReactTooltip title={<h6>メールする</h6>} >
                                    <a target="_blank"
                                        href={`mailto:${this.props.userInfo.mail}`}
                                        data-tip="メールする"
                                    >
                                        <MailOutline />
                                    </a>
                                </ReactTooltip>
                            </div>
                        </div>
                        <div style={{
                            display: "flex-inline", float: "right", height: "200px", width: "230px", padding: "5px", overflowY: "auto"
                        }}>
                            <h6>Schedule:</h6>
                            <Agenda groupByDay={true} eventQuery={`/users/${this.props.userInfo.id}/calendarview?$orderby=start/dateTime&startdatetime=${eventStartTime.toUTCString()}&enddatetime=${eventEndTime.toUTCString()}` + " | calendars.read calendars.read.shared"}>
                            </Agenda>
                        </div>
                    </div>
                </Popup >
            </Circle >
        );
    }
    // </renderSnippet>
}


export class UserPhoto extends React.Component<{ token: string, id: string, userName: string }> {
    state: {
        loading: boolean,
        image: any;
    }
    constructor(props: { token: string; id: string; userName: string; } | Readonly<{ token: string; id: string; userName: string; }>) {
        super(props);
        this.state = { loading: true, image: null };
    };
    componentWillMount() {
        getUserPhoto(this.props.token, this.props.id)
            .then(response => {
                if (response != null) {
                    var url = window.URL || window.webkitURL;
                    let src = url.createObjectURL(response);
                    this.setState({ loading: false, image: src })
                }
                else {
                    this.setState({ loading: false, image: null });
                }
            })
            .catch(response => {
                this.setState({ loading: false, image: null });
            });
    }

    render() {
        if (this.state.image === null) {
            return <div className="icon"><a>{this.props.userName}</a></div>;
        }
        return (
            <img src={this.state.image} className="icon" />
        );
    }
}
