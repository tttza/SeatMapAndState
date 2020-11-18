import React from 'react';

import { config } from '../Config';
import { getUserPresence } from '../GraphService';
import withAuthProvider, { AuthComponentProps } from '../AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';

import { Circle, ImageOverlay, MapContainer, Popup, Tooltip } from 'react-leaflet';
import { UserInfo, UserStatus } from './SeatMap';






export class UserPresence extends React.Component<UserInfo, UserStatus> {
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

    // <renderSnippet>
    render() {
        return (
            <div>
                <Circle
                    key="persence"
                    center={[this.props.seatPosition.x, this.props.seatPosition.y]}
                    fillColor="blue"
                    radius={25} >
                    <Tooltip key="persence" permanent={true} direction={"center"} offset={[0, 0]} >{this.props.displayName}</Tooltip>
                    <Popup>{this.props.displayName}です。</Popup>
                </Circle>
            </div>
        );
    }
    // </renderSnippet>
}

