import React from 'react';

import { authConfig } from '../config/AuthConfig';
import { userTargetConfig } from '../config/UserTargetConfig';
import { getUsersDetails, getUsersPresence, Presence } from '../GraphService';
import withAuthProvider, { AuthComponentProps } from '../AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';

import { Circle, ImageOverlay, MapContainer, Tooltip } from 'react-leaflet';
import { UserPresence } from './UserPresence';
import { SeatPositionService } from './SeatPositionService'
import { userInfo } from 'os';

interface SeatMapState {
  presenceLoaded: boolean;

  usersPresence: Array<Presence>;
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

  id: string;
  displayName: string;

  email: string;

  seatId: string;

  userDetail?: UserDefailInfo;
  seatPosition: SeatPosition;

}



class SeatMap extends React.Component<AuthComponentProps, SeatMapState> {
  presence0: React.RefObject<UserPresence>;
  seatPositionService: SeatPositionService;

  private accessToken: string = "";
  users: UserInfo[] = [];
  constructor(props: any) {
    super(props);
    this.state = {
      presenceLoaded: false,
      usersPresence: []
    };
    this.seatPositionService = new SeatPositionService(null);
    this.presence0 = React.createRef();
  }

  async componentDidMount() {
    this.accessToken = await this.props.getAccessToken(authConfig.scopes);
    let usersEmail = userTargetConfig.map(user => user.email)
    var users = await getUsersDetails(this.accessToken, usersEmail)
    users.forEach(user => user.id.match("@") ? console.warn("Not found: " + user.id) : null)
    users = users.filter(user => !user.id.match("@"))

    users.forEach(async (user) => {
      const seatId = userTargetConfig.find(u => u.email === user.mail)?.seat;
      if (seatId == null) { return; }
      const seatPosition = await this.seatPositionService.getSeatPosition(seatId);
      if (seatPosition == null) { return; }
      this.users.push({
        dataLoaded: false,
        id: user.id,
        displayName: user.surname,
        seatPosition: seatPosition
      } as UserInfo)
    })
  }

  async componentDidUpdate() {
    if (this.props.user && !this.state.presenceLoaded) { }
    try {
      // Get the user's access token
      var usersPresence = await getUsersPresence(this.accessToken, this.users.map(user => user.id));
      this.setState({
        presenceLoaded: true,
        usersPresence: usersPresence
      })
      this.presence0.current?.setPresence(this.state.usersPresence[0])

    }
    catch (err) { this.props.setError('ERROR', JSON.stringify(err)) };
  }



  // <renderSnippet>
  render() {
    const L = require("leaflet");
    var imageBounds: [number, number][] = [[0, 0], [680, 640]];


    // var userPresence: UserInfo = {
    //   dataLoaded: true,
    //   displayName: "佐藤",
    //   seatPosition: {
    //     x: 109,
    //     y: 80
    //   }
    // }

    // var userPresence1: UserInfo = {
    //   dataLoaded: true,
    //   displayName: "田中",
    //   seatPosition: {
    //     x: 109,
    //     y: 160
    //   }
    // }

    // const UsersPreference = (preferences) => {
    //   return
    // };


    return (
      <><div>
        <MapContainer center={[320, 340]} zoom={0} scrollWheelZoom={true} style={{ height: "800px", width: "auto" }} maxBounds={imageBounds} bounds={imageBounds} crs={L.CRS.Simple}>
          <ImageOverlay url="images/seat_map.svg" bounds={imageBounds}></ImageOverlay>
          {this.users.map((preference: UserInfo) => {
            return (
              <UserPresence {...preference}></UserPresence>
            )
          })}

          <Circle
            key="test"
            center={[109, 280]}
            fillColor="red"
            pathOptions={{ "color": "red" }}
            radius={25}>
            <Tooltip key="test" permanent={true} direction={"center"}>佐藤畑</Tooltip>
          </Circle>

        </MapContainer>
      </div>
        <div>
          <div>{JSON.stringify(this.state.usersPresence[0])}</div>
          <div>{JSON.stringify(this.state.usersPresence[1])}</div>
        </div></>
    );
  }
  // </renderSnippet>
}

export default withAuthProvider(SeatMap);
