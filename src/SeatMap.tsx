import React from 'react';

import { config } from './Config';
import { getUserPresence } from './GraphService';
import withAuthProvider, { AuthComponentProps } from './AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';

import { Circle, ImageOverlay, MapContainer, Popup, Tooltip } from 'react-leaflet';


interface SeatMapState {
  eventsLoaded: boolean;
  events: { [key: string]: string };
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

    return (
      <><div>
        <MapContainer center={[320, 340]} zoom={0} scrollWheelZoom={true} style={{ height: "800px", width: "auto" }} maxBounds={imageBounds} bounds={imageBounds} crs={L.CRS.Simple}>
          <ImageOverlay url="images/seat_map.svg" bounds={imageBounds}></ImageOverlay>
          <Circle
            key="test"
            center={[109, 80]}
            fillColor="blue"
            radius={25} >
            <Tooltip key="test" permanent={true} direction={"center"} offset={[0, 0]} ><span>佐藤</span></Tooltip>
            <Popup>佐藤です。</Popup>

          </Circle>

          <Circle
            key="test"
            center={[109, 160]}
            fillColor="red"
            pathOptions={{ "color": "red" }}
            radius={25} >

            <Tooltip key="test" permanent={true} direction={"center"} >田中</Tooltip>
          </Circle>

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
