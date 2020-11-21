import React from 'react';

import { authConfig } from '../config/AuthConfig';
import { getUserPresence, Presence } from '../GraphService';
import withAuthProvider, { AuthComponentProps } from '../AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';

import { Circle, CircleProps, ImageOverlay, MapContainer, Popup, Tooltip } from 'react-leaflet';
import { UserInfo, UserStatus } from './SeatMap';






export class UserPresence extends React.Component<UserInfo, UserStatus> {

    circleRef?: React.RefObject<any> = React.createRef();
    circleColor: string = "grey";
    constructor(props: any) {
        super(props);
        this.state = {
            availability: "Offline",
            activity: "Offline"
        }

    }

    async componentDidUpdate() {

        if (this.props && !this.props.dataLoaded) {

        }
    }

    async setPresence(presence: Presence) {
        this.setState({
            availability: presence.availability,
            activity: presence.activity
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
        return (
            <Circle
                ref={this.circleRef}
                key="persence"
                center={[this.props.seatPosition.y, this.props.seatPosition.x]}
                fillColor={this.circleColor}
                color={this.circleColor}
                radius={25} >
                <Tooltip key="persence" permanent={true} direction={"center"} offset={[0, 0]} >{this.props.displayName}</Tooltip>
                <Popup>
                    <h3>{this.props.userDetail?.fullname}</h3>
                    <table style={{ alignItems: "end" }}>
                        <tr>
                            <td>状態:</td> <td>{this.state.availability}</td>
                        </tr>
                        {this.state.availability !== this.state.activity ?
                            (<tr>
                                <td>詳細:</td> <td>{this.state.activity}</td>
                            </tr>) : null
                        }

                    </table>
                </Popup>
            </Circle>
        );
    }
    // </renderSnippet>
}

