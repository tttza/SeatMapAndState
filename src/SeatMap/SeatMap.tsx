import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { Circle, ImageOverlay, MapContainer, Tooltip } from 'react-leaflet';
import { Spinner } from 'reactstrap';
import withAuthProvider, { AuthComponentProps } from '../AuthProvider';
import { authConfig } from '../config/AuthConfig';
import { userTargetConfig } from '../config/UserTargetConfig';
import { getUsersDetails, getUsersPresence, Presence } from '../GraphService';
import './SeatMap.css';
import { SeatPositionService } from './SeatPositionService';
import { UserPresence } from './UserPresence';




interface SeatMapState {
  presenceLoaded: boolean;

  lastUpdated?: Date;

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
  phone?: string;
}

export interface UserInfo {
  dataLoaded: boolean;
  id: string;
  displayName: string;

  mail: string;

  seatId: string;

  userDetail?: UserDefailInfo;
  seatPosition: SeatPosition;

}



class SeatMap extends React.Component<AuthComponentProps, SeatMapState> {
  private presenceRefs: { [id: string]: React.RefObject<UserPresence> } = {};
  private seatPositionService: SeatPositionService;
  private accessToken: string = "";
  users: UserInfo[] = [];
  interval: NodeJS.Timeout | undefined;
  usersPresence: Presence[] = [];
  constructor(props: any) {
    super(props);
    this.state = {
      presenceLoaded: false,
      lastUpdated: undefined
    };
    this.seatPositionService = new SeatPositionService(null);
  }


  async componentDidMount() {
    this.accessToken = await this.props.getAccessToken(authConfig.scopes);
    let usersEmail = userTargetConfig.map(user => user.email)
    var users = await getUsersDetails(this.accessToken, usersEmail)
    users.forEach(user => user.id.match("@") ? console.warn("Not found: " + user.id) : null)
    users = users.filter(user => !user.id.match("@"))

    users.forEach((user) => {
      const seatId = userTargetConfig.find(u => u.email === user.mail)?.seat;
      if (seatId == null) { return; }
      const seatPosition = this.seatPositionService.getSeatPosition(seatId);
      if (seatPosition == null) { return; }
      this.users.push({
        dataLoaded: false,
        id: user.id,
        displayName: user.surname,
        seatPosition: seatPosition,
        userDetail: {
          fullname: user.displayName,
        }
      } as UserInfo)
      this.presenceRefs[user.id] = React.createRef()
      return;
    })
    this.updateUserPresence()
    this.interval = setInterval(async () => { await this.updateUserPresence(); }, 5000);
  }

  async updateUserPresence() {
    try {
      this.usersPresence = await getUsersPresence(this.accessToken, this.users.map(user => user.id));
      this.setState({
        presenceLoaded: true,
        lastUpdated: new Date()
      })
    }
    catch (err) { this.props.setError('ERROR', JSON.stringify(err)) };
  }
  async componentDidUpdate() {
    if (this.state.presenceLoaded) {
      this.usersPresence.forEach(presence => {
        this.presenceRefs[presence.id].current?.updatePresence(presence)
      })
    }
  }

  async componentWillUnmount() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
  }


  // <renderSnippet>
  render() {
    const L = require("leaflet");
    var imageBounds: [number, number][] = [[0, 0], [680, 640]];


    return (
      <>
        <div>

          <MapContainer
            center={[320, 340]}
            zoom={0}
            scrollWheelZoom={true}
            attributionControl={false}
            style={{ height: "800px", width: "100%", zIndex: 0 }}
            maxBounds={imageBounds}
            bounds={imageBounds}
            crs={L.CRS.Simple}>

            <ImageOverlay url="images/seat_map.svg" bounds={imageBounds}></ImageOverlay>
            {this.users.map((preference: UserInfo) => {
              return (
                <UserPresence key={preference.id} accessToken={this.accessToken} userInfo={preference} ref={this.presenceRefs[preference.id]}></UserPresence>
              );
            })}


            <Circle
              key="test"
              center={[109, 280]}
              fillColor="red"
              pathOptions={{ "color": "red" }}
              radius={25}>
              <Tooltip key="test" permanent={true} direction={"center"}>佐藤畑</Tooltip>
            </Circle>
            {!this.state.presenceLoaded ? (
              <div style={{ float: "right" }}>
                <Spinner />
              </div>
            ) : null}
          </MapContainer>

        </div>
        <IconButton size="small" onClick={async () => { await this.updateUserPresence() }}>
          <RefreshIcon fontSize="inherit" />
          最終更新時刻: {this.state.lastUpdated?.toLocaleString()}
        </IconButton>
      </>
    );
  }
  // </renderSnippet>
}

export default withAuthProvider(SeatMap);
