import React from 'react';

import { config } from '../Config';
import { getUserPresence } from '../GraphService';
import withAuthProvider, { AuthComponentProps } from '../AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';

import { Circle, ImageOverlay, MapContainer, Popup, Tooltip } from 'react-leaflet';
import { UserPresence } from './UserPresence';


interface SeatMapState {
  eventsLoaded: boolean;
  events: { [key: string]: string };
}

export interface UserStatus {
  availability: string,
  activity: string,
}

export interface SeatPosition {
  x: number,
  y: number
}

interface UserDefailInfo {
  fullname?: string;
  mail?: string;
  phone?: string;
}

export interface UserInfo {
  dataLoaded: boolean;

  displayName: string;

  userDetail?: UserDefailInfo;
  seatPosition: SeatPosition;

}



class SeatMap extends React.Component<AuthComponentProps, SeatMapState> {
  map: any;
  constructor(props: any) {
    super(props);
    this.state = {
      eventsLoaded: false,
      events: {}
    };
  }

  async componentDidUpdate() {
    if (this.props.user && !this.state.eventsLoaded) {
      try {
        // Get the user's access token
        var accessToken = await this.props.getAccessToken(config.scopes);

        // Get the user's events
        var events = await getUserPresence(accessToken, this.props.user.timeZone);
        this.setState({
          eventsLoaded: true,
          events: events
        })

      }
      catch (err) {
        this.props.setError('ERROR', JSON.stringify(err));
      }
    }
  }

  // <renderSnippet>
  render() {
    const L = require("leaflet");
    var imageBounds: [number, number][] = [[0, 0], [680, 640]];

    var userPresence: UserInfo = {
      dataLoaded: true,
      displayName: "佐藤",
      seatPosition: {
        x: 109,
        y: 80
      }
    }
    var status: UserStatus = {
      "availability": "DoNotDisturb",
      "activity": "Presenting"
    }

    var userPresence1: UserInfo = {
      dataLoaded: true,
      displayName: "田中",
      seatPosition: {
        x: 109,
        y: 160
      }
    }
    var status1: UserStatus = {
      "availability": "Available",
      "activity": "Available"
    }


    return (
      <><div>
        <MapContainer center={[320, 340]} zoom={0} scrollWheelZoom={true} style={{ height: "800px", width: "auto" }} maxBounds={imageBounds} bounds={imageBounds} crs={L.CRS.Simple}>
          <ImageOverlay url="images/seat_map.svg" bounds={imageBounds}></ImageOverlay>
          <UserPresence {...userPresence}></UserPresence>
          <UserPresence {...userPresence1}></UserPresence>

          <Circle
            key="test"
            center={[109, 280]}
            fillColor="red"
            pathOptions={{ "color": "red" }}
            radius={25} >
            <Tooltip key="test" permanent={true} direction={"center"} >佐藤畑</Tooltip>
          </Circle>

        </MapContainer>
      </div>
        <div>
          <div>{JSON.stringify(this.state.events["availability"])}</div>
          <div>{JSON.stringify(this.state.events["activity"])}</div>
        </div></>
    );
  }
  // </renderSnippet>
}

export default withAuthProvider(SeatMap);
