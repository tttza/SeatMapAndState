import 'leaflet/dist/leaflet.css';
import React from 'react';
import { Circle, CircleMarker, Marker, Popup, Tooltip } from 'react-leaflet';
import { getUserPhoto, Presence } from '../GraphService';
import { UserInfo, UserStatus } from './SeatMap';
import './SeatMap.css';
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import './UserPresence.css'

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
                <Popup>
                    <h3 className="title">{this.props.userInfo.userDetail?.fullname}</h3>
                    <div className="user-badge">
                        <LazyLoadComponent>
                            <UserPhoto token={this.props.accessToken} id={this.props.userInfo.id} userName={this.props.userInfo.displayName} />
                        </LazyLoadComponent>
                    </div>
                    <table className="user-info-table">
                        <tr>
                            <th>状態:</th> <td>{this.state.userStatus.availability}</td>
                        </tr>
                        {this.state.userStatus.availability !== this.state.userStatus.activity ?
                            (<tr>
                                <th>詳細:</th> <td>{this.state.userStatus.activity}</td>
                            </tr>) : null
                        }
                    </table>
                </Popup >
            </Circle>
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
